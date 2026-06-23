import { WebSocket } from "ws";
import type { IncomingMessage } from "http";
import url from "url";
import jwt from "jsonwebtoken";
import { agent } from "../agent/agent.js";
import { prisma } from "../utils/prismaClient.js";
import { rag } from "../services/ragService.js";
import { SystemMessage } from "@langchain/core/messages";

const JWT_SECRET = process.env.JWT_SECRET || "aether-jwt-secret-key-change-me-in-production";

export const handleWebSocketConnection = (ws: WebSocket, req: IncomingMessage) => {
    console.log("New WebSocket connection established");

    const parsedUrl = url.parse(req.url || "", true);
    const token = parsedUrl.query.token as string;

    if (!token) {
        ws.send(JSON.stringify({ type: "error", message: "Access token required in query parameter (?token=...)" }));
        ws.close(1008, "Policy Violation");
        return;
    }

    let userId: string;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
        userId = decoded.id;
    } catch (err) {
        ws.send(JSON.stringify({ type: "error", message: "Invalid or expired token" }));
        ws.close(1008, "Policy Violation");
        return;
    }

    ws.on("message", async (message: string) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === "chat") {
                let { query, chatId } = data;

                if (!query || typeof query !== "string") {
                    ws.send(JSON.stringify({ type: "error", message: "Query must be a valid string" }));
                    return;
                }

                let chat = null;
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

                if (chatId && uuidRegex.test(chatId)) {
                    try {
                        chat = await prisma.chat.findFirst({
                            where: { id: chatId, userId }
                        });
                    } catch (e) {
                        console.error("Error finding chat:", e);
                    }
                }

                if (!chat) {
                    chat = await prisma.chat.create({
                        data: { userId }
                    });
                    chatId = chat.id;
                    ws.send(JSON.stringify({ type: "chatId", chatId }));
                }

                await rag.setMessages(chatId, query);

                const history = (await rag.getMessages(chatId) ?? []).slice(-10);

                const systemMessage = new SystemMessage(
                    "You are Ved AI, an elite, highly professional enterprise assistant. Your core directive is to provide precise, structured, and action-oriented responses.\n\n" +
                    "### Operational Guidelines:\n\n" +
                    "1. **Knowledge Base Access (get_knowledge_base)**:\n" +
                    "   - You have access to the user's uploaded files (documents, PDFs, resumes, datasets) via the `get_knowledge_base` tool.\n" +
                    "   - Proactively search the knowledge base when queries refer to uploaded documents, resumes, policies, or context not present in the immediate chat history.\n" +
                    "   - When answering based on retrieved files, maintain high fidelity to the text. Do not assume or hallucinate. Politely state if the document does not contain the answer.\n\n" +
                    "2. **Web Search Access (web_search)**:\n" +
                    "   - You have access to the internet via the `web_search` tool to look up current, real-time, or latest information.\n" +
                    "   - Proactively use this tool when the query refers to current events, news, or any facts/topics outside your immediate knowledge or local knowledge base.\n" +
                    "   - Provide citations (URLs or sources) when using web search information.\n\n" +
                    "3. **Mathematical & Formula Calculations**:\n" +
                    "   - Always explain calculations step-by-step.\n" +
                    "   - Format equations cleanly using markdown bolding or math notation.\n" +
                    "   - Never output a raw, unformatted number. Highlight the final result.\n\n" +
                    "4. **Tone and Formatting**:\n" +
                    "   - Professional, objective, and clear. Avoid conversational filler.\n" +
                    "   - Use headings, bullet points, and tables to structure complex data.\n" +
                    "   - **CRITICAL**: Do not wrap entire paragraphs, large blocks of text, or lists/bullet points in bold markdown (**). Use bolding sparingly only to highlight specific terms or titles."
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
                            ws.send(JSON.stringify({ type: "content", content }));
                        }
                    }
                }

                await prisma.message.create({
                    data: {
                        role: "ai",
                        content: fullResponse,
                        chatId
                    }
                });

                ws.send(JSON.stringify({ type: "done" }));
            } else {
                ws.send(JSON.stringify({ type: "error", message: "Unknown request type" }));
            }
        } catch (error) {
            console.error("Error in WebSocket connection handler:", error);
            ws.send(JSON.stringify({
                type: "error",
                message: error instanceof Error ? error.message : String(error)
            }));
        }
    });

    ws.on("close", () => {
        console.log("WebSocket connection closed");
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });
};
