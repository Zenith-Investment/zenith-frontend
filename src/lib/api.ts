import axios from "axios";

/**
 * Axios instance configured for the InvestAI Platform API
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor to add auth token to requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle auth errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth data
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a user-friendly error message from an API error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Extract message from API response
    const message = error.response?.data?.detail
      || error.response?.data?.message
      || error.response?.data?.error;

    if (typeof message === "string") {
      return message;
    }

    // Handle validation errors
    if (Array.isArray(message)) {
      return message.map((err) => err.msg || err.message).join(", ");
    }

    // Handle status-specific messages
    if (error.response?.status === 401) {
      return "Credenciais inválidas";
    }
    if (error.response?.status === 403) {
      return "Acesso negado";
    }
    if (error.response?.status === 404) {
      return "Recurso não encontrado";
    }
    if (error.response?.status === 500) {
      return "Erro interno do servidor";
    }

    return error.message || "Erro desconhecido";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro desconhecido";
}

/**
 * Get the current access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("access_token");
}

/**
 * Set the access token in localStorage
 */
export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("refresh_token");
}

/**
 * Set the refresh token in localStorage
 */
export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }
  if (token) {
    localStorage.setItem("refresh_token", token);
  } else {
    localStorage.removeItem("refresh_token");
  }
}

// Export as both named and default for compatibility
export { api };
export default api;
