import React, { useState } from 'react';
import './css/IndicatorParams.css';
import { Indicator } from '../types/trading';

interface IndicatorParamsProps {
  indicator: Indicator;
  onIndicatorParamsChanged: (key: string, value: number) => void;
}

export function IndicatorParams({ indicator, onIndicatorParamsChanged }: IndicatorParamsProps) {
  const params = indicator.params;
const [paramValues, setParamValues] = useState<Record<string, number>>(params);

  const handleParamChange = (key: string, value: number) => {
    setParamValues(prev => ({ ...prev, [key]: value }));
    onIndicatorParamsChanged(key, value);
  };

  return <div>
    {Object.entries(paramValues).map(([key, value]) => (
      <div key={key} className='indicator-param-field'>
        <label className='indicator-param-label'>{key}</label>
        <input className='indicator-param-input' type="number" value={paramValues[key]} onChange={(e) => handleParamChange(key, parseFloat(e.target.value))} />
      </div>
    ))}
  </div>;
}