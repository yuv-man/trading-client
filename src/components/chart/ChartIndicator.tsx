import { IChartApi, UTCTimestamp, ISeriesApi } from 'lightweight-charts';
import type { ChartData } from '../../types/trading';
import { 
  calculateSMA, 
  calculateRSI, 
  calculateBollingerBands, 
  calculateMACD,
  calculateEMA,
  calculateStochastic,
  calculateADX
} from '../../utils/indicators';

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
  stochasticSeries: null as ISeriesApi<"Line"> | null,
  adxSeries: null as ISeriesApi<"Line"> | null,
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
    let sma1Series, sma2Series, sma1Data, sma2Data;
    let ema1Series, ema2Series, ema1Data, ema2Data;
    let middleBand, upperBand, lowerBand, bbData;

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
              console.error('RSI series removal error:', error);
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
          
          const rsiData = formatIndicatorData(calculateRSI(data, params.period || 14));
          seriesRefs.rsiSeries.setData(rsiData);
          
          indicatorChart.priceScale('right').applyOptions({
            autoScale: true,
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
          const { fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = params;
          
          // Remove existing series if they exist
          if (seriesRefs.macdLineSeries) {
            try {
              indicatorChart.removeSeries(seriesRefs.macdLineSeries);
              indicatorChart.removeSeries(seriesRefs.signalLineSeries!);
              indicatorChart.removeSeries(seriesRefs.histogramSeries!);
            } catch (error) {
              console.error('MACD series removal error:', error);
            }
          }
          
          // Add MACD line series
          seriesRefs.macdLineSeries = indicatorChart.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            title: 'MACD Line',
          });

          // Add Signal line series
          seriesRefs.signalLineSeries = indicatorChart.addLineSeries({
            color: '#FF6B6B',
            lineWidth: 2,
            title: 'Signal Line',
          });

          // Add Histogram series
          seriesRefs.histogramSeries = indicatorChart.addHistogramSeries({
            color: '#26a69a',
            title: 'MACD Histogram',
            priceScaleId: 'right'
          });

          // Calculate MACD data
          const macdData = calculateMACD(data, fastPeriod, slowPeriod, signalPeriod);

          // Format and set data for each series
          const formattedMacdData = formatIndicatorData(macdData.macd);
          const formattedSignalData = formatIndicatorData(macdData.signal);

          // Calculate histogram data
          const formattedHistogramData = formattedMacdData.map((macdPoint, i) => {
            const signalPoint = formattedSignalData[i];
            if (!signalPoint) return null;
            
            return {
              time: macdPoint.time,
              value: macdPoint.value - signalPoint.value,
              color: macdPoint.value >= signalPoint.value ? '#26a69a' : '#ef5350'
            };
          }).filter(Boolean);

          seriesRefs.macdLineSeries.setData(formattedMacdData);
          seriesRefs.signalLineSeries.setData(formattedSignalData);
          seriesRefs.histogramSeries.setData(formattedHistogramData);

          indicatorChart.priceScale('right').applyOptions({
            autoScale: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          });
        }
        break;

      case 'EMA':
        
        ema1Series = chart.addLineSeries({
          color: params.color1 || '#2962FF',
          lineWidth: 2,
          title: `EMA(${params.period1 || 14})`
        });
        ema1Data = formatIndicatorData(calculateEMA(data, params.period1 || 14));
        ema1Series.setData(ema1Data);

        ema2Series = chart.addLineSeries({
          color: params.color2 || '#FF6B6B',
          lineWidth: 2,
          title: `EMA(${params.period2 || 28})`
        });
        ema2Data = formatIndicatorData(calculateEMA(data, params.period2 || 28));
        ema2Series.setData(ema2Data);
        break;

      case 'Stochastic':
        if (indicatorChart) {
          if(seriesRefs.stochasticSeries) {
            try {
              indicatorChart.removeSeries(seriesRefs.stochasticSeries);
            } catch (error) {
              console.error('Stochastic series removal error:', error);
            }
          }
          
          seriesRefs.stochasticSeries = indicatorChart.addLineSeries({
            color: params.color || '#8E24AA',
            lineWidth: 2,
            title: `Stochastic(${params.kPeriod || 14}, ${params.dPeriod || 3})`,
            priceFormat: {
              type: 'custom',
              minMove: 0.01,
              formatter: (price: number) => price.toFixed(2),
            },
          });
          
          const stochasticData = formatIndicatorData(calculateStochastic(
            data, 
            params.kPeriod || 14,
            params.dPeriod || 3,
            params.smoothK || 3
          ).k);
          
          seriesRefs.stochasticSeries.setData(stochasticData);
          
          indicatorChart.priceScale('right').applyOptions({
            autoScale: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          });
        }
        break;

      case 'ADX':
        if (indicatorChart) {
          if(seriesRefs.adxSeries) {
            try {
              indicatorChart.removeSeries(seriesRefs.adxSeries);
            } catch (error) {
              console.error('ADX series removal error:', error);
            }
          }
          
          seriesRefs.adxSeries = indicatorChart.addLineSeries({
            color: params.color || '#FF5722',
            lineWidth: 2,
            title: `ADX(${params.period || 14})`,
            priceFormat: {
              type: 'custom',
              minMove: 0.01,
              formatter: (price: number) => price.toFixed(2),
            },
          });
          
          const adxData = formatIndicatorData(calculateADX(data, params.period || 14));
          seriesRefs.adxSeries.setData(adxData);
          
          indicatorChart.priceScale('right').applyOptions({
            autoScale: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.1,
            },
          });
        }
        break;

      default:
        console.warn(`Unsupported indicator key: ${key}`);
        break;
    }
  } catch (error) {
    console.error(`Error adding indicator ${indicator.key}:`, error);
  }
}