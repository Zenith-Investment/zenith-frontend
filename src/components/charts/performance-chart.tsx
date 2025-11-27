"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PerformanceData {
  date: string;
  value: number;
  invested?: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  height?: number;
  showInvested?: boolean;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
  }).format(value);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export function PerformanceChart({
  data,
  height = 300,
  showInvested = true,
}: PerformanceChartProps) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium">
            {label ? formatDate(label) : ""}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name === "value" ? "Patrimonio" : "Investido"}:{" "}
              {formatCurrency(entry.value)}
            </p>
          ))}
          {payload.length >= 2 && (
            <p
              className={`mt-1 text-sm font-medium ${
                payload[0].value >= payload[1].value
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {payload[0].value >= payload[1].value ? "+" : ""}
              {formatCurrency(payload[0].value - payload[1].value)}
            </p>
          )}
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
        Sem dados de performance
      </div>
    );
  }

  const minValue = Math.min(...data.map((d) => Math.min(d.value, d.invested || d.value)));
  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.invested || d.value)));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
          domain={[minValue - padding, maxValue + padding]}
          className="text-muted-foreground"
        />
        <Tooltip content={<CustomTooltip />} />
        {showInvested && data[0]?.invested && (
          <Line
            type="monotone"
            dataKey="invested"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="invested"
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          name="value"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
