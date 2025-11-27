"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export interface DashboardAsset {
  ticker: string;
  quantity: number;
  average_price: number;
  current_price: number;
  value: number;
  profit_loss: number;
  profit_loss_pct: number;
}

export interface DashboardPortfolio {
  total_value: number;
  total_invested: number;
  profit_loss: number;
  profit_loss_pct: number;
  assets_count: number;
  portfolios_count: number;
  primary_portfolio_id: number | null;
  top_assets: DashboardAsset[];
}

export interface DashboardBacktest {
  id: number;
  strategy: string;
  return: number | null;
  date: string;
}

export interface DashboardForecast {
  id: number;
  ticker: string;
  predicted_change: number;
  confidence: number;
  date: string;
}

export interface DashboardStrategy {
  id: number;
  strategy_id: number;
  initial_value: number;
  current_value: number | null;
  return_pct: number | null;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  change_pct: number;
}

export interface UsageItem {
  current: number;
  limit: number;
  unlimited: boolean;
}

export interface UsageLimits {
  plan: string;
  plan_name?: string;
  usage: {
    portfolios: UsageItem;
    alerts: UsageItem;
    ai_messages_this_month: UsageItem;
    api_keys: UsageItem;
  };
  features?: {
    email_reports: boolean;
    priority_support: boolean;
    broker_connections: number;
    export_formats: string[];
    market_data_delay_minutes: number;
  };
}

export interface DashboardSummary {
  user: {
    id: number;
    name: string;
    email: string;
    plan: string;
    is_verified: boolean;
  };
  portfolio: DashboardPortfolio;
  alerts: {
    active: number;
    triggered_this_week: number;
  };
  notifications: {
    unread: number;
  };
  recent_activity: {
    backtests: DashboardBacktest[];
    forecasts: DashboardForecast[];
    active_strategies: DashboardStrategy[];
  };
  market: {
    indices: MarketIndex[];
  };
  usage: UsageLimits;
  generated_at: string;
}

export interface QuickStats {
  unread_notifications: number;
  active_alerts: number;
  plan: string;
}

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const { toast } = useToast();

  // Fetch complete dashboard summary
  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<DashboardSummary>("/dashboard/summary");
      setSummary(response.data);
      return response.data;
    } catch (error) {
      toast({
        title: "Erro ao carregar dashboard",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch quick stats (for header/navbar)
  const fetchQuickStats = useCallback(async () => {
    try {
      const response = await api.get<QuickStats>("/dashboard/quick-stats");
      setQuickStats(response.data);
      return response.data;
    } catch (error) {
      // Silent fail for quick stats - not critical
      console.error("Failed to fetch quick stats:", error);
      return null;
    }
  }, []);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Helper to format percentage
  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  // Get portfolio health indicator
  const getPortfolioHealth = (summary: DashboardSummary | null) => {
    if (!summary) return { status: "unknown", color: "gray" };

    const pct = summary.portfolio.profit_loss_pct;
    if (pct > 10) return { status: "excellent", color: "green" };
    if (pct > 0) return { status: "good", color: "emerald" };
    if (pct > -5) return { status: "neutral", color: "yellow" };
    if (pct > -15) return { status: "attention", color: "orange" };
    return { status: "critical", color: "red" };
  };

  return {
    isLoading,
    summary,
    quickStats,
    fetchSummary,
    fetchQuickStats,
    formatCurrency,
    formatPercent,
    getPortfolioHealth,
  };
}
