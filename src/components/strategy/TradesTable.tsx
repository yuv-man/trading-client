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
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Entry Time</th>
            <th className="px-4 py-2 text-left">Exit Time</th>
            <th className="px-4 py-2 text-left">Duration</th>
            <th className="px-4 py-2 text-right">Entry Price</th>
            <th className="px-4 py-2 text-right">Exit Price</th>
            <th className="px-4 py-2 text-right">Size</th>
            <th className="px-4 py-2 text-right">Portfolio Value</th>
            <th className="px-4 py-2 text-right">Profit ($)</th>
            <th className="px-4 py-2 text-right">Profit (%)</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">{trade.type}</td>
              <td className="px-4 py-2">{trade.entry_time}</td>
              <td className="px-4 py-2">{trade.exit_time}</td>
              <td className="px-4 py-2">{trade.duration}</td>
              <td className="px-4 py-2 text-right">${trade.entry_price.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">${trade.exit_price.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">${trade.size.toLocaleString()}</td>
              <td className="px-4 py-2 text-right">${trade.portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td className={`px-4 py-2 text-right ${trade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${trade.profit.toFixed(2)}
              </td>
              <td className={`px-4 py-2 text-right ${trade.profit_pct > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trade.profit_pct.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 