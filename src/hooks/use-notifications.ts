"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { api, getErrorMessage } from "@/lib/api";
import { useWebSocket, WebSocketMessage } from "@/contexts/websocket-context";

export interface Notification {
  type: "price_alert" | "portfolio_update" | "recommendation" | "system";
  title: string;
  message: string;
  data: Record<string, unknown>;
  timestamp?: Date;
}

// REST API types
export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: string;
  data: Record<string, unknown> | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationPreferences {
  email: {
    price_alerts: boolean;
    portfolio_updates: boolean;
    recommendations: boolean;
    community: boolean;
    news: boolean;
    daily_report: boolean;
    weekly_report: boolean;
  };
  push: {
    price_alerts: boolean;
    portfolio_updates: boolean;
    recommendations: boolean;
    community: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start: number;
    end: number;
  };
}

interface UseNotificationsOptions {
  onNotification?: (notification: Notification) => void;
  showToasts?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { showToasts = true, onNotification } = options;
  const { toast } = useToast();
  const { isConnected, subscribe } = useWebSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to notification messages
  useEffect(() => {
    const unsubscribe = subscribe("*", (message: WebSocketMessage) => {
      // Filter for notification types
      const notificationTypes = ["price_alert", "portfolio_update", "recommendation", "system"];
      if (!notificationTypes.includes(message.type)) return;

      const notification: Notification = {
        type: message.type as Notification["type"],
        title: message.title || "",
        message: message.message || "",
        data: (message.data as Record<string, unknown>) || {},
        timestamp: new Date(),
      };

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev].slice(0, 50));

      // Call custom handler
      onNotification?.(notification);

      // Show toast notification
      if (showToasts && notification.type !== "system") {
        toast({
          title: notification.title,
          description: notification.message,
          variant: "default",
        });
      }
    });

    return unsubscribe;
  }, [subscribe, onNotification, showToasts, toast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
  };
}

// REST API hook for notifications management
export function useNotificationsAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationList, setNotificationList] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const { toast } = useToast();

  // Fetch notifications list
  const fetchNotifications = useCallback(
    async (options: { unread_only?: boolean; type?: string; limit?: number; offset?: number } = {}) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (options.unread_only) params.append("unread_only", "true");
        if (options.type) params.append("type", options.type);
        if (options.limit) params.append("limit", options.limit.toString());
        if (options.offset) params.append("offset", options.offset.toString());

        const response = await api.get<{
          notifications: NotificationItem[];
          total: number;
          unread_count: number;
        }>(`/notifications/?${params.toString()}`);

        setNotificationList(response.data.notifications);
        setTotal(response.data.total);
        setUnreadCount(response.data.unread_count);
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao carregar notificacoes",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await api.post(`/notifications/${notificationId}/read`);
        setNotificationList((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return true;
      } catch (error) {
        toast({
          title: "Erro ao marcar como lida",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      setIsLoading(true);
      await api.post("/notifications/read-all");
      setNotificationList((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({
        title: "Sucesso",
        description: "Todas as notificacoes foram marcadas como lidas.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await api.delete(`/notifications/${notificationId}`);
        setNotificationList((prev) => prev.filter((n) => n.id !== notificationId));
        setTotal((prev) => prev - 1);
        return true;
      } catch (error) {
        toast({
          title: "Erro ao excluir",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.delete<{ deleted_count: number }>("/notifications/");
      setNotificationList((prev) => prev.filter((n) => !n.is_read));
      toast({
        title: "Sucesso",
        description: `${response.data.deleted_count} notificacoes excluidas.`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<NotificationPreferences>("/notifications/preferences");
      setPreferences(response.data);
      return response.data;
    } catch (error) {
      toast({
        title: "Erro ao carregar preferencias",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update preferences
  const updatePreferences = useCallback(
    async (update: Partial<{
      email_price_alerts: boolean;
      email_portfolio_updates: boolean;
      email_recommendations: boolean;
      email_community: boolean;
      email_news: boolean;
      email_daily_report: boolean;
      email_weekly_report: boolean;
      push_price_alerts: boolean;
      push_portfolio_updates: boolean;
      push_recommendations: boolean;
      push_community: boolean;
      quiet_hours_enabled: boolean;
      quiet_hours_start: number;
      quiet_hours_end: number;
    }>) => {
      try {
        setIsLoading(true);
        await api.put("/notifications/preferences", update);
        await fetchPreferences();
        toast({
          title: "Sucesso",
          description: "Preferencias atualizadas.",
        });
        return true;
      } catch (error) {
        toast({
          title: "Erro ao atualizar",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast, fetchPreferences]
  );

  return {
    isLoading,
    notificationList,
    total,
    unreadCount,
    preferences,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    fetchPreferences,
    updatePreferences,
  };
}
