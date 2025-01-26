import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TradingContextType, BacktestParams, StockDataParams } from './types';
import { tradingService } from '../utils/api';
import { Strategy } from '../types/trading';

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [symbol, setSymbol] = useState('SPY');
  const [interval, setInterval] = useState('5 mins');
  const [period, setPeriod] = useState('1 D');
  const [backtestResults, setBacktestResults] = useState(null);
  const [tradingMode, setTradingMode] = useState<'backtest' | 'live'>('backtest');
  const [intradayData, setIntradayData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [timeframe, setTimeframe] = useState<'intraday' | 'daily'>('intraday');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [strategies, setStrategies] = useState([]);

  const handleStrategySelect = useCallback((strategy: Strategy | null) => {
    setSelectedStrategy(strategy);
  }, []);

  const handleBacktest = async (params: BacktestParams) => {
    console.log(params);
    const res = await tradingService.runBacktest(params);
    if (res.status === 'success') {
      setBacktestResults(res.results.data);
    }
  };

  const handleStockData = useCallback(async (params: StockDataParams) => {
    try {
      const results = await tradingService.getStockData(params);
      if (results.status === 'success') {
        if (isIntraday(params.interval)) {
          setTimeframe('intraday');
          setIntradayData(results.intraday_data);
          setDailyData(results.daily_data);
        } else {
          setTimeframe('daily');
          setDailyData(results.daily_data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    }
  }, []);

  const isIntraday = useCallback((interval: string) => {
    return interval.includes('min') || interval.includes('hour');
  }, []);

  const toggleTimeframe = useCallback((newTimeframe: 'intraday' | 'daily') => {
    setTimeframe(newTimeframe);
  }, []);

  useEffect(() => {
    handleStockData({ interval, period, symbol });
  }, [handleStockData, symbol, interval, period]);

  useEffect(() => {
    tradingService.getStrategies().then(setStrategies);
  }, []);

  return (
    <TradingContext.Provider
      value={{
        symbol,
        setSymbol,
        interval,
        setInterval,
        period,
        setPeriod,
        backtestResults,
        tradingMode,
        intradayData,
        dailyData,
        timeframe,
        selectedStrategy,
        strategies,
        handleBacktest,
        handleStockData,
        isIntraday,
        toggleTimeframe,
        handleStrategySelect,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
}

export const useTradingContext = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTradingContext must be used within TradingProvider');
  }
  return context;
};