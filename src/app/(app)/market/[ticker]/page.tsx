"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Building,
  Loader2,
  TrendingUp,
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
import { PriceChart } from "@/components/charts";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface AssetDetail {
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
  description: string | null;
  sector: string | null;
  industry: string | null;
}

interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchAssetDetail(ticker: string): Promise<AssetDetail> {
  const response = await api.get(`/market/assets/${ticker}`);
  return response.data;
}

async function fetchPriceHistory(
  ticker: string,
  period = "1y"
): Promise<PriceHistory[]> {
  const response = await api.get(`/market/assets/${ticker}/history`, {
    params: { period, interval: "1d" },
  });
  return response.data.data;
}

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = params.ticker as string;

  const {
    data: asset,
    isLoading: assetLoading,
    error: assetError,
  } = useQuery({
    queryKey: ["asset-detail", ticker],
    queryFn: () => fetchAssetDetail(ticker),
    enabled: !!ticker,
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["asset-history", ticker],
    queryFn: () => fetchPriceHistory(ticker),
    enabled: !!ticker,
  });

  const isPositive = asset ? asset.change >= 0 : true;

  if (assetLoading) {
    return (
      <div className="flex flex-col">
        <Header title="Carregando..." description="" />
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (assetError || !asset) {
    return (
      <div className="flex flex-col">
        <Header title="Ativo nao encontrado" description="" />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-muted-foreground">
                Nao foi possivel carregar os dados do ativo.
              </p>
              <Button onClick={() => router.back()}>Voltar</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header
        title={asset.ticker}
        description={asset.name}
      />

      <div className="p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Price Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="text-4xl font-bold">
                {formatCurrency(asset.current_price)}
              </span>
              <div
                className={`flex items-center gap-1 text-lg ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {formatCurrency(asset.change)} ({asset.change_percent.toFixed(2)}%)
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                {asset.asset_type === "stock"
                  ? "Acao"
                  : asset.asset_type === "fii"
                    ? "FII"
                    : asset.asset_type}
              </span>
              {asset.exchange && <span>{asset.exchange}</span>}
              {asset.sector && <span>{asset.sector}</span>}
            </div>
          </CardContent>
        </Card>

        {/* Price Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Historico de Precos</CardTitle>
            <CardDescription>
              Variacao do preco ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : history && history.length > 0 ? (
              <PriceChart data={history} ticker={asset.ticker} height={400} />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Sem dados de historico
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Market Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Dados de Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {asset.open_price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Abertura</p>
                    <p className="font-medium">{formatCurrency(asset.open_price)}</p>
                  </div>
                )}
                {asset.high && (
                  <div>
                    <p className="text-sm text-muted-foreground">Maxima</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(asset.high)}
                    </p>
                  </div>
                )}
                {asset.low && (
                  <div>
                    <p className="text-sm text-muted-foreground">Minima</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(asset.low)}
                    </p>
                  </div>
                )}
                {asset.volume && (
                  <div>
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="font-medium">
                      {asset.volume.toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
                {asset.market_cap && (
                  <div>
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="font-medium">
                      R$ {(asset.market_cap / 1e9).toFixed(2)}B
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fundamentals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Indicadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {asset.pe_ratio && (
                  <div>
                    <p className="text-sm text-muted-foreground">P/L</p>
                    <p className="font-medium">{asset.pe_ratio.toFixed(2)}</p>
                  </div>
                )}
                {asset.dividend_yield && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dividend Yield</p>
                    <p className="font-medium">
                      {(asset.dividend_yield * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
                {asset.sector && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Setor</p>
                    <p className="font-medium">{asset.sector}</p>
                  </div>
                )}
                {asset.industry && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Industria</p>
                    <p className="font-medium">{asset.industry}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {asset.description && (
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{asset.description}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
