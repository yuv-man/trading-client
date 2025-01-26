import React, { useState, useEffect } from 'react';
import { TradesTable } from './TradesTable';
import { formatDate } from '../../utils/helper';
import PerformanceTable from './PerformanceTable';

const BacktestSheet = ({ results, symbol, interval, period, strategy_name }: { results: any, symbol: string, interval: string, period: string, strategy_name?: string }) => {
  const [activeView, setActiveView] = useState('results');
  const startDate = formatDate(results?.start_date.split(" ")[0])
  const endDate = formatDate(results?.end_date.split(" ")[0]) 

  if (!results) {
    return (
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        <div className="text-center text-gray-600">No results available</div>
      </div>
    );
  }

  const StatCard = ({ title, value, className }: { title: string, value: string, className: string }) => (
    <div className={`p-4 rounded-lg  ${className}`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-sm">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Backtest Results - {strategy_name}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('results')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeView === 'results' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Results
            </button>
            <button
              onClick={() => setActiveView('trades')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                activeView === 'trades' 
                  ? 'bg-blue-700 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trades
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Symbol" 
            value={symbol}
            className="bg-gray-50"
          />
          <StatCard 
            title="Time Interval" 
            value={interval}
            className="bg-gray-50"
          />
          <StatCard 
            title="Start Date" 
            value={startDate}
            className="bg-gray-50"
          />
          <StatCard 
            title="End Date" 
            value={endDate}
            className="bg-gray-50"
          />
        </div>
      </div>
        
      {activeView === 'results' ? (
        <>
          {/* Performance Overview */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Performance Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Strategy Profit" 
                value={`$${results?.metrics?.Total?.net_profit}`}
                className="bg-green-50"
              />
              <StatCard 
                title="Strategy Yield" 
                value={`${results?.metrics?.Total?.profit_pct}%`}
                className="bg-green-50"
              />
              <StatCard 
                title="Buy & Hold Profit" 
                value={`$${results?.buy_and_hold_profit}`}
                className="bg-blue-50"
              />
              <StatCard 
                title="Buy & Hold Yield" 
                value={`${results?.buy_and_hold_profit_pct}%`}
                className="bg-blue-50"
              />
              <StatCard 
                title="Max Draw Down" 
                value={`$${results?.max_drawdown.toFixed(2)}`}
                className="bg-red-50"
              />
            </div>
          </div>

          {/* Detailed Statistics Table */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Detailed Statistics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Long</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Short</th>
                  </tr>
                </thead>
                <PerformanceTable results={results} />
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="p-6">
          <TradesTable trades={results.trades} />
        </div>
      )}
    </div>
  );
};

export default BacktestSheet;