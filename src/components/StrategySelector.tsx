import React, { useState, useEffect } from 'react';
import type { Strategy } from '../types/trading';

interface StrategySelectorProps {
  strategies: Strategy[];
  selectedStrategy: Strategy | null;
  onStrategySelect: (strategy: Strategy | null) => void;
  onStrategyChange: (strategy: Strategy | null) => void;
}

export function StrategySelector({ strategies, onStrategySelect, onStrategyChange, selectedStrategy }: StrategySelectorProps) {
  const [strategyParams, setStrategyParams] = useState<Record<string, any>>({});
  const [newStrategy, setNewStrategy] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  useEffect(() => {
    if (registrationStatus.type) {
      const timer = setTimeout(() => {
        setRegistrationStatus({ message: '', type: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registrationStatus]);

  const handleParamChange = (paramName: string, value: string) => {
    setStrategyParams(prev => ({
      ...prev,
      [paramName]: Number(value) || value
    }));
  };

  const handleStrategyChange = (strategy: Strategy | null) => {
    onStrategyChange(strategy);
    if (strategy?.params) {
      setStrategyParams(strategy.params);
    } else {
      setStrategyParams({});
    }
  };

  const handleStrategyRegistration = async () => {
    if (!selectedStrategy) return;
    try {
      const strategyWithParams = {
        ...selectedStrategy,
        params: strategyParams
      };
      onStrategySelect(strategyWithParams);
      setRegistrationStatus({
        message: 'Strategy registered successfully!',
        type: 'success'
      });
      
    } catch (error) {
      setRegistrationStatus({
        message: 'Failed to register strategy',
        type: 'error'
      });
    }
  };

  const handleNewStrategySubmission = async () => {
    if (!newStrategy.trim()) return;
    
    try {
      // Add your backend validation call here
      setRegistrationStatus({
        message: 'New strategy added successfully!',
        type: 'success'
      });
      setNewStrategy('');
    } catch (error) {
      setRegistrationStatus({
        message: 'Invalid strategy code',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Strategy</label>
        <select
          value={selectedStrategy?.id || ''}
          onChange={(e) => {
            const strategy = strategies.find(s => s.id === e.target.value);
            handleStrategyChange(strategy || null);
          }}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a strategy...</option>
          {strategies.map((strategy) => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.type}
            </option>
          ))}
        </select>

        {selectedStrategy && Object.entries(selectedStrategy.params || {}).map(([param, defaultValue]) => (
          <div key={param} className="mt-2 flex flex-row items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">{param}</label>
            <input
              style={{ width: '70px', paddingLeft: '10px', border: '1px solid #ccc', borderRadius: '5px', height: '20px', fontSize: '12px' }}
              type="number"
              value={strategyParams[param] || defaultValue}
              onChange={(e) => handleParamChange(param, e.target.value)}
              className="mt-1 w-full shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          onClick={handleStrategyRegistration}
          disabled={!selectedStrategy || registrationStatus.type === 'success'}
          className="mt-6 bg-green-600 text-white py-1 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          Register Strategy
        </button>
      </div>
    </div>
  );
} 