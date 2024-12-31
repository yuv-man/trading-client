import React from 'react';
import type { BacktestResult } from '../types/trading';
import { TrendingUp, DollarSign, BarChart2 } from 'lucide-react';

interface BacktestResultsProps {
  results: BacktestResult | null;
}

export function BacktestResults({ results }: BacktestResultsProps) {
  if (!results || !results.performance) return null;
  console.log(results);

  const {
    net_profit = 0,
    winning_rate = 0,
    total_trades = 0,
    avg_trade = 0
  } = results.performance.Total;


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Backtest Results</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <DollarSign size={20} />
            <span className="font-medium">NetProfit</span>
          </div>
          <span className="text-xl font-bold">${net_profit.toFixed(2)}</span>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <TrendingUp size={20} />
            <span className="font-medium">Win Rate</span>
          </div>
          <span className="text-xl font-bold">{winning_rate}%</span>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <BarChart2 size={20} />
            <span className="font-medium">Total Trades</span>
          </div>
          <span className="text-xl font-bold">{total_trades}</span>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <DollarSign size={20} />
            <span className="font-medium">Avg. Profit</span>
          </div>
          <span className="text-xl font-bold">${avg_trade.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}