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

export interface ChatsResponse {
  status: boolean;
  message: string;
  data: ChatSession[];
}

export interface ChatMessagesResponse {
  status: boolean;
  message: string;
  data: ChatMessage[];
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

  uploadDocument(formData: FormData) {
    return this.client.post<UploadResponse>("/rag/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data, headers) => {
        if (headers) {
          if (typeof headers.delete === "function") {
            headers.delete("content-type");
            headers.delete("Content-Type");
          } else {
            delete headers["content-type"];
            delete headers["Content-Type"];
          }
        }
        return data;
      },
    });
  }

  /**
   * Fetch all chat history sessions for the authenticated user
   */
  getChats() {
    return this.client.get<ChatsResponse>("/rag/chats");
  }

  /**
   * Fetch all messages inside a specific chat session
   */
  getChatMessages(chatId: string) {
    return this.client.get<ChatMessagesResponse>(`/rag/chats/${chatId}`);
  }

  /**
   * Delete a chat session and its associated messages
   */
  deleteChat(chatId: string) {
    return this.client.delete<{ success: boolean; message: string }>(`/rag/chats/${chatId}`);
  }

  /**
   * Fetch all documents in the user's knowledge base
   */
  getDocuments() {
    return this.client.get<DocumentsResponse>("/rag/documents");
  }

  /**
   * Delete a document from the user's knowledge base
   */
  deleteDocument(filename: string) {
    return this.client.delete<{ success: boolean; message: string }>(`/rag/documents/${encodeURIComponent(filename)}`);
  }
}

export interface DocumentInfo {
  filename: string;
  chunksCount: number;
}

export interface DocumentsResponse {
  status: boolean;
  message: string;
  data: DocumentInfo[];
}

export default RagApi;
