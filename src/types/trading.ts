export interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Indicator {
  name: string;
  function: string;
  enabled: boolean;
  params: Record<string, number>;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
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
  strategy_type: string;
  symbol: string;
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