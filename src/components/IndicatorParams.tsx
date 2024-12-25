import React, { useState } from 'react';
import { Indicator } from '../types/trading';

interface IndicatorParamsProps {
  indicator: Indicator;
}

export function IndicatorParams({ indicator }: IndicatorParamsProps) {
  const params = indicator.params;
    const [paramValues, setParamValues] = useState<Record<string, number>>(params);

  const handleParamChange = (key: string, value: number) => {
    setParamValues(prev => ({ ...prev, [key]: value }));
  };

  return <div>
    {Object.entries(params).map(([key, value]) => (
      <div key={key}>
        <label>{key}</label>
        <input type="number" value={value} onChange={(e) => handleParamChange(key, parseFloat(e.target.value))} />
      </div>
    ))}
  </div>;
}