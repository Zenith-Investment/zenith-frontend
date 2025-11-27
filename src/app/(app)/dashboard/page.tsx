"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  Briefcase,
  LineChart,
  Loader2,
  Radio,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { useDashboard } from "@/hooks/use-dashboard";
import { useRealtime, PortfolioUpdate } from "@/hooks/use-realtime";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isLoading, summary, fetchSummary } = useDashboard();
  const { toast } = useToast();

  // Real-time updates state
  const [realtimePortfolio, setRealtimePortfolio] = useState<PortfolioUpdate | null>(null);

  // Real-time WebSocket connection
  const { isConnected, portfolioValue } = useRealtime({
    onPortfolioUpdate: (update) => {
      setRealtimePortfolio(update);
    },
    onAlertTriggered: (alert) => {
      toast({
        title: "Alerta Disparado!",
        description: `${alert.ticker} atingiu ${formatCurrency(alert.current_price)}`,
      });
    },
    autoConnect: true,
  });

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Use real-time data if available, otherwise fall back to API data
  const portfolioData = {
    totalValue: realtimePortfolio?.total_value ?? summary?.portfolio.total_value ?? 0,
    totalInvested: summary?.portfolio.total_invested ?? 0,
    profitLoss: summary?.portfolio.profit_loss ?? 0,
    profitLossPercentage: summary?.portfolio.profit_loss_pct ?? 0,
    assetsCount: summary?.portfolio.assets_count ?? 0,
    dailyChange: realtimePortfolio?.daily_change ?? 0,
    dailyChangePct: realtimePortfolio?.daily_change_percent ?? 0,
  };

  return (
    <div className="flex flex-col">
      <Header
        title={`Ola, ${user?.full_name?.split(" ")[0] || "Investidor"}!`}
        description={
          <span className="flex items-center gap-2">
            Aqui esta um resumo da sua carteira
            {isConnected && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Radio className="h-3 w-3 animate-pulse" />
                Ao vivo
              </span>
            )}
          </span>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Patrimonio Total
              </CardTitle>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Wallet className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-8 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {formatCurrency(portfolioData.totalValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Investido: {formatCurrency(portfolioData.totalInvested)}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Lucro/Prejuizo
              </CardTitle>
              {portfolioData.profitLoss >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-8 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <>
                  <div
                    className={`text-2xl font-bold ${
                      portfolioData.profitLoss >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {portfolioData.profitLoss >= 0 ? "+" : ""}
                    {formatCurrency(portfolioData.profitLoss)}
                  </div>
                  <p
                    className={`text-xs ${
                      portfolioData.profitLossPercentage >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {portfolioData.profitLossPercentage >= 0 ? "+" : ""}
                    {formatPercentage(portfolioData.profitLossPercentage)} total
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {summary?.alerts.active ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary?.alerts.triggered_this_week ?? 0} disparados esta semana
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {summary?.user.plan || user?.subscription_plan || "Starter"}
              </div>
              <Button variant="link" className="h-auto p-0 text-xs" asChild>
                <Link href="/settings">Fazer upgrade</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Market Indices */}
        {summary?.market.indices && summary.market.indices.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Indices de Mercado
                  </CardTitle>
                  <CardDescription>Principais indicadores em tempo real</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/market">Ver mercado</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {summary.market.indices.map((index) => (
                  <div key={index.name} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{index.name}</p>
                    <p className="text-lg font-bold">
                      {index.value.toLocaleString("pt-BR")}
                    </p>
                    <p
                      className={`text-xs flex items-center gap-1 ${
                        index.change_pct >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {index.change_pct >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {index.change_pct >= 0 ? "+" : ""}
                      {index.change_pct.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Assets */}
        {summary?.portfolio.top_assets && summary.portfolio.top_assets.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Seus Ativos</CardTitle>
                  <CardDescription>Top ativos da sua carteira por valor</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/portfolio">Ver todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.portfolio.top_assets.map((asset) => (
                  <div
                    key={asset.ticker}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{asset.ticker}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {asset.quantity} cotas - PM: {formatCurrency(asset.average_price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(asset.value)}
                      </div>
                      <p
                        className={`text-sm ${
                          asset.profit_loss_pct >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {asset.profit_loss_pct >= 0 ? "+" : ""}
                        {asset.profit_loss_pct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>Suas analises e previsoes</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/analytics">Ver analytics</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recent Backtests */}
                  {summary?.recent_activity.backtests.slice(0, 2).map((bt) => (
                    <div
                      key={bt.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{bt.strategy}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bt.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {bt.return !== null && (
                        <Badge variant={bt.return >= 0 ? "default" : "destructive"}>
                          {bt.return >= 0 ? "+" : ""}
                          {bt.return.toFixed(2)}%
                        </Badge>
                      )}
                    </div>
                  ))}

                  {/* Recent Forecasts */}
                  {summary?.recent_activity.forecasts.slice(0, 2).map((fc) => (
                    <div
                      key={fc.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Previsao {fc.ticker}</p>
                          <p className="text-xs text-muted-foreground">
                            Confianca: {(fc.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <Badge variant={fc.predicted_change >= 0 ? "default" : "destructive"}>
                        {fc.predicted_change >= 0 ? "+" : ""}
                        {fc.predicted_change.toFixed(2)}%
                      </Badge>
                    </div>
                  ))}

                  {/* No activity message */}
                  {(!summary?.recent_activity.backtests.length &&
                    !summary?.recent_activity.forecasts.length) && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma atividade recente</p>
                      <Button variant="link" size="sm" asChild>
                        <Link href="/analytics">Fazer seu primeiro backtest</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acoes Rapidas</CardTitle>
              <CardDescription>O que voce gostaria de fazer?</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/chat">
                  <Bot className="mr-2 h-4 w-4" />
                  Conversar com a IA
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/portfolio">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Gerenciar Carteira
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Rodar Backtest
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/community">
                  <Users className="mr-2 h-4 w-4" />
                  Estrategias da Comunidade
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Usage Limits */}
        {summary?.usage && (
          <Card>
            <CardHeader>
              <CardTitle>Uso do Plano</CardTitle>
              <CardDescription>
                Plano {summary.usage.plan} - Consumo mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Portfolios</span>
                    <span>
                      {summary.usage.usage?.portfolios?.unlimited
                        ? `${summary.usage.usage.portfolios.current} / Ilimitado`
                        : `${summary.usage.usage?.portfolios?.current ?? 0}/${summary.usage.usage?.portfolios?.limit ?? 1}`}
                    </span>
                  </div>
                  <Progress
                    value={summary.usage.usage?.portfolios?.unlimited
                      ? 0
                      : ((summary.usage.usage?.portfolios?.current ?? 0) / (summary.usage.usage?.portfolios?.limit || 1)) * 100}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Alertas</span>
                    <span>
                      {summary.usage.usage?.alerts?.unlimited
                        ? `${summary.usage.usage.alerts.current} / Ilimitado`
                        : `${summary.usage.usage?.alerts?.current ?? 0}/${summary.usage.usage?.alerts?.limit ?? 5}`}
                    </span>
                  </div>
                  <Progress
                    value={summary.usage.usage?.alerts?.unlimited
                      ? 0
                      : ((summary.usage.usage?.alerts?.current ?? 0) / (summary.usage.usage?.alerts?.limit || 1)) * 100}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mensagens IA</span>
                    <span>
                      {summary.usage.usage?.ai_messages_this_month?.unlimited
                        ? `${summary.usage.usage.ai_messages_this_month.current} / Ilimitado`
                        : `${summary.usage.usage?.ai_messages_this_month?.current ?? 0}/${summary.usage.usage?.ai_messages_this_month?.limit ?? 20}`}
                    </span>
                  </div>
                  <Progress
                    value={summary.usage.usage?.ai_messages_this_month?.unlimited
                      ? 0
                      : ((summary.usage.usage?.ai_messages_this_month?.current ?? 0) / (summary.usage.usage?.ai_messages_this_month?.limit || 1)) * 100}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Chaves API</span>
                    <span>
                      {summary.usage.usage?.api_keys?.unlimited
                        ? `${summary.usage.usage.api_keys.current} / Ilimitado`
                        : `${summary.usage.usage?.api_keys?.current ?? 0}/${summary.usage.usage?.api_keys?.limit ?? 1}`}
                    </span>
                  </div>
                  <Progress
                    value={summary.usage.usage?.api_keys?.unlimited
                      ? 0
                      : ((summary.usage.usage?.api_keys?.current ?? 0) / (summary.usage.usage?.api_keys?.limit || 1)) * 100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Chat Prompt */}
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  Precisa de ajuda com seus investimentos?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pergunte qualquer coisa para nossa IA especializada
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/chat">Iniciar conversa</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
