import type { ChartData } from '../types/trading';

export function calculateMA(data: ChartData[], period: number) {
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