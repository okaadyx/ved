import { api } from "@/services";
import { LoginRequest, RegisterRequest } from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Mutation for user login.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginRequest) => api.user.login(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Mutation for user registration.
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterRequest) => api.user.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Query to fetch the currently authenticated user profile.
 */
export function useUserQuery() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => api.user.user().then((res) => res.data.data.user),
    retry: false,
  });
}

export function useChatsQuery() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: () => api.rag.getChats().then((res) => res.data.data),
  });
}

/**
 * Query to fetch all messages in a specific chat session.
 */
export function useChatMessagesQuery(chatId: string | null) {
  return useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: () => {
      if (!chatId) return Promise.resolve([]);
      return api.rag.getChatMessages(chatId).then((res) => res.data.data);
    },
    enabled: !!chatId,
  });
}

/**
 * Mutation to delete a chat session.
 */
export function useDeleteChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => api.rag.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
}

/**
 * Mutation to upload a document (PDF) to the vector store.
 */
export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.rag.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

/**
 * Query to fetch all unique documents in the user's knowledge base.
 */
export function useDocumentsQuery() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => api.rag.getDocuments().then((res) => res.data.data),
  });
}

/**
 * Mutation to delete a document from the knowledge base.
 */
export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filename: string) => api.rag.deleteDocument(filename),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}
