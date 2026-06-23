import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Response } from "express";
import path from "path";
import fs from "fs";
import { agent } from "../agent/agent.js";
import { SystemMessage } from "@langchain/core/messages";
import { rag } from "../services/ragService.js";
import { extractPdfText } from "../utils/pdfParser.js";
import { errorResponse, successResponse } from "../utils/responseHelper.js";
import { supabaseClient } from "../utils/supabase.js";
import { prisma } from "../utils/prismaClient.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const embeddings = new OpenAIEmbeddings({
    model: process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small",
    configuration: { baseURL: process.env.AI_ENDPOINT },
    apiKey: process.env.AI_API_KEY,
});

export const chatController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const userId = req.user?.id;
        let { query, chatId } = req.body;

        if (!userId) {
            return errorResponse(res, "User not authenticated", 401);
        }

        if (!chatId) {
            const newChat = await rag.createChat(userId);
            chatId = newChat.id;
            res.write(`data: ${JSON.stringify({ type: "chatId", chatId })}\n\n`);
        } else {
            const chat = await prisma.chat.findFirst({
                where: { id: chatId as string, userId }
            });
            if (!chat) {
                return errorResponse(res, "Access denied or chat not found", 403);
            }
        }

        await rag.setMessages(chatId, query);

        let history = (await rag.getMessages(chatId) ?? []).slice(-10);
        const systemMessage = new SystemMessage(
            "You are Aether AI, an elite, highly professional enterprise assistant. Your core directive is to provide precise, structured, and action-oriented responses.\n\n" +
            "### Operational Guidelines:\n\n" +
            "1. **Knowledge Base Access (get_knowledge_base)**:\n" +
            "   - You have access to the user's uploaded files (documents, PDFs, resumes, datasets) via the `get_knowledge_base` tool.\n" +
            "   - Proactively search the knowledge base when queries refer to uploaded documents, resumes, policies, or context not present in the immediate chat history.\n" +
            "   - When answering based on retrieved files, maintain high fidelity to the text. Do not assume or hallucinate. Politely state if the document does not contain the answer.\n\n" +
            "2. **Mathematical & Formula Calculations**:\n" +
            "   - Always explain calculations step-by-step.\n" +
            "   - Format equations cleanly using markdown bolding or math notation.\n" +
            "   - Never output a raw, unformatted number. Highlight the final result.\n\n" +
            "3. **Tone and Formatting**:\n" +
            "   - Professional, objective, and clear. Avoid conversational filler.\n" +
            "   - Use headings, bullet points, and tables to structure complex data."
        );

        const response = await agent.stream(
            { messages: [systemMessage, ...history] },
            {
                streamMode: "messages",
                configurable: { userId }
            }
        );

        let fullResponse = "";
        for await (const [messageChunk] of response) {
            const chunk = messageChunk as any;
            const isAI = chunk._getType?.() === "ai" ||
                chunk._type === "ai" ||
                (chunk.constructor && chunk.constructor.name.startsWith("AI"));
            const hasToolCalls = (chunk.tool_calls && chunk.tool_calls.length > 0) ||
                (chunk.additional_kwargs?.tool_calls && chunk.additional_kwargs.tool_calls.length > 0);

            if (isAI && !hasToolCalls) {
                const content = chunk.content;
                if (content && typeof content === "string") {
                    fullResponse += content;
                    res.write(`data: ${JSON.stringify(content)}\n\n`);
                }
            }
        }

        await rag.setMessages(chatId, fullResponse, "ai");
        res.end();
    } catch (error) {
        console.error("Error in chatController:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
};

const getTargetBucket = async (bucketName: string): Promise<string> => {
    try {
        const { data: buckets, error: listError } = await supabaseClient.storage.listBuckets();
        if (listError) {
            console.error("Error listing Supabase buckets:", listError);
            return bucketName; 
        }

        const matchedBucket = buckets?.find(b => b.name.toLowerCase() === bucketName.toLowerCase());
        if (matchedBucket) {
            return matchedBucket.name;
        }

        console.log(`Bucket '${bucketName}' not found. Attempting to create it...`);
        const { error: createError } = await supabaseClient.storage.createBucket(bucketName, {
            public: true,
        });

        if (createError) {
            console.error(`Failed to create bucket '${bucketName}':`, createError.message);
            const { error: createErrorLower } = await supabaseClient.storage.createBucket("public", {
                public: true,
            });
            if (!createErrorLower) {
                console.log("Created bucket 'public' successfully.");
                return "public";
            }
            console.error("Failed to create bucket 'public':", createErrorLower.message);
        } else {
            console.log(`Created bucket '${bucketName}' successfully.`);
            return bucketName;
        }
    } catch (err) {
        console.error("Error in getTargetBucket helper:", err);
    }
    return bucketName;
};

export const knowledgeBaseController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return errorResponse(res, "User not authenticated", 401);
        }

        if (!req.file?.path) {
            return res.status(400).json({ error: "File upload is required." })
        }

        const filePath = path.resolve(req.file.path)
        const text = await extractPdfText(filePath)
        const docs = await rag.createChunkDocs(text, req.file?.originalname, userId)

        const vectorStore = await SupabaseVectorStore.fromDocuments(
            docs,
            embeddings,
            {
                client: supabaseClient,
                tableName: "documents",
                queryName: "match_documents"
            }
        );

        const fileBuffer = fs.readFileSync(filePath);
        
        const targetBucket = await getTargetBucket("Public");
        const fileKey = `${userId}/${req.file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from(targetBucket)
            .upload(fileKey, fileBuffer, {
                contentType: "application/pdf",
                upsert: true,
            });

        if (uploadError) {
            console.error("Supabase Storage upload error:", uploadError);
            throw new Error(`Failed to upload document to Supabase Storage: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabaseClient.storage
            .from(targetBucket)
            .getPublicUrl(fileKey);

        try {
            fs.unlinkSync(filePath);
        } catch (unlinkErr) {
            console.warn("Failed to delete temporary local file:", unlinkErr);
        }

        successResponse(res, "Document uploaded successfully!", { 
            filename: req.file.originalname,
            publicUrl 
        });
    } catch (error) {
        if (req.file?.path) {
            try {
                const filePath = path.resolve(req.file.path);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (unlinkErr) {
                console.warn("Failed to delete temporary local file during error cleanup:", unlinkErr);
            }
        }
        console.error("Error in knowledgeBaseController:", error);
        errorResponse(res, error instanceof Error ? error.message : String(error), 500, error);
    }
};

