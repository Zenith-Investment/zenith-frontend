"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MailOpen,
  Settings,
  Trash2,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Users,
  Info,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNotificationsAPI, NotificationItem } from "@/hooks/use-notifications";
import Link from "next/link";

// Notification type icons
const typeIcons: Record<string, React.ReactNode> = {
  price_alert: <TrendingUp className="h-4 w-4" />,
  portfolio_update: <Briefcase className="h-4 w-4" />,
  recommendation: <AlertCircle className="h-4 w-4" />,
  community: <Users className="h-4 w-4" />,
  system: <Info className="h-4 w-4" />,
};

// Priority colors
const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  normal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    isLoading,
    notificationList,
    total,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotificationsAPI();

  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  // Fetch notifications on mount and when filters change
  useEffect(() => {
    fetchNotifications({
      unread_only: filter === "unread",
      type: typeFilter !== "all" ? typeFilter : undefined,
      limit,
      offset: page * limit,
    });
  }, [fetchNotifications, filter, typeFilter, page]);

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}m atras`;
    if (diffHours < 24) return `${diffHours}h atras`;
    if (diffDays < 7) return `${diffDays}d atras`;
    return date.toLocaleDateString("pt-BR");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col">
      <Header
        title="Notificacoes"
        description="Gerencie suas notificacoes e alertas"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Nao lidas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <MailOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total - unreadCount}</p>
                <p className="text-sm text-muted-foreground">Lidas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="unread">Nao lidas</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="price_alert">Alertas de Preco</SelectItem>
                <SelectItem value="portfolio_update">Carteira</SelectItem>
                <SelectItem value="recommendation">Recomendacoes</SelectItem>
                <SelectItem value="community">Comunidade</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={isLoading || unreadCount === 0}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Marcar todas como lidas
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isLoading || total === unreadCount}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar lidas
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir notificacoes lidas?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acao ira excluir permanentemente todas as notificacoes ja lidas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllRead}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Preferencias
              </Link>
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Notificacoes</CardTitle>
            <CardDescription>
              {filter === "unread"
                ? `${unreadCount} notificacoes nao lidas`
                : `${total} notificacoes no total`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : notificationList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BellOff className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma notificacao encontrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificationList.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors cursor-pointer hover:bg-muted/50 ${
                      !notification.is_read ? "bg-primary/5 border-primary/20" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        !notification.is_read
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {typeIcons[notification.type] || <Bell className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${!notification.is_read ? "" : "text-muted-foreground"}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={priorityColors[notification.priority]}>
                            {notification.priority}
                          </Badge>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        {notification.action_url && (
                          <span className="text-xs text-primary">Ver detalhes</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Pagina {page + 1} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Proxima
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
