import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { getErrorMessage } from "@/lib/api";
import type {
  PortfolioResponse,
  PortfolioPerformance,
  AddAssetRequest,
  PortfolioAsset,
} from "@/types/portfolio";

// Query keys
export const portfolioKeys = {
  all: ["portfolio"] as const,
  detail: () => [...portfolioKeys.all, "detail"] as const,
  performance: (period: string) =>
    [...portfolioKeys.all, "performance", period] as const,
};

// Fetch portfolio
export function usePortfolio() {
  return useQuery<PortfolioResponse>({
    queryKey: portfolioKeys.detail(),
    queryFn: async () => {
      const response = await api.get<PortfolioResponse>("/portfolio/");
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}

// Fetch portfolio performance
export function usePortfolioPerformance(period: string = "1y") {
  return useQuery<PortfolioPerformance>({
    queryKey: portfolioKeys.performance(period),
    queryFn: async () => {
      const response = await api.get<PortfolioPerformance>(
        `/portfolio/performance?period=${period}`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Add asset to portfolio
export function useAddAsset() {
  const queryClient = useQueryClient();

  return useMutation<PortfolioAsset, Error, AddAssetRequest>({
    mutationFn: async (asset: AddAssetRequest) => {
      const response = await api.post<PortfolioAsset>("/portfolio/assets", asset);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate portfolio queries to refetch
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
    onError: (error) => {
      console.error("Failed to add asset:", getErrorMessage(error));
    },
  });
}

// Remove asset from portfolio
export function useRemoveAsset() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (assetId: number) => {
      await api.delete(`/portfolio/assets/${assetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
    onError: (error) => {
      console.error("Failed to remove asset:", getErrorMessage(error));
    },
  });
}
