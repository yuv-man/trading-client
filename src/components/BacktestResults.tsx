import React from 'react';
import type { BacktestResult } from '../types/trading';
import { TrendingUp, DollarSign, BarChart2 } from 'lucide-react';
import { TradesTable } from './strategy/TradesTable';

interface BacktestResultsProps {
  results: BacktestResult | null;
}

export function BacktestResults({ results }: BacktestResultsProps) {
  if (!results || !results.performance) return null;

  const {
    totalProfit = 0,
    winRate = 0,
    totalTrades = 0,
    averageProfit = 0
  } = results.performance;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Backtest Results</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <DollarSign size={20} />
            <span className="font-medium">Total Profit</span>
          </div>
          <span className="text-2xl font-bold">${totalProfit.toFixed(2)}</span>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <TrendingUp size={20} />
            <span className="font-medium">Win Rate</span>
          </div>
          <span className="text-2xl font-bold">{(winRate * 100).toFixed(1)}%</span>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <BarChart2 size={20} />
            <span className="font-medium">Total Trades</span>
          </div>
          <span className="text-2xl font-bold">{totalTrades}</span>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <DollarSign size={20} />
            <span className="font-medium">Avg. Profit</span>
          </div>
          <span className="text-2xl font-bold">${averageProfit.toFixed(2)}</span>
        </div>
      </div>

      <TradesTable trades={results.trades} />
    </div>
  );
}