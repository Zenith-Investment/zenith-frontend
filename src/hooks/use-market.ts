"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AssetSearchResult {
  ticker: string;
  name: string;
  asset_type: string;
  exchange: string | null;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  change_percent: number;
  last_updated: string;
}

export interface AssetDetail {
  ticker: string;
  name: string;
  asset_type: string;
  exchange: string | null;
  current_price: number;
  currency: string;
  change: number;
  change_percent: number;
  open_price: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  market_cap: number | null;
  pe_ratio: number | null;
  dividend_yield: number | null;
  week_52_high: number | null;
  week_52_low: number | null;
  description: string | null;
  sector: string | null;
  industry: string | null;
  last_updated: string;
}

export interface PopularAssets {
  stocks: { ticker: string; name: string }[];
  fiis: { ticker: string; name: string }[];
}

// Fetch market indices
async function fetchMarketIndices(): Promise<MarketIndex[]> {
  const response = await api.get("/market/indices");
  return response.data.indices;
}

// Search assets
async function searchAssets(query: string, limit = 10): Promise<AssetSearchResult[]> {
  const response = await api.get("/market/search", {
    params: { q: query, limit },
  });
  return response.data.results;
}

// Get asset detail
async function fetchAssetDetail(ticker: string): Promise<AssetDetail> {
  const response = await api.get(`/market/assets/${ticker}`);
  return response.data;
}

// Get popular assets
async function fetchPopularAssets(): Promise<PopularAssets> {
  const response = await api.get("/market/popular");
  return response.data;
}

export function useMarketIndices() {
  return useQuery({
    queryKey: ["market-indices"],
    queryFn: fetchMarketIndices,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useAssetSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["asset-search", query],
    queryFn: () => searchAssets(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000,
  });
}

export function useAssetDetail(ticker: string | null) {
  return useQuery({
    queryKey: ["asset-detail", ticker],
    queryFn: () => fetchAssetDetail(ticker!),
    enabled: !!ticker,
    staleTime: 60 * 1000,
  });
}

export function usePopularAssets() {
  return useQuery({
    queryKey: ["popular-assets"],
    queryFn: fetchPopularAssets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