export const getUserChatsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return errorResponse(res, "User not authenticated", 401);
        }

        const chats = await rag.getUserChats(userId);
        return successResponse(res, "User chats retrieved successfully", chats);
    } catch (error) {
        console.error("Error in getUserChatsController:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};

export const getChatMessagesController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const chatId = req.params.chatId;

        if (!userId) {
            return errorResponse(res, "User not authenticated", 401);
        }

        if (!chatId || typeof chatId !== "string") {
            return errorResponse(res, "Invalid or missing chat ID", 400);
        }

        const chat = await prisma.chat.findFirst({
            where: { id: chatId, userId },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!chat) {
            return errorResponse(res, "Chat not found or access denied", 404);
        }

        return successResponse(res, "Chat messages retrieved successfully", (chat as any).messages);
    } catch (error) {
        console.error("Error in getChatMessagesController:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};

export const deleteChatController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const chatId = req.params.chatId;

        if (!userId) {
            return errorResponse(res, "User not authenticated", 401);
        }

        if (!chatId || typeof chatId !== "string") {
            return errorResponse(res, "Invalid or missing chat ID", 400);
        }

        const deleted = await rag.deleteChat(chatId, userId);
        if (!deleted) {
            return errorResponse(res, "Chat not found or access denied", 404);
        }

        return successResponse(res, "Chat deleted successfully", null);
    } catch (error) {
        console.error("Error in deleteChatController:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};

export const getDocumentsController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return errorResponse(res, "User not authenticated", 401);
        }

        const documents = await prisma.$queryRaw<any[]>`
            SELECT 
                metadata->>'source' as filename,
                COUNT(*)::integer as "chunksCount"
            FROM documents
            WHERE metadata->>'userId' = ${userId}
            GROUP BY metadata->>'source'
            ORDER BY filename ASC
        `;

        return successResponse(res, "Documents retrieved successfully", documents);
    } catch (error) {
        console.error("Error in getDocumentsController:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};

export const deleteDocumentController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const filename = req.params.filename;

        if (!userId) {
            return errorResponse(res, "User not authenticated", 401);
        }

        if (!filename) {
            return errorResponse(res, "Filename is required", 400);
        }

        const targetBucket = await getTargetBucket("Public");
        const fileKey = `${userId}/${filename}`;
        const { data: deleteData, error: deleteError } = await supabaseClient.storage
            .from(targetBucket)
            .remove([fileKey]);

        if (deleteError) {
            console.error("Supabase Storage deletion error:", deleteError);
        }

        const result = await prisma.$executeRaw`
            DELETE FROM documents
            WHERE metadata->>'userId' = ${userId} AND metadata->>'source' = ${filename}
        `;

        return successResponse(res, "Document deleted successfully", { deletedCount: Number(result) });
    } catch (error) {
        console.error("Error in deleteDocumentController:", error);
        return errorResponse(res, error instanceof Error ? error.message : String(error), 500);
    }
};