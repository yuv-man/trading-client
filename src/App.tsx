import React, { useState, useEffect } from 'react';
import './App.css';
import { Chart } from './components/Chart';
import { ControlPanel } from './components/ControlPanel';
import { BacktestResults } from './components/BacktestResults';
import type { BacktestResult, ChartData, Indicator, Strategy } from './types/trading';
import { registerStrategy, runBacktest, getStockData } from './utils/api';

// Sample data - replace with actual API calls
const sampleData: ChartData[] = [
  { time: '2024-01-01', open: 150, high: 155, low: 148, close: 153 },
  { time: '2024-01-02', open: 153, high: 157, low: 151, close: 156 },
  { time: '2024-01-03', open: 156, high: 160, low: 154, close: 158 },
  { time: '2024-01-04', open: 158, high: 162, low: 156, close: 150 },
  { time: '2024-01-05', open: 160, high: 165, low: 158, close: 163 },
];

export default function App() {
  const [symbol, setSymbol] = useState<string>('SPY');
  const [interval, setInterval] = useState<string>('5 mins');
  const [period, setPeriod] = useState<string>('1 D');
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);
  const [tradingMode, setTradingMode] = useState<'backtest' | 'live'>('backtest');
  const [chartData, setChartData] = useState<ChartData[]>([]);

  const handleIndicatorChange = (indicators: Indicator[]) => {
    setActiveIndicators(indicators.filter(i => i.enabled).map(i => i.id));
  };

  const handleStrategySelect = (strategy: Strategy | null) => {
    // Handle strategy selection
  };

  const handleBacktest = async (params: {
    startDate: string;
    endDate: string;
    interval: string;
    period: string;
    symbol: string;
  }) => {
    // Here you would make an API call to your backend
    // For now, we'll simulate a response
    const simulatedResults: BacktestResult = {
      trades: [
        {
          entryTime: '2024-01-01',
          exitTime: '2024-01-02',
          entryPrice: 150,
          exitPrice: 156,
          profit: 6,
          type: 'LONG',
        },
      ],
      performance: {
        totalProfit: 1250.50,
        winRate: 0.65,
        totalTrades: 24,
        averageProfit: 52.10,
      },
    };
    
    setBacktestResults(simulatedResults);
  };

  const handleStockData = React.useCallback(async (params: {
    startDate?: string;
    endDate?: string;
    interval: string;
    period?: string;
    symbol: string;
  }) => {
    try {
      const results = await getStockData(params);
      if(results.status === 'success') {
        setChartData(results.data);
      }
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    }
  }, []);

  useEffect(() => {
    handleStockData({
      interval: interval,
      period: period,
      symbol: symbol,
    });
  }, [handleStockData, symbol, interval, period]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Stock Trading Analysis</h1>
        
        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setTradingMode('backtest')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                tradingMode === 'backtest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Backtest Mode
            </button>
            <button
              type="button"
              onClick={() => setTradingMode('live')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                tradingMode === 'live'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Live Trading
            </button>
          </div>
        </div>

        <div className="app-main-container">
          <div className="app-main-container-left">
            <ControlPanel
              onIndicatorChange={handleIndicatorChange}
              onSymbolChange={setSymbol}
              onIntervalChange={setInterval}
              onPeriodChange={setPeriod}
              onStrategySelect={handleStrategySelect}
              onBacktest={handleBacktest}
              tradingMode={tradingMode}
              symbol={symbol}
              period={period}
              interval={interval}
            />
          </div>
          <div className="app-main-container-right">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Chart
                symbol={symbol}
                data={chartData}
                indicators={activeIndicators}
                trades={backtestResults?.trades.map(trade => ({
                  time: trade.entryTime,
                  price: trade.entryPrice,
                  type: 'buy',
                }))}
              />
            </div>
            {backtestResults && <BacktestResults results={backtestResults} />}
          </div>
        </div>
      </div>
    </div>
  );
}