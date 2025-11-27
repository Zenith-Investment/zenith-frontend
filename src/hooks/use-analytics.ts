"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export interface BacktestRequest {
  strategy: "buy_and_hold" | "dca" | "rebalancing" | "momentum";
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_capital: number;
  allocation?: Record<string, number>;
}

export interface BacktestResult {
  strategy_name: string;
  total_return: number;
  annualized_return: number;
  volatility: number;
  sharpe_ratio: number;
  max_drawdown: number;
  win_rate: number;
  total_trades: number;
  benchmark_return?: number;
  alpha?: number;
  daily_values: Array<{ date: string; value: number }>;
  disclaimer: string;
}

export interface BacktestHistory {
  id: number;
  strategy_name: string;
  tickers: string[];
  start_date: string;
  end_date: string;
  initial_capital: number;
  status: string;
  total_return?: number;
  sharpe_ratio?: number;
  max_drawdown?: number;
  created_at: string;
}

export interface ForecastRequest {
  ticker: string;
  forecast_days: number;
}

export interface ForecastResult {
  ticker: string;
  current_price: number;
  forecast_date: string;
  predicted_price: number;
  predicted_change_pct: number;
  confidence: number;
  prediction_range: { low: number; high: number };
  methodology: string;
  factors: string[];
  strategy_backtests: Array<{
    strategy: string;
    return_pct: number;
  }>;
  disclaimer: string;
}

export interface TechnicalAnalysis {
  ticker: string;
  signals: Array<{
    indicator: string;
    value: number;
    signal: string;
    strength: number;
  }>;
  overall_signal: string;
  overall_strength: number;
  support_levels: number[];
  resistance_levels: number[];
  trend: string;
  disclaimer: string;
}

export interface RiskAnalysis {
  volatility: number;
  var_95: number;
  var_99: number;
  max_drawdown: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  risk_score: number;
  risk_category: string;
  diversification: {
    hhi_score: number;
    sector_concentration: number;
    top_3_concentration: number;
    recommendations: string[];
  };
  disclaimer: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  risk_level: string;
  recommended_for: string[];
}

export function useAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [technicalResult, setTechnicalResult] = useState<TechnicalAnalysis | null>(null);
  const [riskResult, setRiskResult] = useState<RiskAnalysis | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [backtestHistory, setBacktestHistory] = useState<BacktestHistory[]>([]);
  const { toast } = useToast();

  // Fetch available strategies
  const fetchStrategies = useCallback(async () => {
    try {
      const response = await api.get<{ strategies: Strategy[] }>("/analytics/backtest/strategies");
      setStrategies(response.data.strategies);
      return response.data.strategies;
    } catch (error) {
      toast({
        title: "Erro ao carregar estrategias",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  // Run backtest
  const runBacktest = useCallback(
    async (request: BacktestRequest) => {
      try {
        setIsLoading(true);
        setBacktestResult(null);
        const response = await api.post<BacktestResult>("/analytics/backtest", request);
        setBacktestResult(response.data);
        toast({
          title: "Backtest concluido",
          description: `Retorno total: ${response.data.total_return.toFixed(2)}%`,
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro no backtest",
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

  // Get backtest history
  const fetchBacktestHistory = useCallback(
    async (limit = 20, offset = 0) => {
      try {
        setIsLoading(true);
        const response = await api.get<{ backtests: BacktestHistory[] }>(
          `/analytics/backtest/history?limit=${limit}&offset=${offset}`
        );
        setBacktestHistory(response.data.backtests);
        return response.data.backtests;
      } catch (error) {
        toast({
          title: "Erro ao carregar historico",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Get price forecast
  const getForecast = useCallback(
    async (request: ForecastRequest) => {
      try {
        setIsLoading(true);
        setForecastResult(null);
        const response = await api.post<ForecastResult>("/analytics/forecast", request);
        setForecastResult(response.data);
        return response.data;
      } catch (error) {
        toast({
          title: "Erro na previsao",
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

  // Get technical analysis
  const getTechnicalAnalysis = useCallback(
    async (ticker: string) => {
      try {
        setIsLoading(true);
        setTechnicalResult(null);
        const response = await api.get<TechnicalAnalysis>(`/analytics/technical/${ticker}`);
        setTechnicalResult(response.data);
        return response.data;
      } catch (error) {
        toast({
          title: "Erro na analise tecnica",
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

  // Get risk analysis
  const getRiskAnalysis = useCallback(
    async (tickers: string[], allocation?: Record<string, number>) => {
      try {
        setIsLoading(true);
        setRiskResult(null);
        const response = await api.post<RiskAnalysis>("/analytics/risk", {
          tickers,
          allocation,
        });
        setRiskResult(response.data);
        return response.data;
      } catch (error) {
        toast({
          title: "Erro na analise de risco",
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

  // Train ML model
  const trainModel = useCallback(
    async (ticker: string, forceRetrain = false) => {
      try {
        setIsLoading(true);
        const response = await api.post<{
          ticker: string;
          model_name: string;
          status: string;
          metrics?: Record<string, number>;
        }>(`/analytics/ml/train/${ticker}?force_retrain=${forceRetrain}`);

        toast({
          title: "Modelo treinado",
          description: `Modelo ${response.data.model_name} treinado com sucesso`,
        });
        return response.data;
      } catch (error) {
        toast({
          title: "Erro no treinamento",
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

  return {
    isLoading,
    backtestResult,
    forecastResult,
    technicalResult,
    riskResult,
    strategies,
    backtestHistory,
    fetchStrategies,
    runBacktest,
    fetchBacktestHistory,
    getForecast,
    getTechnicalAnalysis,
    getRiskAnalysis,
    trainModel,
  };
}
