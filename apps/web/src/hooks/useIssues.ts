import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { Issue } from "@issue-tracker/types";
import type {
  CreateIssueData,
  UpdateIssueData,
  IssueFilters,
  ApiResponse,
  PaginatedApiResponse,
  IssueStatus,
  IssuePriority,
} from "@/types";

export type { IssueStatus, IssuePriority, Issue, IssueFilters };

export function useIssuesByOrganization(
  orgId: string | null,
  filters?: IssueFilters
) {
  return useQuery<Issue[]>({
    queryKey: ["issues", orgId, filters],
    queryFn: async () => {
      if (!orgId) return [];

      const params = new URLSearchParams();
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.assigneeId) params.append("assigneeId", filters.assigneeId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.dueDateFrom)
        params.append("dueDateFrom", filters.dueDateFrom);
      if (filters?.dueDateTo) params.append("dueDateTo", filters.dueDateTo);

      const queryString = params.toString();
      const url = `/issues/organization/${orgId}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiClient.get<PaginatedApiResponse<Issue>>(
        url,
        true
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!orgId,
    placeholderData: keepPreviousData,
  });
}

export function useIssue(orgId: string | null, issueId: string | null) {
  return useQuery<Issue>({
    queryKey: ["issue", orgId, issueId],
    queryFn: async () => {
      if (!orgId || !issueId) throw new Error("No orgId or issueId");
      const response = await apiClient.get<ApiResponse<Issue>>(
        `/issues/organization/${orgId}/${issueId}`,
        true
      );
      return response.data;
    },
    enabled: !!orgId && !!issueId,
  });
}

export function useCreateIssue(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIssueData) => {
      const response = await apiClient.post<ApiResponse<Issue>>(
        `/issues/organization/${orgId}`,
        data,
        true
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", orgId] });
    },
  });
}

export function useUpdateIssue(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      issueId,
      data,
    }: {
      issueId: string;
      data: UpdateIssueData;
    }) => {
      const response = await apiClient.put<ApiResponse<Issue>>(
        `/issues/organization/${orgId}/${issueId}`,
        data,
        true
      );
      return response.data;
    },
    onMutate: async ({ issueId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["issues", orgId] });

      const previousIssues = queryClient.getQueryData<Issue[]>([
        "issues",
        orgId,
      ]);

      if (previousIssues) {
        queryClient.setQueryData<Issue[]>(
          ["issues", orgId],
          (old) =>
            old?.map((issue) =>
              issue.id === issueId ? ({ ...issue, ...data } as Issue) : issue
            ) ?? []
        );
      }

      return { previousIssues };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues", orgId], context.previousIssues);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", orgId] });
      queryClient.invalidateQueries({ queryKey: ["issue"] });
    },
  });
}

export function useUpdateIssueStatus(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      issueId,
      status,
    }: {
      issueId: string;
      status: IssueStatus;
    }) => {
      const response = await apiClient.put<ApiResponse<Issue>>(
        `/issues/organization/${orgId}/${issueId}`,
        { status },
        true
      );
      return response.data;
    },
    onMutate: async ({ issueId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["issues", orgId] });

      const previousIssues = queryClient.getQueryData<Issue[]>([
        "issues",
        orgId,
      ]);

      if (previousIssues) {
        queryClient.setQueryData<Issue[]>(
          ["issues", orgId],
          (old) =>
            old?.map((issue) =>
              issue.id === issueId ? { ...issue, status } : issue
            ) ?? []
        );
      }

      return { previousIssues };
    },
    onError: (err, variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues", orgId], context.previousIssues);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", orgId] });
    },
  });
}

export function useDeleteIssue(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issueId: string) => {
      await apiClient.delete(`/issues/organization/${orgId}/${issueId}`, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", orgId] });
    },
  });
}

export function useReorderIssue(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      issueId,
      status,
      position,
    }: {
      issueId: string;
      status: IssueStatus;
      position: number;
    }) => {
      const response = await apiClient.put<ApiResponse<Issue>>(
        `/issues/organization/${orgId}/${issueId}`,
        { status, position },
        true
      );
      return response.data;
    },
    onMutate: async ({ issueId, status, position }) => {
      await queryClient.cancelQueries({ queryKey: ["issues", orgId] });

      const previousIssues = queryClient.getQueryData<Issue[]>([
        "issues",
        orgId,
      ]);

      if (previousIssues) {
        const movedIssue = previousIssues.find((i) => i.id === issueId);
        if (!movedIssue) return { previousIssues };

        const oldStatus = movedIssue.status;
        const newStatus = status;

        let updatedIssues = [...previousIssues];
        updatedIssues = updatedIssues.filter((i) => i.id !== issueId);

        const targetColumnIssues = updatedIssues
          .filter((i) => i.status === newStatus)
          .sort((a, b) => a.position - b.position);

        const clampedPosition = Math.min(position, targetColumnIssues.length);
        targetColumnIssues.splice(clampedPosition, 0, {
          ...movedIssue,
          status: newStatus,
          position: clampedPosition,
        });

        targetColumnIssues.forEach((issue, idx) => {
          issue.position = idx;
        });

        if (oldStatus !== newStatus) {
          const sourceColumnIssues = updatedIssues
            .filter((i) => i.status === oldStatus)
            .sort((a, b) => a.position - b.position);

          sourceColumnIssues.forEach((issue, idx) => {
            issue.position = idx;
          });
        }

        const otherIssues = updatedIssues.filter(
          (i) => i.status !== newStatus && i.status !== oldStatus
        );
        const finalIssues = [...targetColumnIssues, ...otherIssues];

        if (oldStatus !== newStatus) {
          const sourceColumnIssues = updatedIssues.filter(
            (i) => i.status === oldStatus
          );
          finalIssues.push(...sourceColumnIssues);
        }

        queryClient.setQueryData<Issue[]>(["issues", orgId], finalIssues);
      }

      return { previousIssues };
    },
    onError: (err, variables, context) => {
      // Revertir en caso de error
      if (context?.previousIssues) {
        queryClient.setQueryData(["issues", orgId], context.previousIssues);
      }
    },
    onSettled: () => {
      // Refrescar después de completar
      queryClient.invalidateQueries({ queryKey: ["issues", orgId] });
    },
  });
}
