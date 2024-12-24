import React from 'react';
import { CandlestickChart } from './chart/CandlestickChart';
import { TechnicalIndicators } from './chart/TechnicalIndicators';
import type { ChartData } from '../types/trading';

interface ChartProps {
  data: ChartData[];
  indicators: string[];
  symbol: string;
  trades?: {
    time: string;
    price: number;
    type: 'buy' | 'sell';
  }[];
}

export function Chart({ data, indicators, trades, symbol }: ChartProps) {
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-white rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="relative h-[500px] w-full">
      <CandlestickChart data={data} trades={trades} symbol={symbol} />
      {indicators?.length > 0 && (
        <TechnicalIndicators data={data} activeIndicators={indicators} />
      )}
    </div>
  );
}