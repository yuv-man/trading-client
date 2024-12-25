import type { ChartData } from '../types/trading';

export function calculateSMA(data: ChartData[], period: number) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const average = slice.reduce((sum, d) => sum + d.close, 0) / period;
    result.push({
      x: new Date(data[i].time),
      y: average,
    });
  }
  return result;
}

export function calculateRSI(data: ChartData[], period: number = 14) {
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close);
  }

  const result = [];
  for (let i = period; i < changes.length; i++) {
    const gains = changes.slice(i - period, i).filter(c => c > 0);
    const losses = changes.slice(i - period, i).filter(c => c < 0);
    
    const avgGain = gains.reduce((sum, g) => sum + g, 0) / period;
    const avgLoss = Math.abs(losses.reduce((sum, l) => sum + l, 0)) / period;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({
      x: new Date(data[i].time),
      y: rsi,
    });
  }
  
  return result;
}

export function calculateBollingerBands(data: ChartData[], period: number = 20, standardDeviations: number = 2) {
  const ma = calculateMA(data, period);
  const upperBand = [];
  const lowerBand = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = ma[i - (period - 1)].y;
    
    const squaredDiffs = slice.map(d => Math.pow(d.close - avg, 2));
    const standardDeviation = Math.sqrt(squaredDiffs.reduce((sum, sq) => sum + sq, 0) / period);
    
    upperBand.push({
      x: new Date(data[i].time),
      y: avg + (standardDeviation * standardDeviations),
    });
    
    lowerBand.push({
      x: new Date(data[i].time),
      y: avg - (standardDeviation * standardDeviations),
    });
  }
  
  return [upperBand, lowerBand];
}

export function calculateMACD(data: ChartData[], fastPeriod: number, slowPeriod: number, signalPeriod: number) {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  const macd = fastEMA.map((d, i) => d.y - slowEMA[i].y);
  const signalData = macd.map((m, i) => ({
    time: data[i + fastPeriod].time,
    open: m,
    high: m,
    low: m,
    close: m
  }));
  const signal = calculateEMA(signalData, signalPeriod);
  return { macd, signal };
}

export function calculateStochastic(data: ChartData[], period: number, fastKPeriod: number, slowKPeriod: number) {
  const result = [];
  
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const highest = Math.max(...slice.map(d => d.high));
    const lowest = Math.min(...slice.map(d => d.low));
    const current = slice[slice.length - 1].close;
    
    // Calculate %K
    const k = ((current - lowest) / (highest - lowest)) * 100;
    result.push({
      x: new Date(data[i].time),
      y: k
    });
  }

  // In calculateStochastic function, before EMA calculations:
  const kData = result.map(point => ({
    time: point.x.toISOString(),
    open: point.y,
    high: point.y,
    low: point.y,
    close: point.y
  }));

  // Apply smoothing using EMA
  const smoothedK = calculateEMA(kData, fastKPeriod);
  const smoothedD = calculateEMA(kData, slowKPeriod);
  
  return {
    k: smoothedK,
    d: smoothedD
  };
}

export function calculateADX(data: ChartData[], period: number) {
  const diPlus = calculateDI(data, period, 'plus');
  const diMinus = calculateDI(data, period, 'minus');
  const adx = diPlus.map((d, i) => ({ x: d.x, y: Math.abs(d.y - diMinus[i].y) / (d.y + diMinus[i].y) * 100 }));
  return adx;
}

export function calculateEMA(data: ChartData[], period: number) {
  const result = [];
  const multiplier = 2 / (period + 1);
  
  // Initialize EMA with SMA for first period
  let ema = data.slice(0, period).reduce((sum, d) => sum + d.close, 0) / period;
  result.push({ x: new Date(data[period - 1].time), y: ema });
  
  // Calculate EMA for remaining periods
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema;
    result.push({
      x: new Date(data[i].time),
      y: ema
    });
  }
  
  return result;
}

export function calculateDI(data: ChartData[], period: number, direction: 'plus' | 'minus') {
  const result = [];
  
  // Calculate DM and TR for each period
  const dmValues = [];
  const trValues = [];
  
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevHigh = data[i - 1].high;
    const prevLow = data[i - 1].low;
    
    // Calculate True Range
    const tr = Math.max(
      high - low,
      Math.abs(high - data[i - 1].close),
      Math.abs(low - data[i - 1].close)
    );
    trValues.push(tr);
    
    // Calculate Directional Movement
    const upMove = high - prevHigh;
    const downMove = prevLow - low;
    
    if (direction === 'plus') {
      dmValues.push(upMove > downMove && upMove > 0 ? upMove : 0);
    } else {
      dmValues.push(downMove > upMove && downMove > 0 ? downMove : 0);
    }
  }
  
  // Calculate smoothed DM and TR
  let smoothedDM = dmValues.slice(0, period).reduce((sum, val) => sum + val, 0);
  let smoothedTR = trValues.slice(0, period).reduce((sum, val) => sum + val, 0);
  
  // Calculate DI values
  for (let i = period; i < data.length; i++) {
    smoothedDM = smoothedDM - (smoothedDM / period) + dmValues[i - 1];
    smoothedTR = smoothedTR - (smoothedTR / period) + trValues[i - 1];
    
    const di = (smoothedDM / smoothedTR) * 100;
    
    result.push({
      x: new Date(data[i].time),
      y: di
    });
  }
  
  return result;
}

export const indicators = {
  SMA: {
    name: 'SMA',
    enabled: false,
    fn: calculateSMA,
    params: {
      period: 20
    }
  },
  RSI: {
    name: 'RSI',
    enabled: false,
    fn: calculateRSI,
    params: {
      period: 14
    }
  },
  BollingerBands: {
    name: 'Bollinger Bands',
    enabled: false,
    fn: calculateBollingerBands,
    params: {
      period: 20,
      standardDeviations: 2
    }
  },
  MACD: {
    name: 'MACD',
    enabled: false,
    fn: calculateMACD,
    params: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9
    }
  },
  Stochastic: {
    name: 'Stochastic',
    enabled: false,
    fn: calculateStochastic,
    params: {
      period: 14,
      fastKPeriod: 3,
      slowKPeriod: 3
    }
  },
  ADX: {
    name: 'ADX',
    enabled: false,
    fn: calculateADX,
    params: {
      period: 14
    }
  },
  EMA: {
    name: 'EMA',
    enabled: false,
    fn: calculateEMA,
    params: {
      period: 20
    }
  }
} as const;

