"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  Building2,
  FileText,
  History,
  Key,
  LayoutDashboard,
  LineChart,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { Logo } from "@/components/logo";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Carteira",
    href: "/portfolio",
    icon: Briefcase,
  },
  {
    name: "Transacoes",
    href: "/transactions",
    icon: History,
  },
  {
    name: "Alertas",
    href: "/alerts",
    icon: Bell,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: Activity,
  },
  {
    name: "Recomendacoes",
    href: "/recommendations",
    icon: TrendingUp,
  },
  {
    name: "Comunidade",
    href: "/community",
    icon: Users,
  },
  {
    name: "Relatorios",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Mercado",
    href: "/market",
    icon: LineChart,
  },
  {
    name: "Chat IA",
    href: "/chat",
    icon: Bot,
  },
  {
    name: "Corretoras",
    href: "/brokers",
    icon: Building2,
  },
];

const bottomNavigation = [
  {
    name: "Meu Perfil",
    href: "/profile",
    icon: User,
  },
  {
    name: "Chaves API",
    href: "/api-keys",
    icon: Key,
  },
  {
    name: "Privacidade",
    href: "/privacy",
    icon: Shield,
  },
  {
    name: "Configuracoes",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card" role="navigation" aria-label="Menu principal">
      {/* Logo */}
      <Link href="/dashboard" className="flex h-16 items-center border-b px-6">
        <Logo width={120} height={32} className="transition-opacity hover:opacity-80" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4" aria-label="Navegacao principal">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t p-4">
        <nav aria-label="Configuracoes">
          {bottomNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="mt-4 flex items-center justify-between rounded-lg border bg-muted/50 p-3">
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">
              {user?.full_name || "Usuario"}
            </span>
            <span className="truncate text-xs text-muted-foreground capitalize">
              {user?.subscription_plan || "starter"}
            </span>
          </div>
          <div className="flex items-center gap-1" role="group" aria-label="Acoes do usuario">
            <NotificationCenter />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="h-8 w-8 shrink-0"
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
