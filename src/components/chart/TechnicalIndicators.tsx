import React from 'react';
import { VictoryLine, VictoryChart } from 'victory';
import type { ChartData } from '../../types/trading';
import { calculateMA, calculateRSI, calculateBollingerBands } from '../../utils/indicators';

interface TechnicalIndicatorsProps {
  data: ChartData[];
  activeIndicators: string[];
}

export function TechnicalIndicators({ data, activeIndicators }: TechnicalIndicatorsProps) {
  if (!data?.length || !activeIndicators?.length) return null;

  return (
    <>
      {activeIndicators.includes('ma') && data.length >= 20 && (
        <VictoryLine
          data={calculateMA(data, 20)}
          style={{
            data: { stroke: '#2196F3', strokeWidth: 1 },
          }}
        />
      )}
      
      {activeIndicators.includes('bollinger') && data.length >= 20 && (
        <>
          {calculateBollingerBands(data, 20, 2).map((line, index) => (
            <VictoryLine
              key={index}
              data={line}
              style={{
                data: { stroke: '#9C27B0', strokeWidth: 1, opacity: 0.5 },
              }}
            />
          ))}
        </>
      )}
    </>
  );
}