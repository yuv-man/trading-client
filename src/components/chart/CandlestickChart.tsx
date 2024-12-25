import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import type { ChartData } from '../../types/trading';
import '../css/CandlestickChart.css';

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
    macd?: { data: { time: string; value: number }[] };
    stoch?: { data: { time: string; value: number }[] };
    adx?: { data: { time: string; value: number }[] };
    bb?: { data: { time: string; value: number }[] };
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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: true,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Format data for lightweight-charts
    const chartData: CandlestickData[] = data.map(d => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(chartData);

    // Add SMA if enabled
    if (indicators?.sma && visibilitySettings.showSMA) {
      const smaSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 1,
      });
      smaSeries.setData(
        indicators.sma.data.map(d => ({
          time: d.time,
          value: d.value,
        }))
      );
    }

    // Add markers for peaks and troughs
    if (visibilitySettings.showPeaksTroughs && peaksTroughs) {
      candlestickSeries.setMarkers(
        peaksTroughs.map(pt => ({
          time: pt.time,
          position: pt.type === 'peak' ? 'aboveBar' : 'belowBar',
          color: pt.type === 'peak' ? '#4CAF50' : '#F44336',
          shape: 'circle',
          size: 1,
        }))
      );
    }

    // Store references
    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, indicators, peaksTroughs, visibilitySettings]);

  return (
    <div className="w-full h-[500px]">
      <div className="chart-header">
        <h2 className="text-xl font-semibold">{symbol}</h2>
        <span className="text-md">
          ${data[data.length - 1]?.close.toFixed(2)}
        </span>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}