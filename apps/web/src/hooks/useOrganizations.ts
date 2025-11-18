import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useOrganization } from "@/contexts/OrganizationContext";
import type { Organization, OrganizationMember } from "@issue-tracker/types";
import type { ApiResponse, CreateOrganizationData } from "@/types";

interface MyOrganization extends Organization {
  userRole?: "ADMIN" | "MEMBER";
  memberCount?: number;
}

export function useOrganizations() {
  return useQuery<MyOrganization[]>({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<MyOrganization[]>>(
        "/organizations/my",
        true
      );
      return response.data;
    },
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationData) => {
      const response = await apiClient.post<ApiResponse<Organization>>(
        "/organizations",
        data,
        true
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

/**
 * Hook para establecer la organización activa
 * Llama al endpoint POST /organizations/:orgId/set-active
 */
export function useSetActiveOrganization() {
  const { setActiveOrgId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orgId: string) => {
      const response = await apiClient.post<
        ApiResponse<{ id: string; currentOrgId: string }>
      >(`/organizations/${orgId}/set-active`, {}, true);
      return response.data;
    },
    onSuccess: (data, orgId) => {
      // Actualizar contexto local
      setActiveOrgId(orgId);

      // Actualizar usuario en localStorage
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        userData.currentOrgId = orgId;
        localStorage.setItem("user", JSON.stringify(userData));
      }

      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useOrganizationMembers(orgId: string | null) {
  return useQuery<OrganizationMember[]>({
    queryKey: ["organization-members", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const response = await apiClient.get<ApiResponse<OrganizationMember[]>>(
        `/organizations/${orgId}/members`,
        true
      );
      return response.data;
    },
    enabled: !!orgId,
  });
}
