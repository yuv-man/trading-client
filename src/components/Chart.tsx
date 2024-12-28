import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts';
import type { ChartData, Indicator } from '../types/trading';
import { Settings, Plus, Minus, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { indicators, calculateSMA, calculateRSI, calculateBollingerBands, calculateMACD } from '../utils/indicators';
import { IndicatorParams } from './IndicatorParams';
import './css/Chart.css';
import { ChartIndicator } from './ChartIndicator';

interface ChartProps {
  data: ChartData[];
  symbol: string;
  trades?: {
    time: string;
    price: number;
    type: 'buy' | 'sell';
  }[];
}

interface IndicatorState {
  key: string;
  params: Record<string, any>;
}

export function Chart({ data, trades, symbol }: ChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const indicatorChartsRef = useRef<Record<string, IChartApi>>({});
  const chartRef = useRef<IChartApi | null>(null);
  const [showIndicatorSettings, setShowIndicatorSettings] = useState(false);
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>({});
  const [activeIndicators, setActiveIndicators] = useState<IndicatorState[]>([]);
  const [showTrends, setShowTrends] = useState(false);
  const trendLinesRef = useRef<any[]>([]);

  // Add this to track which indicators need separate charts
  const SEPARATE_CHART_INDICATORS = ['RSI', 'MACD'];
  const INDICATOR_HEIGHTS: Record<string, number> = {
    RSI: 150,
    MACD: 150,
  };

  const formattedData = useMemo(() => {
    return Object.values(data)
      .map(d => {
        const date = new Date(d.time);
        const time = Math.floor(date.getTime() / 1000) as UTCTimestamp;

        return {
          time,
          open: Number(d.open),
          high: Number(d.high),
          low: Number(d.low),
          close: Number(d.close),
          volume: Number(d.volume || 0)
        };
      })
      .sort((a, b) => a.time - b.time);
  }, [data]);

  // Add this memoized trend data calculation
  const trendSegments = useMemo(() => {
    const segments = {
      uptrend: [] as any[],
      downtrend: [] as any[]
    };

    formattedData.forEach((d, i) => {
      const trend = data.find(orig => new Date(orig.time).getTime() / 1000 === d.time)?.daily_trend;
      if (trend === 'uptrend') {
        segments.uptrend.push({
          time: d.time,
          value: d.high,
          lowerValue: d.low
        });
      } else if (trend === 'downtrend') {
        segments.downtrend.push({
          time: d.time,
          value: d.high,
          lowerValue: d.low
        });
      }
    });

    return segments;
  }, [formattedData, data]);

  const initializeChart = () => {
    if (!chartContainerRef.current || !data?.length) return null;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { type: 'solid', color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        tickMarkFormatter: (time: UTCTimestamp) => {
          const date = new Date(time * 1000);
          const now = new Date();
          const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffInDays > 1) {
            return date.toLocaleDateString();
          }
          
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          
          if (date.getSeconds() === 0) {
            return `${hours}:${minutes}`;
          }
          
          const seconds = date.getSeconds().toString().padStart(2, '0');
          return `${hours}:${minutes}:${seconds}`;
        }
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        mode: 1
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    // Initialize separate charts for indicators that need them
    activeIndicators.forEach(indicator => {
      if (SEPARATE_CHART_INDICATORS.includes(indicator.key)) {
        // Check if chart already exists
        if (!indicatorChartsRef.current[indicator.key]) {
          const container = document.getElementById(`${indicator.key}-chart`);
          if (container) {
            const indicatorChart = createChart(container, {
              width: container.clientWidth,
              height: INDICATOR_HEIGHTS[indicator.key],
              layout: {
                background: { type: 'solid', color: '#ffffff' },
                textColor: '#333',
              },
              grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' },
              },
              timeScale: {
                visible: true,
                timeVisible: true,
                secondsVisible: true,
              },
            });
            indicatorChartsRef.current[indicator.key] = indicatorChart;
          }
        }
      }
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as an overlay
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Update this line to use formattedData instead
    candlestickSeries.setData(formattedData);

    // Update this line to use formattedData
    volumeSeries.setData(
      formattedData.map(d => ({
        time: d.time,
        value: d.volume,
        color: d.close >= d.open ? '#26a69a' : '#ef5350'
      }))
    );

    // Add trades markers if available
    if (trades?.length) {
      const markers = trades.map(trade => ({
        time: Math.floor(new Date(trade.time).getTime() / 1000) as UTCTimestamp,
        position: trade.type === 'buy' ? 'belowBar' : 'aboveBar',
        color: trade.type === 'buy' ? '#26a69a' : '#ef5350',
        shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
        text: `${trade.type.toUpperCase()} @ ${trade.price}`
      }));
      candlestickSeries.setMarkers(markers);
    }

    chart.timeScale().fitContent();

    return chart;
  };

  // Update addTrendLines to use memoized data
  const addTrendLines = useCallback((chart: IChartApi) => {
    // Clear existing trend lines safely
    trendLinesRef.current = trendLinesRef.current.filter(line => {
      try {
        chart.removeSeries(line);
        return false;
      } catch (e) {
        return false;
      }
    });

    if (!showTrends) return;

    const peakLine = chart.addLineSeries({
      color: '#FF6B6B',
      lineWidth: 1,
      lineStyle: 2,
      title: 'Last Peak'
    });

    const troughLine = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 1,
      lineStyle: 2,
      title: 'Last Trough'
    });

    const uptrendArea = chart.addAreaSeries({
      topColor: 'rgba(38, 166, 154, 0.4)',
      bottomColor: 'rgba(38, 166, 154, 0.0)',
      lineColor: 'rgba(38, 166, 154, 0.6)',
      lineWidth: 1,
      title: 'Uptrend'
    });

    const downtrendArea = chart.addAreaSeries({
      topColor: 'rgba(239, 83, 80, 0.4)',
      bottomColor: 'rgba(239, 83, 80, 0.0)',
      lineColor: 'rgba(239, 83, 80, 0.6)',
      lineWidth: 1,
      title: 'Downtrend'
    });

    // Use memoized trend segments
    uptrendArea.setData(trendSegments.uptrend);
    downtrendArea.setData(trendSegments.downtrend);

    const lastPeak = data[data.length - 1].last_daily_peak;
    const lastTrough = data[data.length - 1].last_daily_trough;
    console.log(lastPeak, lastTrough);

    peakLine.setData([
      { time: formattedData[0].time, value: lastPeak },
      { time: formattedData[formattedData.length - 1].time, value: lastPeak }
    ]);

    troughLine.setData([
      { time: formattedData[0].time, value: lastTrough },
      { time: formattedData[formattedData.length - 1].time, value: lastTrough }
    ]);

    trendLinesRef.current = [peakLine, troughLine, uptrendArea, downtrendArea];
  }, [showTrends, trendSegments, data, formattedData]);

  useEffect(() => {
    const chart = initializeChart();
    if (!chart) return;
    
    chartRef.current = chart;

    // Add indicators to chart
    activeIndicators.forEach(indicator => {
      addIndicatorToChart(chart, indicator);
    });

    // Show trends if enabled
    if (showTrends) {
      addTrendLines(chart);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      chart.remove();
      window.removeEventListener('resize', handleResize);
    };
  }, [data, trades, activeIndicators, showTrends]);

  const toggleIndicator = (key: string) => {
    setExpandedIndicators(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatIndicatorData = (data: { x: Date; y: number; }[]) => {
    return data.map(point => ({
      time: Math.floor(point.x.getTime() / 1000) as UTCTimestamp,
      value: point.y
    }));
  };

  const addIndicatorToChart = useCallback((chart: IChartApi, indicator: IndicatorState) => {
    if (SEPARATE_CHART_INDICATORS.includes(indicator.key)) {
      ChartIndicator({
        chart,
        indicator,
        data,
        indicatorChart: indicatorChartsRef.current[indicator.key]
      });
    } else {
      ChartIndicator({
        chart,
        indicator,
        data
      });
    }
  }, [data]);
  
  const updateIndicatorParams = (indicatorName: string, key: string, newParams: Record<string, any>) => {
    console.log(indicatorName, key, newParams)
    setActiveIndicators(prev =>
      prev.map(ind =>
        ind.key === indicatorName ? { ...ind, params: { ...ind.params, [key]: newParams } } : ind
      )
    );
  };

  const addIndicator = (key: string) => {
    if (!activeIndicators.some(ind => ind.key === key)) {
      setActiveIndicators(prev => [...prev, { key, params: indicators[key].params }]);
    } else {
      setActiveIndicators(prev => prev.filter(ind => ind.key !== key));
      // Remove the chart reference when the indicator is removed
      if (SEPARATE_CHART_INDICATORS.includes(key)) {
        if (indicatorChartsRef.current[key]) {
          indicatorChartsRef.current[key].remove();
          delete indicatorChartsRef.current[key];
        }
      }
    }
  };

  // Add cleanup for indicator charts
  useEffect(() => {
    return () => {
      Object.values(indicatorChartsRef.current).forEach(chart => {
        chart.remove();
      });
      indicatorChartsRef.current = {};
    };
  }, []);

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
      <header className='chart-header'>{symbol}</header>
        <button
          onClick={() => setShowIndicatorSettings(!showIndicatorSettings)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Toggle indicator settings"
        >
          <Settings size={20} />
        </button>
        <button
          onClick={() => setShowTrends(!showTrends)}
          className={`p-2 rounded-full hover:bg-gray-100 ${showTrends ? 'bg-gray-200' : ''}`}
          aria-label="Toggle trends"
        >
          <TrendingUp size={20} />
        </button>
      </div>

      {showIndicatorSettings && (
        <div className="absolute top-12 left-2 z-20 w-64 bg-white rounded-lg shadow-lg border">
          <div className="p-4">
            {Object.entries(indicators).map(([indKey, indicator]) => (
              <div key={indKey} className="mb-4 border-b pb-2 last:border-b-0">
                <div className="flex items-center justify-between">
                  <button 
                    className="flex items-center text-sm font-medium"
                    onClick={() => toggleIndicator(indKey)}
                    aria-expanded={expandedIndicators[indKey]}
                  >
                    {expandedIndicators[indKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {indicator.name}
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full"
                    onClick={() => addIndicator(indKey)}
                    aria-label={`${activeIndicators.some(ind => ind.key === indKey) ? 'Remove' : 'Add'} ${indicator.name}`}
                  >
                    {activeIndicators.some(ind => ind.key === indKey) ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                </div>
                {expandedIndicators[indKey] && (
                  <div className="mt-2 pl-6">
                    <IndicatorParams 
                      indicator={indicator}
                      onIndicatorParamsChanged={(key, params) => updateIndicatorParams(indKey, key, params)}
                      initialParams={activeIndicators.find(ind => ind.key === indKey)?.params}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div ref={chartContainerRef} className="w-full h-[500px]" style={{position: 'relative'}} />
        
        {activeIndicators
          .filter(ind => SEPARATE_CHART_INDICATORS.includes(ind.key))
          .map(indicator => (
            <div
              key={indicator.key}
              id={`${indicator.key}-chart`}
              className="w-full"
              style={{
                height: INDICATOR_HEIGHTS[indicator.key],
                position: 'relative'
              }}
            />
          ))}
      </div>
    </div>
  );
}