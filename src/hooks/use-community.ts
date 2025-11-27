"use client";

import { useState, useCallback } from "react";
import { api, getErrorMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Types
export interface CommunityStrategy {
  id: number;
  strategy_name: string;
  strategy_type: string;
  description?: string;
  target_risk_profile: string;
  min_investment_horizon_years: number;
  total_return: number;
  annualized_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  volatility: number;
  times_used: number;
  success_count: number;
  avg_user_return?: number;
  community_rating?: number;
  is_featured: boolean;
  applicable_tickers?: string[];
}

export interface StrategyMatch {
  strategy: CommunityStrategy;
  match_score: number;
  reasons: string[];
}

export interface StrategyUse {
  id: number;
  strategy_name: string;
  started_at: string;
  initial_value: number;
  current_value?: number;
  return_pct?: number;
  is_active: boolean;
  rating?: number;
}

export function useCommunity() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedStrategies, setRecommendedStrategies] = useState<StrategyMatch[]>([]);
  const [featuredStrategies, setFeaturedStrategies] = useState<CommunityStrategy[]>([]);
  const [topStrategies, setTopStrategies] = useState<CommunityStrategy[]>([]);
  const [myStrategies, setMyStrategies] = useState<StrategyUse[]>([]);
  const { toast } = useToast();

  // Fetch recommended strategies for user
  const fetchRecommended = useCallback(async (limit = 5) => {
    try {
      setIsLoading(true);
      const response = await api.get<{ recommendations: StrategyMatch[] }>(
        `/community/recommended?limit=${limit}`
      );
      setRecommendedStrategies(response.data.recommendations);
      return response.data.recommendations;
    } catch (error) {
      toast({
        title: "Erro ao carregar recomendacoes",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch featured strategies
  const fetchFeatured = useCallback(async (limit = 10) => {
    try {
      setIsLoading(true);
      const response = await api.get<{ strategies: CommunityStrategy[] }>(
        `/community/featured?limit=${limit}`
      );
      setFeaturedStrategies(response.data.strategies);
      return response.data.strategies;
    } catch (error) {
      toast({
        title: "Erro ao carregar estrategias em destaque",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Fetch top performing strategies
  const fetchTop = useCallback(async (sortBy = "sharpe_ratio", limit = 10) => {
    try {
      setIsLoading(true);
      const response = await api.get<{ strategies: CommunityStrategy[] }>(
        `/community/top?sort_by=${sortBy}&limit=${limit}`
      );
      setTopStrategies(response.data.strategies);
      return response.data.strategies;
    } catch (error) {
      toast({
        title: "Erro ao carregar ranking",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Use a strategy
  const useStrategy = useCallback(
    async (strategyId: number, initialValue: number) => {
      try {
        setIsLoading(true);
        const response = await api.post<{ use_id: number; message: string }>(
          `/community/${strategyId}/use`,
          { initial_value: initialValue }
        );
        toast({
          title: "Estrategia adicionada",
          description: response.data.message,
        });
        // Refresh my strategies
        await fetchMyStrategies();
        return response.data;
      } catch (error) {
        toast({
          title: "Erro ao usar estrategia",
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

  // Fetch user's strategies
  const fetchMyStrategies = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ strategies: StrategyUse[] }>("/community/my-strategies");
      setMyStrategies(response.data.strategies);
      return response.data.strategies;
    } catch (error) {
      toast({
        title: "Erro ao carregar suas estrategias",
        description: getErrorMessage(error),
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update strategy outcome
  const updateOutcome = useCallback(
    async (
      useId: number,
      currentValue: number,
      isActive: boolean,
      rating?: number,
      feedback?: string
    ) => {
      try {
        setIsLoading(true);
        await api.put(`/community/my-strategies/${useId}`, {
          current_value: currentValue,
          is_active: isActive,
          rating,
          feedback,
        });
        toast({
          title: "Atualizado com sucesso",
          description: "Seus resultados foram registrados.",
        });
        await fetchMyStrategies();
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
    [toast, fetchMyStrategies]
  );

  // Get strategy details
  const getStrategy = useCallback(
    async (strategyId: number) => {
      try {
        setIsLoading(true);
        const response = await api.get<{ strategy: CommunityStrategy }>(
          `/community/${strategyId}`
        );
        return response.data.strategy;
      } catch (error) {
        toast({
          title: "Erro ao carregar detalhes",
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
    recommendedStrategies,
    featuredStrategies,
    topStrategies,
    myStrategies,
    fetchRecommended,
    fetchFeatured,
    fetchTop,
    useStrategy,
    fetchMyStrategies,
    updateOutcome,
    getStrategy,
  };
}
