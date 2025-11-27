"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  data: PriceData[];
  height?: number;
  ticker?: string;
}

const PERIODS = [
  { label: "1S", value: 7 },
  { label: "1M", value: 30 },
  { label: "3M", value: 90 },
  { label: "6M", value: 180 },
  { label: "1A", value: 365 },
  { label: "MAX", value: 0 },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

const formatVolume = (value: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value);

export function PriceChart({ data, height = 400, ticker }: PriceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(90);

  const filteredData =
    selectedPeriod === 0
      ? data
      : data.slice(-selectedPeriod);

  const isPositive =
    filteredData.length >= 2 &&
    filteredData[filteredData.length - 1].close >= filteredData[0].close;

  const change =
    filteredData.length >= 2
      ? filteredData[filteredData.length - 1].close - filteredData[0].close
      : 0;

  const changePercent =
    filteredData.length >= 2
      ? ((filteredData[filteredData.length - 1].close - filteredData[0].close) /
          filteredData[0].close) *
        100
      : 0;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ payload: PriceData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium">
            {label ? formatDate(label) : ""}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Abertura:</span>
            <span>{formatCurrency(d.open)}</span>
            <span className="text-muted-foreground">Maxima:</span>
            <span className="text-green-600">{formatCurrency(d.high)}</span>
            <span className="text-muted-foreground">Minima:</span>
            <span className="text-red-600">{formatCurrency(d.low)}</span>
            <span className="text-muted-foreground">Fechamento:</span>
            <span className="font-medium">{formatCurrency(d.close)}</span>
            <span className="text-muted-foreground">Volume:</span>
            <span>{formatVolume(d.volume)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        Sem dados de preco
      </div>
    );
  }

  const minPrice = Math.min(...filteredData.map((d) => d.low));
  const maxPrice = Math.max(...filteredData.map((d) => d.high));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {ticker && <span className="text-lg font-bold">{ticker}</span>}
          {filteredData.length > 0 && (
            <span className="ml-2 text-2xl font-bold">
              {formatCurrency(filteredData[filteredData.length - 1].close)}
            </span>
          )}
          <span
            className={`ml-2 text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(change)} ({changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* Period Selector */}
        <div className="flex gap-1">
          {PERIODS.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={filteredData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor={isPositive ? "#22c55e" : "#ef4444"}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={(v) => formatCurrency(v)}
            tick={{ fontSize: 12 }}
            domain={[minPrice - padding, maxPrice + padding]}
            className="text-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={isPositive ? "#22c55e" : "#ef4444"}
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
