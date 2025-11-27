// Portfolio types matching the backend API responses

export type AssetClass =
  | "stocks"
  | "fiis"
  | "fixed_income"
  | "crypto"
  | "etf"
  | "bdr"
  | "funds"
  | "cash"
  | "other";

export interface PortfolioAsset {
  id: number;
  ticker: string;
  asset_class: AssetClass;
  quantity: number;
  average_price: number;
  broker: string | null;
  current_price: number | null;
  current_value: number | null;
  total_invested: number;
  profit_loss: number | null;
  profit_loss_percentage: number | null;
  weight_in_portfolio: number | null;
  created_at: string;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  assets_count: number;
}

export interface AllocationByClass {
  asset_class: AssetClass;
  value: number;
  percentage: number;
  count: number;
}

export interface PortfolioResponse {
  summary: PortfolioSummary;
  assets: PortfolioAsset[];
  allocation_by_class: AllocationByClass[];
}

export interface PerformanceDataPoint {
  date: string;
  value: number;
  invested: number;
}

export interface PortfolioPerformance {
  period: string;
  start_value: number;
  end_value: number;
  total_return: number;
  total_return_percentage: number;
  annualized_return: number | null;
  volatility: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  history: PerformanceDataPoint[];
}

export interface AddAssetRequest {
  ticker: string;
  asset_class: AssetClass;
  quantity: number;
  average_price: number;
  broker?: string;
  purchase_date?: string;
}
