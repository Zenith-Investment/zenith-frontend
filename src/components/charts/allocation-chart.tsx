"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AllocationData {
  asset_class: string;
  value: number;
  percentage: number;
}

interface AllocationChartProps {
  data: AllocationData[];
  height?: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const ASSET_LABELS: Record<string, string> = {
  stocks: "Acoes",
  fiis: "FIIs",
  fixed_income: "Renda Fixa",
  etf: "ETFs",
  crypto: "Crypto",
  bdr: "BDRs",
  funds: "Fundos",
  cash: "Reserva",
  other: "Outros",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function AllocationChart({ data, height = 300 }: AllocationChartProps) {
  const chartData = data.map((item) => ({
    name: ASSET_LABELS[item.asset_class] || item.asset_class,
    value: item.value,
    percentage: item.percentage,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-medium">{d.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(d.value)}
          </p>
          <p className="text-sm text-primary">{d.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-4 pt-4">
        {payload.map((entry: { value: string; color: string }, index: number) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        Sem dados de alocacao
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}
