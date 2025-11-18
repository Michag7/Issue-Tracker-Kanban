import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { IssueHistoryEntry } from "@issue-tracker/types";
import type { ApiResponse } from "@/types";

export function useIssueHistory(orgId: string | null, issueId: string | null) {
  return useQuery<IssueHistoryEntry[]>({
    queryKey: ["issue-history", orgId, issueId],
    queryFn: async () => {
      if (!orgId || !issueId) return [];
      const response = await apiClient.get<{
        success: boolean;
        data: IssueHistoryEntry[];
      }>(`/issues/organization/${orgId}/${issueId}/history`, true);
      return response.data;
    },
    enabled: !!orgId && !!issueId,
  });
}
