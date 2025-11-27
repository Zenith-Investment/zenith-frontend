"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bell,
  BellOff,
  TrendingUp,
  Briefcase,
  Sparkles,
  Info,
  X,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotifications, Notification } from "@/hooks/use-notifications";

const NOTIFICATION_ICONS = {
  price_alert: TrendingUp,
  portfolio_update: Briefcase,
  recommendation: Sparkles,
  system: Info,
};

const NOTIFICATION_COLORS = {
  price_alert: "text-green-500",
  portfolio_update: "text-blue-500",
  recommendation: "text-purple-500",
  system: "text-gray-500",
};

function NotificationItem({
  notification,
  onRemove,
}: {
  notification: Notification;
  onRemove: () => void;
}) {
  const Icon = NOTIFICATION_ICONS[notification.type];
  const colorClass = NOTIFICATION_COLORS[notification.type];

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors group">
      <div className={`mt-0.5 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        {notification.timestamp && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(notification.timestamp, {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const {
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
  } = useNotifications();

  const unreadCount = notifications.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          {isConnected ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notificacoes</h4>
            {isConnected ? (
              <span className="h-2 w-2 rounded-full bg-green-500" title="Conectado" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-red-500" title="Desconectado" />
            )}
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={clearNotifications}
            >
              <Check className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificacao</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={index}
                  notification={notification}
                  onRemove={() => removeNotification(index)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
