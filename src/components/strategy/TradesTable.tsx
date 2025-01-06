import React from 'react';
import type { Trade } from '../../types/trading';
import '../css/TradesTable.css'

interface TradesTableProps {
  trades: Trade[];
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left text-sm">Type</th>
            <th className="px-4 py-2 text-left text-sm">Entry Time</th>
            <th className="px-4 py-2 text-left text-sm">Exit Time</th>
            <th className="px-4 py-2 text-left text-sm">Duration</th>
            <th className="px-4 py-2 text-right text-sm">Profit ($)</th>
            <th className="px-4 py-2 text-right text-sm">Profit (%)</th>
            <th className="px-4 py-2 text-right text-sm">Entry Price</th>
            <th className="px-4 py-2 text-right text-sm">Exit Price</th>
            <th className="px-4 py-2 text-right text-sm">Size</th>
            <th className="px-4 py-2 text-right text-sm">Portfolio Value</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2 text-sm">{trade.type}</td>
              <td className="px-4 py-2 text-sm">{trade.entry_time}</td>
              <td className="px-4 py-2 text-sm">{trade.exit_time}</td>
              <td className="px-4 py-2 text-sm">{trade.duration}</td>
              <td className={`px-4 py-2 text-right text-sm ${trade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${trade.profit > 0 ? trade.profit.toFixed(2) : `(${trade.profit.toFixed(2)})` }
              </td>
              <td className={`px-4 py-2 text-right text-sm ${trade.profit_pct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trade.profit_pct > 0 ? trade.profit_pct.toFixed(2) :   `(${trade.profit_pct.toFixed(2)})`}%
              </td>
              <td className="px-4 py-2 text-right text-sm">${trade.entry_price.toFixed(2)}</td>
              <td className="px-4 py-2 text-right text-sm">${trade.exit_price.toFixed(2)}</td>
              <td className="px-4 py-2 text-right text-sm">${trade.size.toLocaleString()}</td>
              <td className="px-4 py-2 text-right text-sm">${trade.portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 