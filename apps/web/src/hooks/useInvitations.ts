import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Invitation, OrgRole } from "@issue-tracker/types";
import type { ApiResponse } from "@/types";

export function useInvitations() {
  return useQuery<Invitation[]>({
    queryKey: ["invitations"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Invitation[]>>(
        "/invitations/my",
        true
      );
      return response.data;
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        `/invitations/${invitationId}/accept`,
        {},
        true
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        `/invitations/${invitationId}/reject`,
        {},
        true
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function useCreateInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; role: "ADMIN" | "MEMBER" }) => {
      const response = await apiClient.post<ApiResponse<Invitation>>(
        `/invitations/org/${orgId}`,
        data,
        true
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
