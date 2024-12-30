export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  last_daily_peak?: number;
  last_daily_trough?: number;
  daily_trend?: string;
  pivot_point?: string;
}

export interface Indicator {
  name: string;
  function: string;
  enabled: boolean;
  params: Record<string, number>;
}

export interface Strategy {
  id: string;
  type: string;
  params: Record<string, number>;
}

export interface BacktestResult {
  trades: Trade[];
  performance: {
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    averageProfit: number;
  };
}

export interface Trade {
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  profit: number;
  type: 'LONG' | 'SHORT';
}

export interface StrategyRegistrationPayload {
  type: string;
  params: Record<string, unknown>;
}

export interface BacktestPayload {
    start_date?: string;
    end_date?: string;
    period?: string;
    interval: string;
  }

export interface StockDataPayload {
    symbol: string;
    start_date?: string;
    end_date?: string;
    period?: string;
    interval: string;
  }