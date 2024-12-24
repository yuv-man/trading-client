import React from 'react';
import { VictoryScatter } from 'victory';

interface ChartMarkersProps {
  trades: {
    time: string;
    price: number;
    type: 'buy' | 'sell';
  }[];
}

export function ChartMarkers({ trades }: ChartMarkersProps) {
  if (!trades || trades.length === 0) {
    return null;
  }

  const buyTrades = trades.filter(t => t.type === 'buy').map(t => ({
    x: t.time,
    y: t.price,
  }));

  const sellTrades = trades.filter(t => t.type === 'sell').map(t => ({
    x: t.time,
    y: t.price,
  }));
  console.log(buyTrades);

  return (
    <>
      {buyTrades.length > 0 && (
        <VictoryScatter
          data={buyTrades}
          style={{
            data: {
              fill: '#2196F3',
              stroke: 'white',
              strokeWidth: 1,
            },
          }}
          size={7}
          symbol="triangleUp"
        />
      )}
      {sellTrades.length > 0 && (
        <VictoryScatter
          data={sellTrades}
          style={{
            data: {
              fill: '#FF5252',
              stroke: 'white',
              strokeWidth: 1,
            },
          }}
          size={7}
          symbol="triangleDown"
        />
      )}
    </>
  );
} 