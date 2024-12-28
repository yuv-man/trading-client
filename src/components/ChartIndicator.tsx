import { IChartApi, UTCTimestamp, ISeriesApi } from 'lightweight-charts';
import type { ChartData } from '../types/trading';
import { calculateSMA, calculateRSI, calculateBollingerBands, calculateMACD } from '../utils/indicators';

interface ChartIndicatorProps {
  chart: IChartApi;
  indicator: {
    key: string;
    params: Record<string, any>;
  };
  data: ChartData[];
  indicatorChart?: IChartApi;
}

const seriesRefs = {
    rsiSeries: null as ISeriesApi<"Line"> | null,
    macdLineSeries: null as ISeriesApi<"Line"> | null,
    signalLineSeries: null as ISeriesApi<"Line"> | null,
    histogramSeries: null as ISeriesApi<"Histogram"> | null,
  };

export function ChartIndicator({ chart, indicator, data, indicatorChart }: ChartIndicatorProps) {
  const formatIndicatorData = (data: { x: Date; y: number; }[]) => {
    return data.map(point => ({
      time: Math.floor(point.x.getTime() / 1000) as UTCTimestamp,
      value: point.y
    }));
  };

  try {
    const { key, params } = indicator;
    let lineSeries, middleBand, upperBand, lowerBand;
    let sma1Series, sma2Series, sma1Data, sma2Data;
    let smaData, bbData, rsiData, macdData;
    let macdLineSeries, signalLineSeries, histogramSeries;
    
    switch (key) {
      case 'SMA':
        sma1Series = chart.addLineSeries({
          color: params.color1 || '#2962FF',
          lineWidth: 2,
          title: `SMA(${params.period1 || 14})`
        });
        sma1Data = formatIndicatorData(calculateSMA(data, params.period1 || 14));
        sma1Series.setData(sma1Data);

        sma2Series = chart.addLineSeries({
          color: params.color2 || '#FF6B6B',
          lineWidth: 2,
          title: `SMA(${params.period2 || 28})`
        });
        sma2Data = formatIndicatorData(calculateSMA(data, params.period2 || 28));
        sma2Series.setData(sma2Data);
        break;

      case 'BollingerBands':
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
        bbData = calculateBollingerBands(data, params.period || 20, params.stdDev || 2);
        middleBand.setData(formatIndicatorData(bbData.middle));
        upperBand.setData(formatIndicatorData(bbData.upper));
        lowerBand.setData(formatIndicatorData(bbData.lower));
        break;

      case 'RSI':
        if (indicatorChart) {
            if(seriesRefs.rsiSeries) {
                try {
                    indicatorChart.removeSeries(seriesRefs.rsiSeries);
                } catch (error) {
                    console.log('RSI series already removed');
                }
            }
            seriesRefs.rsiSeries = indicatorChart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: `RSI(${params.period || 14})`,
            priceFormat: {
              type: 'custom',
              minMove: 0.01,
              formatter: (price: number) => price.toFixed(2),
            },
          });
          rsiData = formatIndicatorData(calculateRSI(data, params.period || 14));
          seriesRefs.rsiSeries.setData(rsiData);
          
          indicatorChart.priceScale('right').applyOptions({
            autoScale: false,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
            minValue: 0,
            maxValue: 100,
          });
        }
        break;

      case 'MACD':
        if (indicatorChart) {
          const { fastPeriod, slowPeriod, signalPeriod} = params;
          
          // Add MACD line series
          macdLineSeries = indicatorChart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: 'MACD Line',
          });

          // Add Signal line series
          signalLineSeries = indicatorChart.addLineSeries({
            color: '#FF6B6B',
            lineWidth: 2,
            title: 'Signal Line',
          });

          // Add Histogram series
          histogramSeries = indicatorChart.addHistogramSeries({
            color: '#26a69a',
            title: 'MACD Histogram',
          });

          // Calculate MACD data
          const macdData = calculateMACD(data, 
            fastPeriod || 12, 
            slowPeriod || 26, 
            signalPeriod || 9
          );

          // Format and set data for each series
          const formattedMacdData = formatIndicatorData(macdData.macd);
          const formattedSignalData = formatIndicatorData(macdData.signal);

          // Calculate histogram data safely by ensuring indexes match
          const formattedHistogramData = formattedMacdData.map((macdPoint, i) => {
            const signalPoint = formattedSignalData[i];
            if (!signalPoint) return null;
            
            return {
              time: macdPoint.time,
              value: macdPoint.value - signalPoint.value,
              color: macdPoint.value >= signalPoint.value ? '#26a69a' : '#ef5350'
            };
          }).filter(Boolean); // Remove any null values

          macdLineSeries.setData(formattedMacdData);
          signalLineSeries.setData(formattedSignalData);
          histogramSeries.setData(formattedHistogramData);

          // Set scale for better visualization
          indicatorChart.priceScale('right').applyOptions({
            autoScale: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          });
        }
        break;
    }
  } catch (error) {
    console.error(`Error adding indicator ${indicator.key}:`, error);
  }
} 