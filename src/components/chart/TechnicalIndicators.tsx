import React, { useEffect } from 'react';
import { ISeriesApi, LineStyle, IChartApi, UTCTimestamp } from 'lightweight-charts';
import type { ChartData } from '../../types/trading';
import { calculateSMA, calculateRSI, calculateBollingerBands, calculateMACD, calculateStochastic, calculateADX } from '../../utils/indicators';

interface TechnicalIndicatorsProps {
  data: ChartData[];
  activeIndicators: string[];
  chart: IChartApi;
}

export function TechnicalIndicators({ data, activeIndicators, chart }: TechnicalIndicatorsProps) {
  useEffect(() => {
    if (!data?.length || !activeIndicators?.length || !chart) return;

    const indicators: ISeriesApi<"Line">[] = [];

    if (activeIndicators.includes('sma') && data.length >= 20) {
      const smaLine = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
      });
      smaLine.setData(formatIndicatorData(calculateSMA(data, 20)));
      indicators.push(smaLine);
    }

    if (activeIndicators.includes('rsi') && data.length >= 20) {
      const rsiLine = chart.addLineSeries({
        color: '#FF5722',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
      });
      rsiLine.setData(formatIndicatorData(calculateRSI(data, 14)));
      indicators.push(rsiLine);
    }

    if (activeIndicators.includes('bollinger') && data.length >= 20) {
      const bbandsData = calculateBollingerBands(data, 20, 2);
      bbandsData.forEach((lineData) => {
        const bband = chart.addLineSeries({
          color: '#9C27B0',
          lineWidth: 1,
          lineStyle: LineStyle.Solid,
          opacity: 0.5,
        });
        bband.setData(formatIndicatorData(lineData));
        indicators.push(bband);
      });
    }

    if (activeIndicators.includes('macd') && data.length >= 20) {
      const macdData = calculateMACD(data, 12, 26, 9);
      const macdLine = chart.addLineSeries({
        color: '#FF9800',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
      });
      const signalLine = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
      });
      macdLine.setData(formatIndicatorData(macdData.macd.map((y, i) => ({ 
        x: new Date(data[i].time), 
        y 
      }))));
      signalLine.setData(formatIndicatorData(macdData.signal));
      indicators.push(macdLine, signalLine);
    }

    if (activeIndicators.includes('stoch') && data.length >= 20) {
      const stochData = calculateStochastic(data, 14, 3, 3);
      const kLine = chart.addLineSeries({
        color: '#FF5722',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
      });
      const dLine = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
      });
      kLine.setData(formatIndicatorData(stochData.k));
      dLine.setData(formatIndicatorData(stochData.d));
      indicators.push(kLine, dLine);
    }

    if (activeIndicators.includes('adx') && data.length >= 20) {
      const adxLine = chart.addLineSeries({
        color: '#607D8B',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
      });
      adxLine.setData(formatIndicatorData(calculateADX(data, 14)));
      indicators.push(adxLine);
    }

    return () => {
      indicators.forEach(indicator => {
        chart.removeSeries(indicator);
      });
    };
  }, [data, activeIndicators, chart]);

  return null;
}

const formatIndicatorData = (data: { x: Date; y: number; }[]) => {
  return data.map(d => ({
    time: Math.floor(d.x.getTime() / 1000) as UTCTimestamp,
    value: d.y
  }));
};