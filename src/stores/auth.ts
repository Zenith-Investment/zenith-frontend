import { create } from "zustand";
import { persist } from "zustand/middleware";
import api, { setAccessToken } from "@/lib/api";

// Helper to set cookie (for middleware compatibility)
function setAuthCookie(accessToken: string | null) {
  if (typeof document === "undefined") return;

  if (accessToken) {
    // Set cookie with the auth state that middleware expects
    const authState = JSON.stringify({ state: { accessToken } });
    document.cookie = `auth-storage=${encodeURIComponent(authState)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    // Remove cookie
    document.cookie = "auth-storage=; path=/; max-age=0";
  }
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  subscription_plan: "starter" | "smart" | "pro" | "premium";
  created_at: string;
  updated_at: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  cpf?: string;
  phone?: string;
  accepted_terms: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (accessToken, refreshToken) => {
        setAccessToken(accessToken);
        setAuthCookie(accessToken); // Set cookie for middleware
        localStorage.setItem("refresh_token", refreshToken);
        set({ accessToken, refreshToken, isAuthenticated: true });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post("/auth/login", { email, password });
          const { access_token, refresh_token } = response.data;

          get().setTokens(access_token, refresh_token);
          await get().fetchUser();
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          await api.post("/auth/register", data);
          // After registration, login automatically
          await get().login(data.email, data.password);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        setAccessToken(null);
        setAuthCookie(null); // Clear cookie for middleware
        localStorage.removeItem("refresh_token");
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      fetchUser: async () => {
        try {
          const response = await api.get("/users/me");
          set({ user: response.data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, sync the access token with API client
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
        }
      },
    }
  )
);
