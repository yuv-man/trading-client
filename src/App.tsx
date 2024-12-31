import React, { useState, useEffect } from 'react';
import './App.css';
import { Chart } from './components/Chart';
import { ControlPanel } from './components/ControlPanel';
import { BacktestResults } from './components/BacktestResults';
import type { BacktestResult, ChartData, Strategy } from './types/trading';
import { runBacktest, getStockData } from './utils/api';
import BacktestSheet from './components/strategy/BacktestSheet';
import { FaChartBar, FaCode, FaCog } from 'react-icons/fa';


export default function App() {
  const [symbol, setSymbol] = useState<string>('SPY');
  const [interval, setInterval] = useState<string>('5 mins');
  const [period, setPeriod] = useState<string>('1 D');
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);
  const [tradingMode, setTradingMode] = useState<'backtest' | 'live'>('backtest');
  const [intradayData, setIntradayData] = useState<ChartData[]>([]);
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [timeframe, setTimeframe] = useState<'intraday' | 'daily'>('intraday');
  const [activeView, setActiveView] = useState<'chart' | 'strategy' | 'optimize'>('chart');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const handleStrategySelect = (strategy: Strategy | null) => {
    setSelectedStrategy(strategy);
  };

  const handleBacktest = async (params: {
    startDate?: string;
    endDate?: string;
    interval: string;
    period?: string;
    symbol: string;
  }) => {
    const res = await runBacktest(params);
    if(res.status === 'success') {
      const resultsFromServer = res.results.data;
      const results: BacktestResult = {
        trades: resultsFromServer.trades,
        performance: resultsFromServer.metrics,
        max_drawdown: resultsFromServer.max_drawdown,
        start_date: resultsFromServer.start_date,
        end_date: resultsFromServer.end_date,
        buy_and_hold_profit: resultsFromServer.buy_and_hold_profit,
        buy_and_hold_profit_pct: resultsFromServer.buy_and_hold_profit_pct,
        initial_capital: resultsFromServer.initial_capital,
        current_capital: resultsFromServer.current_capital,
      }
      setBacktestResults(results);
    };
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
        if(isIntraday(params.interval)) {
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

  useEffect(() => {
    handleStockData({
      interval: interval,
      period: period,
      symbol: symbol,
    });
  }, [handleStockData, symbol, interval, period]);

  const isIntraday = (interval: string) => {
    return interval.includes('min') || interval.includes('hour') || interval.includes('mins') || interval.includes('hours');
  };

  const toggleTimeframe = (timeframe: 'intraday' | 'daily') => {
    setTimeframe(timeframe);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <nav className="bg-white w-16 min-h-screen shadow-md flex flex-col items-center py-4">
        <button
          onClick={() => setActiveView('chart')}
          className={`p-3 rounded-lg mb-4 transition-colors ${
            activeView === 'chart'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Chart"
        >
          <FaChartBar size={24} />
        </button>
        <button
          onClick={() => setActiveView('strategy')}
          className={`p-3 rounded-lg mb-4 transition-colors ${
            activeView === 'strategy'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Strategy"
        >
          <FaCode size={24} />
        </button>
        <button
          onClick={() => setActiveView('optimize')}
          className={`p-3 rounded-lg mb-4 transition-colors ${
            activeView === 'optimize'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          title="Optimize"
        >
          <FaCog size={24} />
        </button>
      </nav>
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Stock Trading Analysis</h1>
          
          <div className="mb-6">
            <div className="app-backtest-mode">
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
          </div>


          {activeView === 'chart' && (
            <div className="app-main-container">
              <div className="app-main-container-left">
                <ControlPanel
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
                    data={timeframe === 'intraday' ? intradayData : dailyData}
                    trades={backtestResults?.trades}
                    timeframeChanged={toggleTimeframe}
                    timeframe={timeframe}
                    isIntraday={isIntraday(interval)}
                  />
                </div>
                {backtestResults && <BacktestResults results={backtestResults} />}
              </div>
            </div>
          )}

          {activeView === 'strategy' && (
            <BacktestSheet 
              results={backtestResults} 
              symbol={symbol} 
              period={period}
              interval={interval} 
              strategy_name={selectedStrategy?.type}
            />
          )}

          {activeView === 'optimize' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Strategy Optimization</h2>
              {/* Add Optimization component here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}