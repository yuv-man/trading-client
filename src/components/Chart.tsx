import React, { useState, useRef, useEffect } from 'react';
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts';
import { TechnicalIndicators } from './chart/TechnicalIndicators';
import type { ChartData, Indicator } from '../types/trading';
import { Settings, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { indicators, calculateSMA, calculateRSI, calculateBollingerBands } from '../utils/indicators';
import { IndicatorParams } from './IndicatorParams';


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
  const chartRef = useRef<IChartApi | null>(null);
  const [showIndicatorSettings, setShowIndicatorSettings] = useState(false);
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>({});
  const [activeIndicators, setActiveIndicators] = useState<IndicatorState[]>([]);

  const formatIntradayData = (rawData: ChartData[]) => {
    return Object.values(rawData)
      .map(d => {
        // Parse the date string to a Date object
        const date = new Date(d.time);
        
        // Format the time as UTC timestamp with milliseconds
        // lightweight-charts expects timestamps in seconds
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
  };

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

    const formattedData = formatIntradayData(data);
    
    // Set candlestick data
    candlestickSeries.setData(formattedData);

    // Set volume data
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

  useEffect(() => {
    const chart = initializeChart();
    if (!chart) return;
    
    chartRef.current = chart;

    // Add indicators to chart
    activeIndicators.forEach(indicator => {
      addIndicatorToChart(chart, indicator);
    });

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
  }, [data, trades, activeIndicators]);

  const toggleIndicator = (key: string) => {
    setExpandedIndicators(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addIndicatorToChart = (chart: IChartApi, indicator: IndicatorState) => {
    try {
      const { key, params } = indicator;
      console.log('Adding indicator:', key, params);
      const indicatorConfig = indicators[key];
      let lineSeries, middleBand, upperBand, lowerBand, rsiSeries;
      let smaData, bbData, rsiData;
      
      const formattedData = formatIntradayData(data);

      switch (key) {
        case 'sma':
          lineSeries = chart.addLineSeries({
            color: params.color || '#2962FF',
            lineWidth: 2,
            title: `SMA(${params.period || 14})`
          });
          smaData = calculateSMA(formattedData, params.period || 14);
          lineSeries.setData(smaData);
          break;
        case 'bollinger':
          middleBand = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: 'BB Middle'
          });
          upperBand = chart.addLineSeries({
            color: 'rgba(41, 98, 255, 0.3)',
            lineWidth: 1,
            title: 'BB Upper'
          });
          lowerBand = chart.addLineSeries({
            color: 'rgba(41, 98, 255, 0.3)',
            lineWidth: 1,
            title: 'BB Lower'
          });
          bbData = calculateBollingerBands(formattedData, params.period || 20, params.stdDev || 2);
          middleBand.setData(bbData.middle);
          upperBand.setData(bbData.upper);
          lowerBand.setData(bbData.lower);
          break;
        case 'rsi':
          rsiSeries = chart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: `RSI(${params.period || 14})`,
            priceScaleId: 'right',
            pane: 1
          });
          rsiData = calculateRSI(formattedData, params.period || 14);
          rsiSeries.setData(rsiData);
          break;
      }
    } catch (error) {
      console.error(`Error adding indicator ${indicator.key}:`, error);
    }
  };
  
  const updateIndicatorParams = (key: string, newParams: Record<string, any>) => {
    setActiveIndicators(prev =>
      prev.map(ind =>
        ind.key === key ? { ...ind, params: { ...ind.params, ...newParams } } : ind
      )
    );
  };

  const addIndicator = (key: string) => {
    if (!activeIndicators.some(ind => ind.key === key)) {
      setActiveIndicators(prev => [...prev, { key, params: {} }]);
    } else {
      setActiveIndicators(prev => prev.filter(ind => ind.key !== key));
    }
  };

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => setShowIndicatorSettings(!showIndicatorSettings)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Toggle indicator settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {showIndicatorSettings && (
        <div className="absolute top-12 left-2 z-20 w-64 bg-white rounded-lg shadow-lg border">
          <div className="p-4">
            {Object.entries(indicators).map(([key, indicator]) => (
              <div key={key} className="mb-4 border-b pb-2 last:border-b-0">
                <div className="flex items-center justify-between">
                  <button 
                    className="flex items-center text-sm font-medium"
                    onClick={() => toggleIndicator(key)}
                    aria-expanded={expandedIndicators[key]}
                  >
                    {expandedIndicators[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {indicator.name}
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full"
                    onClick={() => addIndicator(key)}
                    aria-label={`${activeIndicators.some(ind => ind.key === key) ? 'Remove' : 'Add'} ${indicator.name}`}
                  >
                    {activeIndicators.some(ind => ind.key === key) ? <Minus size={16} /> : <Plus size={16} />}
                  </button>
                </div>
                {expandedIndicators[key] && (
                  <div className="mt-2 pl-6">
                    <IndicatorParams 
                      indicator={indicator}
                      onChange={(params) => updateIndicatorParams(key, params)}
                      initialParams={activeIndicators.find(ind => ind.key === key)?.params}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className="w-full h-[600px]" style={{position: 'relative'}} />
      
      {activeIndicators.length > 0 && (
        <TechnicalIndicators 
          chart={chartRef.current}
          data={data} 
          indicators={activeIndicators}
          onError={(key) => {
            setActiveIndicators(prev => prev.filter(ind => ind.key !== key));
          }}
        />
      )}
    </div>
  );
}