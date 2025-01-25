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
    Total: {
      net_profit: number;
      winning_rate: number;
      total_trades: number;
      avg_trade: number;
    };
    Long: {
      net_profit: number;
      winning_rate: number;
      total_trades: number;
      avg_trade: number;
    };
    Short: {
      net_profit: number;
      winning_rate: number;
      total_trades: number;
      avg_trade: number;
    };
  };
  max_drawdown: number;
  start_date: string;
  end_date: string;
  buy_and_hold_profit: number;
  buy_and_hold_profit_pct: number;
  initial_capital: number;
  current_capital: number;
}

export interface Trade {
  duration: string;
  entry_time: string;
  exit_time: string;
  entry_price: number;
  exit_price: number;
  profit: number;
  profit_pct: number;
  portfolio_value: number;
  position: number;
  size: number;
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

  export interface OptimizeStrategyPayload {
    strategy_type: string;
    param_ranges: Record<string, number[]>;
    initial_guess: number[];
    symbol: string;
    optimize_target: string;
    interval: string;
    period: string;
  }

export interface StockDataPayload {
    symbol: string;
    start_date?: string;
    end_date?: string;
    period?: string;
    interval: string;
  }

  export interface Parameter {
    name: string;
    min: number;
    max: number;
    step: number;
    initialGuess: number;
  }

  export interface OptimizationResult {
    best_parameters: { [key: string]: number };
    best_performance: {data: {
      metrics: {
        Total: Record<string, number>,
        Long: Record<string, number>,
        Short: Record<string, number>
      },
      max_drawdown: number;
    }};
  }

  export interface StartTradingPayload {
    strategy_type: string;
    symbol: string;
    interval: string;
    params: Record<string, number>;
  }