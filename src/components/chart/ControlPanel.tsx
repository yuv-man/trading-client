import React, { useState, useEffect } from 'react';
import { Settings, Code } from 'lucide-react';
import type { Strategy } from '../../types/trading';
import '../css/ControlPanel.css';
import { StrategySelector } from '../strategy/StrategySelector';
import { tradingService } from '../../utils/api';

interface ControlPanelProps {
  strategies: Strategy[];
  onStrategySelect: (strategy: Strategy | null) => void;
  onBacktest: (params: {
    startDate?: string;
    endDate?: string;
    period?: string;
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
  strategies,
}: ControlPanelProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  const [newStrategy, setNewStrategy] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  const [localSymbol, setLocalSymbol] = useState(symbol);
  const [activeView, setActiveView] = useState<'parameters' | 'strategy'>('parameters');

  useEffect(() => {
    if (registrationStatus.type) {
      const timer = setTimeout(() => {
        setRegistrationStatus({ message: '', type: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registrationStatus]);

  const handleBacktest = () => {
    console.log(startDate, endDate, period, interval, symbol);
    if (((!startDate || !endDate) && !period) || !symbol) {
      setRegistrationStatus({
        message: 'Missing parameters',
        type: 'error'
      })
      return;
    }
    if (!selectedStrategy) {
      setRegistrationStatus({
        message: 'Missing strategy',
        type: 'error'
      })
      return;
    }
    onBacktest({
      startDate,
      endDate,
      period,
      interval,
      symbol,
    });
  };

  const handleStrategyRegistration = async (strategy: Strategy | null) => {
    if (!strategy) {
      setRegistrationStatus({
        message: 'Missing strategy',
        type: 'error'
      });
      return;
    }
    
    try {
      await tradingService.registerStrategy(strategy, symbol);
      onStrategySelect(strategy);
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

  const onStrategyChange = (strategy: Strategy | null) => {
    setSelectedStrategy(strategy);
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div >
        <div className="flex bg-gray-100 p-1 rounded-t-lg">
          <button
            onClick={() => setActiveView('parameters')}
            className={`relative flex items-center gap-2 px-6 py-2 min-w-[120px] rounded-t-lg text-sm transition-colors ${
              activeView === 'parameters'
                ? 'bg-white text-gray-800'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Settings size={16} />
            Parameters
          </button>
          <button
            onClick={() => {
              setActiveView('strategy');
            }}
            className={`relative flex items-center gap-2 px-6 py-2 min-w-[120px] rounded-t-lg text-sm transition-colors ${
              activeView === 'strategy'
                ? 'bg-white text-gray-800'
                : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Code size={16} />
            Strategy
          </button>
        </div>
        <div className="bg-white p-6">
          {activeView === 'parameters' && (
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
                  <option value="">None</option>
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
          )}

          {activeView === 'strategy' && (
            <StrategySelector 
              strategies={strategies}
              onStrategySelect={handleStrategyRegistration}
              selectedStrategy={selectedStrategy}
              onStrategyChange={onStrategyChange}
            />
          )}

          <button
            onClick={handleBacktest}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Run Backtest
          </button>
        </div>
      </div>
      {registrationStatus.type && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg ${
          registrationStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p className="text-sm font-medium">{registrationStatus.message}</p>
        </div>
      )}
    </div>
  );
}