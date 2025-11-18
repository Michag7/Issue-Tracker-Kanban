import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Comment } from "@issue-tracker/types";
import type {
  CreateCommentData,
  UpdateCommentData,
  ApiResponse,
} from "@/types";

export function useComments(orgId: string | null, issueId: string | null) {
  return useQuery<Comment[]>({
    queryKey: ["comments", orgId, issueId],
    queryFn: async () => {
      if (!orgId || !issueId) return [];
      const response = await apiClient.get<ApiResponse<Comment[]>>(
        `/issues/organization/${orgId}/${issueId}/comments`,
        true
      );
      return response.data;
    },
    enabled: !!orgId && !!issueId,
  });
}

export function useCreateComment(orgId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const response = await apiClient.post<ApiResponse<Comment>>(
        `/issues/organization/${orgId}/${issueId}/comments`,
        data,
        true
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", orgId, issueId] });
    },
  });
}

export function useUpdateComment(orgId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: UpdateCommentData;
    }) => {
      const response = await apiClient.put<ApiResponse<Comment>>(
        `/issues/organization/${orgId}/comments/${commentId}`,
        data,
        true
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", orgId, issueId] });
    },
  });
}

export function useDeleteComment(orgId: string, issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await apiClient.delete(
        `/issues/organization/${orgId}/comments/${commentId}`,
        true
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", orgId, issueId] });
    },
  });
}
