import { AxiosInstance } from "axios";

export interface ChatSession {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  chatId: string;
  response: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  documentId?: string;
}

export class RagApi {
  client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  /**
   * Send a query to the chat endpoint (HTTP fallback / non-streaming)
   */
  chat(query: string, chatId?: string) {
    return this.client.post<ChatResponse>("/rag/chat", { query, chatId });
  }

  /**
   * Upload a document (PDF) to the vector store
   */
  uploadDocument(formData: FormData) {
    return this.client.post<UploadResponse>("/rag/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Fetch all chat history sessions for the authenticated user
   */
  getChats() {
    return this.client.get<ChatSession[]>("/rag/chats");
  }

  /**
   * Fetch all messages inside a specific chat session
   */
  getChatMessages(chatId: string) {
    return this.client.get<ChatMessage[]>(`/rag/chats/${chatId}`);
  }

  /**
   * Delete a chat session and its associated messages
   */
  deleteChat(chatId: string) {
    return this.client.delete<{ success: boolean; message: string }>(`/rag/chats/${chatId}`);
  }
}

export default RagApi;
