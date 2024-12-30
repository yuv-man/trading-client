import React from 'react';
import type { Trade } from '../../types/trading';

interface TradesTableProps {
  trades: Trade[];
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Entry Time</th>
            <th className="px-4 py-2 text-left">Exit Time</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-right">Entry Price</th>
            <th className="px-4 py-2 text-right">Exit Price</th>
            <th className="px-4 py-2 text-right">Profit</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="border-b">
              <td className="px-4 py-2">{trade.entryTime}</td>
              <td className="px-4 py-2">{trade.exitTime}</td>
              <td className="px-4 py-2">{trade.type}</td>
              <td className="px-4 py-2 text-right">${trade.entryPrice.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">${trade.exitPrice.toFixed(2)}</td>
              <td className={`px-4 py-2 text-right ${trade.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${trade.profit.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 