import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { User } from "@issue-tracker/types";
import type { LoginCredentials, RegisterData } from "@/types";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    },
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(credentials),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed");

      return result.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["currentUser"], data.user);

      // Forzar recarga de la página para que AuthGuard detecte la autenticación
      window.location.href = "/dashboard";
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration failed");

      return result.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.setQueryData(["currentUser"], data.user);

      // Forzar recarga de la página para que AuthGuard detecte la autenticación
      window.location.href = "/dashboard";
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      // Limpiar inmediatamente sin esperar respuesta del servidor
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("activeOrgId");
      queryClient.clear();

      // Intentar notificar al servidor en background (no esperamos)
      try {
        await apiClient.post("/auth/logout", {}, false);
      } catch (error) {
        // Ignorar errores ya que el logout local ya se completó
        console.debug("Logout API call failed, but local logout succeeded");
      }
    },
    onSettled: () => {
      // Redirigir inmediatamente sin importar el resultado
      window.location.href = "/login";
    },
  });
}
