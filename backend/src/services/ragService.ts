import { AIMessage, HumanMessage } from "langchain";
import { prisma } from "../utils/prismaClient.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

class RagService {
    async createChat(userId?: string) {
        const chat = await prisma.chat.create({
            data: userId ? { userId } : {}
        })
        return chat
    }

    async setMessages(chatId: string, content: string, role = "user") {
        try {
            const message = await prisma.message.create({
                data: {
                    role: role,
                    content: content,
                    chatId
                }
            })

            // Auto-generate title if this is the first user message
            if (role === "user") {
                const chat = await prisma.chat.findUnique({
                    where: { id: chatId },
                    include: {
                        messages: {
                            orderBy: { createdAt: "asc" }
                        }
                    }
                })
                if (chat && chat.messages.length <= 1 && (!chat.title || chat.title.trim() === "")) {
                    const title = content.length > 40 ? content.substring(0, 37) + "..." : content;
                    await prisma.chat.update({
                        where: { id: chatId },
                        data: { title }
                    })
                }
            }
            return message
        } catch (error) {
            console.log(error);
        }
    }

    async getMessages(chatId: string) {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        })

        const messages = chat?.messages?.map((msg) => msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)) ?? []
        return messages
    }

    async getUserChats(userId: string) {
        const chats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: "asc" }
                }
            }
        })
        return chats
    }

    async deleteChat(chatId: string, userId: string) {
        const chat = await prisma.chat.findFirst({
            where: { id: chatId, userId }
        })
        if (!chat) return false
        await prisma.chat.delete({
            where: { id: chatId }
        })
        return true
    }

    async createChunkDocs(text: any, fileOriginalName: string, userId?: string) {
         const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50
        })
        const chunks = await splitter.splitText(text)
        const docs = chunks.map(
            (chunk, index) =>
                new Document({
                    pageContent: chunk,
                    metadata: {
                        source: fileOriginalName,
                        chunkIndex: index,
                        ...(userId ? { userId } : {})
                    },
                })
        );
        return docs
    }
}

export const rag = new RagService();