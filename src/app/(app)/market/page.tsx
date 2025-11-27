"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import api from "@/lib/api";

interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  change_percent: number;
}

interface PopularAsset {
  ticker: string;
  name: string;
}

interface SearchResult {
  ticker: string;
  name: string;
  asset_type: string;
  exchange: string;
}

export default function MarketPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [popularStocks, setPopularStocks] = useState<PopularAsset[]>([]);
  const [popularFiis, setPopularFiis] = useState<PopularAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadMarketData();
  }, []);

  // Initialize search from URL parameter
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchAssets();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const loadMarketData = async () => {
    try {
      const [indicesRes, popularRes] = await Promise.all([
        api.get("/market/indices"),
        api.get("/market/popular"),
      ]);

      setIndices(indicesRes.data.indices);
      setPopularStocks(popularRes.data.stocks);
      setPopularFiis(popularRes.data.fiis);
    } catch (error) {
      console.error("Error loading market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAssets = async () => {
    setIsSearching(true);
    try {
      const response = await api.get(`/market/search?q=${searchQuery}&limit=10`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <Header title="Mercado" description="Explore ativos e acompanhe índices" />
        <div className="flex flex-1 items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="Mercado" description="Explore ativos e acompanhe índices" />

      <div className="p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ações, FIIs, ETFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} resultado(s) encontrado(s)
                </p>
                <div className="grid gap-2">
                  {searchResults.map((result) => (
                    <Link
                      key={result.ticker}
                      href={`/market/${result.ticker}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <span className="font-semibold">{result.ticker}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {result.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {result.asset_type.toUpperCase()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Indices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Índices de Mercado
            </CardTitle>
            <CardDescription>
              Principais índices em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {indices.map((index) => (
                <div
                  key={index.symbol}
                  className="rounded-lg border p-4 space-y-1"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {index.name}
                  </p>
                  <p className="text-2xl font-bold">
                    {index.value.toLocaleString("pt-BR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                  <div
                    className={`flex items-center text-sm ${
                      index.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {index.change >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>
                      {index.change >= 0 ? "+" : ""}
                      {formatPercentage(index.change_percent)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Assets */}
        <Tabs defaultValue="stocks">
          <TabsList>
            <TabsTrigger value="stocks">Ações Populares</TabsTrigger>
            <TabsTrigger value="fiis">FIIs Populares</TabsTrigger>
          </TabsList>

          <TabsContent value="stocks">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {popularStocks.slice(0, 12).map((stock) => (
                    <Link
                      key={stock.ticker}
                      href={`/market/${stock.ticker}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <span className="font-semibold">{stock.ticker}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {stock.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fiis">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {popularFiis.map((fii) => (
                    <Link
                      key={fii.ticker}
                      href={`/market/${fii.ticker}`}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <span className="font-semibold">{fii.ticker}</span>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          {fii.name}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
