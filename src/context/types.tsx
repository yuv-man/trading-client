import { Strategy, BacktestResult, ChartData } from '../types/trading';

export interface TradingContextType {
    symbol: string;
    setSymbol: (symbol: string) => void;
    interval: string;
    setInterval: (interval: string) => void;
    period: string;
    setPeriod: (period: string) => void;
    backtestResults: BacktestResult | null;
    tradingMode: 'backtest' | 'live';
    intradayData: ChartData[];
    dailyData: ChartData[];
    timeframe: 'intraday' | 'daily';
    selectedStrategy: Strategy | null;
    strategies: Strategy[];
    handleBacktest: (params: BacktestParams) => Promise<void>;
    handleStockData: (params: StockDataParams) => Promise<void>;
    isIntraday: (interval: string) => boolean;
    toggleTimeframe: (timeframe: 'intraday' | 'daily') => void;
    handleStrategySelect: (strategy: Strategy | null) => void;
  }
  
  export interface BacktestParams {
    startDate?: string;
    endDate?: string;
    interval: string;
    period?: string;
    symbol: string;
  }
  
  export interface StockDataParams extends BacktestParams {}