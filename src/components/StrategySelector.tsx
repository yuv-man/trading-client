import React, { useState } from 'react';
import type { Strategy } from '../types/trading';

interface StrategySelectorProps {
  strategies: Strategy[];
  onStrategySelect: (strategy: Strategy | null) => void;
}

export function StrategySelector({ strategies, onStrategySelect }: StrategySelectorProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [newStrategy, setNewStrategy] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  const handleStrategyRegistration = async () => {
    if (!selectedStrategy) return;
    
    try {
      // Add your backend call here
      setRegistrationStatus({
        message: 'Strategy registered successfully!',
        type: 'success'
      });
      onStrategySelect(selectedStrategy);
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
            setSelectedStrategy(strategy || null);
          }}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a strategy...</option>
          {strategies.map((strategy) => (
            <option key={strategy.id} value={strategy.id}>
              {strategy.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleStrategyRegistration}
          disabled={!selectedStrategy}
          className="mt-2 bg-green-600 text-white py-1 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          Register Strategy
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Strategy</label>
        <textarea
          value={newStrategy}
          onChange={(e) => setNewStrategy(e.target.value)}
          className="w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter your strategy code here..."
        />
        <button
          onClick={handleNewStrategySubmission}
          disabled={!newStrategy.trim()}
          className="mt-2 bg-blue-600 text-white py-1 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          Add Strategy
        </button>
      </div>
      {registrationStatus.message && (
        <div className={`p-3 rounded-md ${registrationStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {registrationStatus.message}
        </div>
      )}
    </div>
  );
} 