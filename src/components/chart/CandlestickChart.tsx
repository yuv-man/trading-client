import React from 'react';
import {
  VictoryChart,
  VictoryAxis,
  VictoryCandlestick,
  VictoryTooltip,
  VictoryLine,
  VictoryScatter,
} from 'victory';
import { format } from 'date-fns';
import type { ChartData } from '../../types/trading';
import { ChartMarkers } from './ChartMarkers';

interface CandlestickChartProps {
  data: ChartData[];
  symbol: string;
  trades?: {
    time: string;
    price: number;
    type: 'buy' | 'sell';
  }[];
  indicators?: {
    sma?: { period: number; data: { time: string; value: number }[] };
    rsi?: { data: { time: string; value: number }[] };
  };
    peaksTroughs?: {
    time: string;
    price: number;
    type: 'peak' | 'trough';
  }[];
  trends?: {
    startTime: string;
    endTime: string;
    startPrice: number;
    endPrice: number;
    type: 'uptrend' | 'downtrend';
  }[];
  visibilitySettings?: {
    showTrades: boolean;
    showTrends: boolean;
    showPeaksTroughs: boolean;
    showSMA: boolean;
    showRSI: boolean;
  };
}

export function CandlestickChart({ 
  data, 
  symbol, 
  trades, 
  indicators,
  peaksTroughs,
  trends,
  visibilitySettings = {
    showTrades: true,
    showTrends: true,
    showPeaksTroughs: true,
    showSMA: true,
    showRSI: true
  }
}: CandlestickChartProps) {
  const chartData = data.map(d => ({
    x: new Date(d.time),
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));

  const currentPrice = chartData && chartData.length > 0 ? chartData[chartData.length - 1].close : null;

  return (
    <div className="w-full h-[500px]">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-xl font-semibold">{symbol}</h2>
        <span className="text-lg">${currentPrice?.toFixed(2)}</span>
      </div>
      
      <VictoryChart 
        domainPadding={{ x: 25 }}
        scale={{ x: 'time' }}
      >
        <VictoryAxis
          tickFormat={(t) => format(t, 'MM/dd')}
          style={{
            tickLabels: { fontSize: 10, padding: 5 },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `$${t}`}
          style={{
            tickLabels: { fontSize: 10, padding: 5 },
          }}
        />
        <VictoryCandlestick
          candleColors={{ positive: '#26a69a', negative: '#ef5350' }}
          data={chartData}
          style={{
            data: {
              stroke: ({ datum }) =>
                datum.close > datum.open ? '#26a69a' : '#ef5350',
              strokeWidth: 1,
            },
          }}
          labels={({ datum }) => [
            `Date: ${format(datum.x, 'yyyy-MM-dd HH:mm')}`,
            `Open: $${datum.open.toFixed(2)}`,
            `High: $${datum.high.toFixed(2)}`,
            `Low: $${datum.low.toFixed(2)}`,
            `Close: $${datum.close.toFixed(2)}`,
          ].join('\n')}
          labelComponent={
            <VictoryTooltip
              cornerRadius={5}
              pointerLength={0}
              flyoutStyle={{
                fill: 'rgba(255, 255, 255, 0.95)',
                stroke: '#ccc',
                strokeWidth: 1,
              }}
              style={{
                fontSize: 12,
                fontFamily: 'monospace',
              }}
              flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
            />
          }
          events={[
            {
              target: "data",
              eventHandlers: {
                onMouseOver: () => ({
                  target: "labels",
                  mutation: () => ({ active: true })
                }),
                onMouseOut: () => ({
                  target: "labels",
                  mutation: () => ({ active: false })
                })
              }
            }
          ]}
        />

        {indicators?.sma && visibilitySettings.showSMA && (
          <VictoryLine
            data={indicators.sma.data.map(d => ({
              x: new Date(d.time),
              y: d.value
            }))}
            style={{ data: { stroke: "#2196F3", strokeWidth: 1 } }}
          />
        )}

        {visibilitySettings.showPeaksTroughs && peaksTroughs && (
          <VictoryScatter
            data={peaksTroughs.map(pt => ({
              x: new Date(pt.time),
              y: pt.price,
              type: pt.type
            }))}
            style={{
              data: {
                fill: ({ datum }) => datum.type === 'peak' ? "#4CAF50" : "#F44336",
                size: 5
              }
            }}
          />
        )}

        {visibilitySettings.showTrends && trends && (
          <VictoryLine
            data={trends.map(trend => [
              { x: new Date(trend.startTime), y: trend.startPrice },
              { x: new Date(trend.endTime), y: trend.endPrice }
            ])}
            style={{
              data: { 
                stroke: ({ datum }) => datum.type === 'uptrend' ? "#4CAF50" : "#F44336",
                strokeWidth: 1,
                strokeDasharray: "5,5"
              }
            }}
          />
        )}

        {visibilitySettings.showTrades && trades && <ChartMarkers trades={trades} />}
        
      </VictoryChart>
    </div>
  );
}