const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiClientOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Enviar refresh token en cookie
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      const newAccessToken = result.data.accessToken;

      if (newAccessToken) {
        localStorage.setItem("accessToken", newAccessToken);
        return newAccessToken;
      }

      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    // Agregar token de autenticación si es necesario
    if (requiresAuth) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: "include", // Incluir cookies en todas las peticiones
    };

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // Si el token expiró (401), intentar refrescar
      if (response.status === 401 && requiresAuth) {
        const newToken = await this.refreshAccessToken();

        if (newToken) {
          // Reintentar la petición con el nuevo token
          headers["Authorization"] = `Bearer ${newToken}`;
          config.headers = headers;
          response = await fetch(`${this.baseUrl}${endpoint}`, config);
        } else {
          // Si no se pudo refrescar, redirigir al login
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
          throw new Error("Session expired");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || errorData.message || "Request failed";
        const error = new Error(errorMessage) as Error & {
          statusCode: number;
          data: Record<string, unknown>;
        };
        error.statusCode = response.status;
        error.data = errorData;
        throw error;
      }

      return response.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", requiresAuth });
  }

  async post<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    requiresAuth = false
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async put<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    requiresAuth = false
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async delete<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", requiresAuth });
  }

  async patch<T>(
    endpoint: string,
    data?: Record<string, unknown> | unknown[],
    requiresAuth = false
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
