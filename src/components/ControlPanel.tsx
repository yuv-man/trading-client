import React, { useState } from 'react';
import { ChevronDown, Settings, Code } from 'lucide-react';
import type { Strategy } from '../types/trading';
import './css/ControlPanel.css';
import { StrategySelector } from './StrategySelector';

interface ControlPanelProps {
  onStrategySelect: (strategy: Strategy | null) => void;
  onBacktest: (params: {
    startDate: string;
    endDate: string;
    interval: string;
    symbol: string;
  }) => void;
  tradingMode: 'backtest' | 'live';
  symbol: string;
  period: string;
  interval: string;
  onSymbolChange: (symbol: string) => void;
  onIntervalChange: (interval: string) => void;
  onPeriodChange: (period: string) => void;
}

export function ControlPanel({
  symbol,
  period,
  interval,
  onStrategySelect,
  onBacktest,
  onSymbolChange,
  onIntervalChange,
  onPeriodChange,
}: ControlPanelProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState('');
  const [strategies] = useState([
    { id: 'sma_cross', name: 'SMA Crossover', description: 'Moving average crossover strategy' },
    { id: 'rsi_oversold', name: 'RSI Oversold', description: 'RSI oversold bounce strategy' },
    // Add more predefined strategies as needed
  ]);
  const [registrationStatus, setRegistrationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  const [localSymbol, setLocalSymbol] = useState(symbol);

  const handleBacktest = () => {
    if (!startDate || !endDate || !symbol) return;
    onBacktest({
      startDate,
      endDate,
      interval,
      symbol,
    });
  };

  const handleStrategyRegistration = async () => {
    if (!selectedStrategy) return;
    
    try {
      // Add your backend call here
      // const response = await registerStrategy(selectedStrategy);
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
      // const response = await validateAndAddStrategy(newStrategy);
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Settings size={20} />
            Trading Parameters
          </h3>
          <div className="control-panel-container">
            <div className="control-panel-field">
              <label className="block text-sm font-medium text-gray-700">Symbol</label>
              <input
                type="text"
                value={localSymbol}
                onChange={(e) => setLocalSymbol(e.target.value.toUpperCase())}
                onBlur={() => onSymbolChange(localSymbol)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="control-panel-field">
              <label className="block text-sm font-medium text-gray-700">Interval</label>
              <select
                value={interval}
                onChange={(e) => onIntervalChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="1 min">1 Minute</option>
                <option value="5 mins">5 Minutes</option>
                <option value="15 mins">15 Minutes</option>
                <option value="1 hour">1 Hour</option>
                <option value="1 day">1 Day</option>
              </select>
            </div>
            <div className="control-panel-field">
              <label className="block text-sm font-medium text-gray-700">Period</label>
              <select
                value={period}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="1 D">1 Day</option>
                <option value="5 D">5 Days</option>
                <option value="1 M">1 Month</option>
                <option value="6 M">6 Months</option>
                <option value="1 Y">1 Year</option>
              </select>
            </div>
            <div className="control-panel-field">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="control-panel-field">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3
          className="text-lg font-semibold mb-3 flex items-center gap-2 cursor-pointer"
          onClick={() => setIsStrategyOpen(!isStrategyOpen)}
          >
          <Code size={20} />
          Trading Strategy
          <ChevronDown 
            size={16} 
            className={`transform transition-transform ${isStrategyOpen ? 'rotate-180' : ''}`} 
          />
          </h3>
          {isStrategyOpen && (
          <StrategySelector 
            strategies={strategies}
            onStrategySelect={onStrategySelect}
          />
          )}
        </div>

        <button
          onClick={handleBacktest}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Run Backtest
        </button>
      </div>
    </div>
  );
}