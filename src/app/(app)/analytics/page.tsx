"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  ChevronDown,
  LineChart,
  Loader2,
  Plus,
  Shield,
  TrendingDown,
  TrendingUp,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalytics, BacktestRequest, Strategy } from "@/hooks/use-analytics";

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// Format percentage
const formatPercent = (value: number) => {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
};

export default function AnalyticsPage() {
  const {
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
  } = useAnalytics();

  // Backtest form state
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [tickers, setTickers] = useState<string[]>([]);
  const [tickerInput, setTickerInput] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [initialCapital, setInitialCapital] = useState("10000");

  // Forecast form state
  const [forecastTicker, setForecastTicker] = useState("");
  const [forecastDays, setForecastDays] = useState("30");

  // Technical form state
  const [technicalTicker, setTechnicalTicker] = useState("");

  // Risk form state
  const [riskTickers, setRiskTickers] = useState<string[]>([]);
  const [riskTickerInput, setRiskTickerInput] = useState("");

  // Load strategies on mount
  useEffect(() => {
    fetchStrategies();
    fetchBacktestHistory();

    // Set default dates (1 year ago to today)
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(oneYearAgo.toISOString().split("T")[0]);
  }, [fetchStrategies, fetchBacktestHistory]);

  // Add ticker to list
  const handleAddTicker = () => {
    const ticker = tickerInput.toUpperCase().trim();
    if (ticker && !tickers.includes(ticker) && tickers.length < 10) {
      setTickers([...tickers, ticker]);
      setTickerInput("");
    }
  };

  const handleRemoveTicker = (ticker: string) => {
    setTickers(tickers.filter((t) => t !== ticker));
  };

  // Add risk ticker
  const handleAddRiskTicker = () => {
    const ticker = riskTickerInput.toUpperCase().trim();
    if (ticker && !riskTickers.includes(ticker) && riskTickers.length < 10) {
      setRiskTickers([...riskTickers, ticker]);
      setRiskTickerInput("");
    }
  };

  const handleRemoveRiskTicker = (ticker: string) => {
    setRiskTickers(riskTickers.filter((t) => t !== ticker));
  };

  // Run backtest
  const handleRunBacktest = async () => {
    if (!selectedStrategy || tickers.length === 0 || !startDate || !endDate) return;

    const request: BacktestRequest = {
      strategy: selectedStrategy as BacktestRequest["strategy"],
      tickers,
      start_date: startDate,
      end_date: endDate,
      initial_capital: parseFloat(initialCapital),
    };

    await runBacktest(request);
  };

  // Get forecast
  const handleGetForecast = async () => {
    if (!forecastTicker) return;
    await getForecast({
      ticker: forecastTicker.toUpperCase(),
      forecast_days: parseInt(forecastDays),
    });
  };

  // Get technical analysis
  const handleGetTechnical = async () => {
    if (!technicalTicker) return;
    await getTechnicalAnalysis(technicalTicker.toUpperCase());
  };

  // Get risk analysis
  const handleGetRisk = async () => {
    if (riskTickers.length === 0) return;
    await getRiskAnalysis(riskTickers);
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Analytics"
        description="Backtesting, previsoes e analise de risco"
      />

      <div className="p-6">
        <Tabs defaultValue="backtest" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="backtest" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Backtest
            </TabsTrigger>
            <TabsTrigger value="forecast" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Previsao
            </TabsTrigger>
            <TabsTrigger value="technical" className="gap-2">
              <LineChart className="h-4 w-4" />
              Tecnica
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2">
              <Shield className="h-4 w-4" />
              Risco
            </TabsTrigger>
          </TabsList>

          {/* Backtest Tab */}
          <TabsContent value="backtest" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Backtest Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurar Backtest</CardTitle>
                  <CardDescription>
                    Simule estrategias com dados historicos
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Strategy Selection */}
                  <div className="space-y-2">
                    <Label>Estrategia</Label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma estrategia" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            <div className="flex flex-col">
                              <span>{strategy.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {strategy.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tickers */}
                  <div className="space-y-2">
                    <Label>Ativos (max 10)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: PETR4"
                        value={tickerInput}
                        onChange={(e) => setTickerInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTicker()}
                      />
                      <Button variant="outline" onClick={handleAddTicker}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tickers.map((ticker) => (
                        <Badge key={ticker} variant="secondary" className="gap-1">
                          {ticker}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTicker(ticker)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Inicio</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Initial Capital */}
                  <div className="space-y-2">
                    <Label>Capital Inicial (R$)</Label>
                    <Input
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(e.target.value)}
                      min="1000"
                    />
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleRunBacktest}
                    disabled={isLoading || !selectedStrategy || tickers.length === 0}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Activity className="mr-2 h-4 w-4" />
                    )}
                    Executar Backtest
                  </Button>
                </CardContent>
              </Card>

              {/* Backtest Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                  <CardDescription>
                    {backtestResult
                      ? `Estrategia: ${backtestResult.strategy_name}`
                      : "Execute um backtest para ver os resultados"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {backtestResult ? (
                    <div className="space-y-4">
                      {/* Main Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Retorno Total</p>
                          <p
                            className={`text-2xl font-bold ${
                              backtestResult.total_return >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatPercent(backtestResult.total_return)}
                          </p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Retorno Anual</p>
                          <p
                            className={`text-2xl font-bold ${
                              backtestResult.annualized_return >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatPercent(backtestResult.annualized_return)}
                          </p>
                        </div>
                      </div>

                      {/* Secondary Metrics */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Sharpe Ratio</p>
                          <p className="font-semibold">
                            {backtestResult.sharpe_ratio.toFixed(2)}
                          </p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Volatilidade</p>
                          <p className="font-semibold">
                            {backtestResult.volatility.toFixed(2)}%
                          </p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Max Drawdown</p>
                          <p className="font-semibold text-red-600">
                            {formatPercent(backtestResult.max_drawdown)}
                          </p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Win Rate</p>
                          <p className="font-semibold">
                            {backtestResult.win_rate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Total Trades</p>
                          <p className="font-semibold">{backtestResult.total_trades}</p>
                        </div>
                        {backtestResult.alpha && (
                          <div className="rounded border p-2">
                            <p className="text-muted-foreground">Alpha</p>
                            <p className="font-semibold">
                              {formatPercent(backtestResult.alpha)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Disclaimer */}
                      <p className="text-xs text-muted-foreground">
                        {backtestResult.disclaimer}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">Nenhum backtest executado</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Backtest History */}
            {backtestHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historico de Backtests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {backtestHistory.slice(0, 5).map((bt) => (
                      <div
                        key={bt.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{bt.strategy_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {bt.tickers.join(", ")} | {bt.start_date.split("T")[0]} -{" "}
                            {bt.end_date.split("T")[0]}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              (bt.total_return ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {bt.total_return !== undefined
                              ? formatPercent(bt.total_return)
                              : "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(bt.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Previsao de Preco</CardTitle>
                  <CardDescription>
                    Gere previsoes baseadas em ML e analise tecnica
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ativo</Label>
                    <Input
                      placeholder="Ex: PETR4"
                      value={forecastTicker}
                      onChange={(e) => setForecastTicker(e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horizonte (dias)</Label>
                    <Select value={forecastDays} onValueChange={setForecastDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="14">14 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleGetForecast}
                    disabled={isLoading || !forecastTicker}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Brain className="mr-2 h-4 w-4" />
                    )}
                    Gerar Previsao
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resultado da Previsao</CardTitle>
                  <CardDescription>
                    {forecastResult
                      ? `${forecastResult.ticker} - ${forecastResult.forecast_date}`
                      : "Gere uma previsao para ver os resultados"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {forecastResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Preco Atual</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(forecastResult.current_price)}
                          </p>
                        </div>
                        <div className="rounded-lg border p-3">
                          <p className="text-sm text-muted-foreground">Preco Previsto</p>
                          <p className="text-2xl font-bold">
                            {formatCurrency(forecastResult.predicted_price)}
                          </p>
                          <p
                            className={`text-sm ${
                              forecastResult.predicted_change_pct >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatPercent(forecastResult.predicted_change_pct)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confianca</span>
                          <span>{(forecastResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${forecastResult.confidence * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded border p-3">
                        <p className="text-sm font-medium">Faixa de Previsao</p>
                        <p className="text-lg">
                          {formatCurrency(forecastResult.prediction_range.low)} -{" "}
                          {formatCurrency(forecastResult.prediction_range.high)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">Fatores Considerados</p>
                        <div className="flex flex-wrap gap-1">
                          {forecastResult.factors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {forecastResult.disclaimer}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <TrendingUp className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">Nenhuma previsao gerada</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Analysis Tab */}
          <TabsContent value="technical" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Analise Tecnica</CardTitle>
                  <CardDescription>
                    Indicadores tecnicos e sinais de trading
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ativo</Label>
                    <Input
                      placeholder="Ex: VALE3"
                      value={technicalTicker}
                      onChange={(e) => setTechnicalTicker(e.target.value.toUpperCase())}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleGetTechnical}
                    disabled={isLoading || !technicalTicker}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LineChart className="mr-2 h-4 w-4" />
                    )}
                    Analisar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resultado</CardTitle>
                  <CardDescription>
                    {technicalResult
                      ? `${technicalResult.ticker} - Tendencia: ${technicalResult.trend}`
                      : "Execute uma analise para ver os resultados"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {technicalResult ? (
                    <div className="space-y-4">
                      {/* Overall Signal */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Sinal Geral
                          </span>
                          <Badge
                            variant={
                              technicalResult.overall_signal === "COMPRA"
                                ? "default"
                                : technicalResult.overall_signal === "VENDA"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {technicalResult.overall_signal}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs">
                            <span>Forca</span>
                            <span>{(technicalResult.overall_strength * 100).toFixed(0)}%</span>
                          </div>
                          <div className="mt-1 h-2 rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${
                                technicalResult.overall_signal === "COMPRA"
                                  ? "bg-green-500"
                                  : technicalResult.overall_signal === "VENDA"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${technicalResult.overall_strength * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Indicators */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Indicadores</p>
                        {technicalResult.signals.slice(0, 5).map((signal, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded border p-2"
                          >
                            <span className="text-sm">{signal.indicator}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {signal.value.toFixed(2)}
                              </span>
                              <Badge
                                variant={
                                  signal.signal === "COMPRA"
                                    ? "default"
                                    : signal.signal === "VENDA"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {signal.signal}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Support/Resistance */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded border p-2">
                          <p className="text-xs text-muted-foreground">Suportes</p>
                          {technicalResult.support_levels.slice(0, 3).map((level, i) => (
                            <p key={i} className="text-sm font-medium text-green-600">
                              {formatCurrency(level)}
                            </p>
                          ))}
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-xs text-muted-foreground">Resistencias</p>
                          {technicalResult.resistance_levels.slice(0, 3).map((level, i) => (
                            <p key={i} className="text-sm font-medium text-red-600">
                              {formatCurrency(level)}
                            </p>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {technicalResult.disclaimer}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <LineChart className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">Nenhuma analise executada</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risk" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Analise de Risco</CardTitle>
                  <CardDescription>
                    Metricas de risco e diversificacao da carteira
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Ativos (max 10)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: ITUB4"
                        value={riskTickerInput}
                        onChange={(e) => setRiskTickerInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddRiskTicker()}
                      />
                      <Button variant="outline" onClick={handleAddRiskTicker}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {riskTickers.map((ticker) => (
                        <Badge key={ticker} variant="secondary" className="gap-1">
                          {ticker}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveRiskTicker(ticker)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleGetRisk}
                    disabled={isLoading || riskTickers.length === 0}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4" />
                    )}
                    Analisar Risco
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Metricas de Risco</CardTitle>
                  <CardDescription>
                    {riskResult
                      ? `Score de Risco: ${riskResult.risk_score}/100 (${riskResult.risk_category})`
                      : "Execute uma analise para ver os resultados"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {riskResult ? (
                    <div className="space-y-4">
                      {/* Risk Score */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <span>Score de Risco</span>
                          <Badge
                            variant={
                              riskResult.risk_score <= 30
                                ? "default"
                                : riskResult.risk_score <= 60
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {riskResult.risk_category}
                          </Badge>
                        </div>
                        <div className="mt-2 h-4 rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              riskResult.risk_score <= 30
                                ? "bg-green-500"
                                : riskResult.risk_score <= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${riskResult.risk_score}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-2xl font-bold">
                          {riskResult.risk_score}/100
                        </p>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Volatilidade</p>
                          <p className="font-semibold">{riskResult.volatility.toFixed(2)}%</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Sharpe Ratio</p>
                          <p className="font-semibold">{riskResult.sharpe_ratio.toFixed(2)}</p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">VaR 95%</p>
                          <p className="font-semibold text-red-600">
                            {formatPercent(riskResult.var_95)}
                          </p>
                        </div>
                        <div className="rounded border p-2">
                          <p className="text-muted-foreground">Max Drawdown</p>
                          <p className="font-semibold text-red-600">
                            {formatPercent(riskResult.max_drawdown)}
                          </p>
                        </div>
                      </div>

                      {/* Diversification */}
                      {riskResult.diversification && (
                        <div className="rounded border p-3">
                          <p className="text-sm font-medium mb-2">Diversificacao</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Concentracao Top 3</span>
                              <span>
                                {(riskResult.diversification.top_3_concentration * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          {riskResult.diversification.recommendations?.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p className="font-medium">Recomendacoes:</p>
                              <ul className="list-disc pl-4 mt-1">
                                {riskResult.diversification.recommendations
                                  .slice(0, 3)
                                  .map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">{riskResult.disclaimer}</p>
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Shield className="mx-auto h-12 w-12 opacity-50" />
                        <p className="mt-2">Nenhuma analise executada</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
