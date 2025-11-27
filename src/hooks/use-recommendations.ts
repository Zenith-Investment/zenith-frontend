"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Recommendation {
  ticker: string;
  name: string | null;
  action: "buy" | "sell" | "hold";
  reason: string;
  confidence: number;
  target_allocation: number | null;
  current_price: number | null;
  asset_class: string;
}

export interface AllocationTarget {
  asset_class: string;
  target_percentage: number;
  current_percentage: number;
  difference: number;
  action: "increase" | "decrease" | "maintain";
}

export interface RecommendationsResponse {
  recommendations: Recommendation[];
  allocation_targets: AllocationTarget[];
  summary: string;
}

async function fetchRecommendations(): Promise<RecommendationsResponse> {
  const response = await api.get("/recommendations/");
  return response.data;
}

export function useRecommendations() {
  return useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
