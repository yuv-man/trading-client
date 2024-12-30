import React, { useState } from 'react';
import { TradesTable } from './TradesTable';

const BacktestSheet = ({ results, symbol, interval, period }: { results: any, symbol: string, interval: string, period: string }) => {
  const [activeView, setActiveView] = useState('results');
  const startDate = results?.startDate || period;
  const endDate = results?.endDate || new Date().toISOString();

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
          <h2 className="text-2xl font-bold text-gray-900">Backtest Results - strategy-name</h2>
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
                value="$205.73"
                className="bg-green-50"
              />
              <StatCard 
                title="Strategy Yield" 
                value="0.21%"
                className="bg-green-50"
              />
              <StatCard 
                title="Buy & Hold Profit" 
                value="$4,663.47"
                className="bg-blue-50"
              />
              <StatCard 
                title="Buy & Hold Yield" 
                value="4.21%"
                className="bg-blue-50"
              />
              <StatCard 
                title="Max Draw Down" 
                value="$5.26"
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
                <tbody className="divide-y divide-gray-200">
                  {[
                    { metric: 'Profits', total: '$5586.38', long: '$5586.38', short: '$0' },
                    { metric: 'Losses', total: '$5368.18', long: '$5368.18', short: '$0' },
                    { metric: 'Net Profit', total: '$218.2', long: '$218.2', short: '$0' },
                    { metric: '% Profit', total: '0.21%', long: '0.21%', short: '0%' },
                    { metric: 'Winning Trades', total: '69.23%', long: '69.23%', short: '0%' },
                    { metric: 'Max Loss', total: '($-3224.95)', long: '($-3224.95)', short: '$0' },
                    { metric: 'Number of Trades', total: '13', long: '13', short: '0' },
                    { metric: 'Number of Winning Trades', total: '9', long: '9', short: '0' },
                    { metric: 'Number of Losing Trades', total: '4', long: '4', short: '0' },
                    { metric: 'Number of Even Trades', total: '0', long: '0', short: '0' },
                    { metric: 'Number of Trends', total: '4', long: '4', short: '0' },
                    { metric: 'Number of Trends Intra Day', total: '9', long: '9', short: '0' },
                    { metric: 'Avg Trade', total: '$16.78', long: '$16.78', short: '$0' },
                    { metric: 'Avg Winning Trade', total: '$620.71', long: '$620.71', short: '$0' },
                    { metric: 'Avg Losing Trade', total: '($-1342.05)', long: '($-1342.05)', short: '$0' },
                    { metric: 'Ratio Avg Win/Avg Loss', total: '0.46%', long: '0.46%', short: '0%' }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{row.metric}</td>
                      <td className="px-6 py-4 text-sm text-right font-mono text-gray-900">{row.total}</td>
                      <td className="px-6 py-4 text-sm text-right font-mono text-gray-900">{row.long}</td>
                      <td className="px-6 py-4 text-sm text-right font-mono text-gray-900">{row.short}</td>
                    </tr>
                  ))}
                </tbody>
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