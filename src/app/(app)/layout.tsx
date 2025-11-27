"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/stores/auth";
import { WebSocketProvider } from "@/contexts/websocket-context";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, fetchUser, user, accessToken } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!isHydrated) return;

    if (!isAuthenticated && !accessToken) {
      router.push("/auth/login");
      return;
    }

    // Fetch user data if authenticated but user not loaded
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isHydrated, isAuthenticated, accessToken, user, fetchUser, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while checking auth
  if (!isAuthenticated && accessToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <WebSocketProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
      </div>
    </WebSocketProvider>
  );
}
