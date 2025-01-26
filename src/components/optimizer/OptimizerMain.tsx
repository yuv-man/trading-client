import React, { useState, useRef, useEffect } from 'react';
import {
  Select,
  Input,
  Button,
  Space,
  Card,
  Spin,
  Form,
} from 'antd';
import '../css/Optimizer.css';
import { createChart, IChartApi } from 'lightweight-charts';
import { Strategy, Parameter, OptimizationResult } from '../../types/trading';
import { tradingService } from '../../utils/api';
import { OptimizerResults } from './OptimizerResults';
import StepInput from '../common/StepInput';

export function OptimizerMain({ strategies }: { strategies: Strategy[] }) {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | undefined>(undefined);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);
  const [interval, setInterval] = useState<string | undefined>(undefined);
  const [period, setPeriod] = useState<string | undefined>(undefined);
  const [startTime, setStartTime] = useState<string | undefined>(undefined);
  const [endTime, setEndTime] = useState<string | undefined>(undefined);
  const [optimizeTarget, setOptimizeTarget] = useState<string | undefined>(undefined);
  const [useDateRange, setUseDateRange] = useState(false);
//   useEffect(() => {
//     if (chartContainerRef.current && optimizationResult) {
//       // Clean up previous chart if it exists
//       if (chartRef.current) {
//         chartRef.current.remove();
//       }

//       // Create new chart
//       const chart = createChart(chartContainerRef.current, {
//         height: 300,
//         timeScale: {
//           timeVisible: false,
//         },
//       });
//       chartRef.current = chart;

//       // Add line series
//       const lineSeries = chart.addLineSeries();
//       const chartData = optimizationResult.history.map(point => ({
//         time: point.iteration,
//         value: point.performance,
//       }));
//       lineSeries.setData(chartData);

//       // Fit content
//       chart.timeScale().fitContent();
//     }

//     // Cleanup on unmount
//     return () => {
//       if (chartRef.current) {
//         chartRef.current.remove();
//       }
//     };
//   }, [optimizationResult]);

  const handleStrategyChange = (strategyType: string) => {
    const strategy = strategies.find(strategy => strategy.type === strategyType);
    setSelectedStrategy(strategy);
    if (strategy?.params) {
      setParameters(Object.entries(strategy.params).map(([name, value]) => ({
        name,
        min: 1,
        max: value * 2,
        step: 1,
        initialGuess: value
      })));
    }
  };

  const optimizeStrategy = async (strategy: Strategy, parameters: Parameter[], optimizeTarget: string, symbol: string, interval: string, period?: string, startTime?: string, endTime?: string) => {
    if(!strategy || !parameters || !symbol || !interval) {
      console.log("Invalid input");
      return;
    }
    const strategy_type = strategy?.type;
    return await tradingService.optimizeStrategy(strategy_type, parameters, optimizeTarget, symbol, interval, period, startTime, endTime);
  };

  const handleOptimize = async () => {
    setLoading(true);
    try {
      if (!selectedStrategy || !parameters || !symbol || !interval || !optimizeTarget) {
        console.error('Missing required fields');
        return;
      }
      const optimizationResult = await optimizeStrategy(selectedStrategy, parameters, optimizeTarget, symbol, interval, period, startTime, endTime);
      if(optimizationResult && optimizationResult.status === "success") {
        setOptimizationResult(optimizationResult.results);
      } else {
        console.error('Optimization failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card title="Strategy Optimizer">
        <div className="flex gap-6">
          <div className="w-1/3">
            <Form layout="vertical">
              <Space direction="vertical" className="w-full">
                <Form.Item label="Select Strategy" className="strategy-selector-container">
                  <Select
                    placeholder="Choose a strategy"
                    options={strategies.map(strategy => ({ value: strategy.type, label: strategy.type }))}
                    onChange={handleStrategyChange}
                    className="strategy-selector"
                  />
                </Form.Item>

                <Form.Item label="Optimize Target" className="strategy-selector-container">
                  <Select
                    placeholder="Select optimize target"
                    onChange={(value) => setOptimizeTarget(value)}
                    options={[
                      { value: "NET_PROFIT", label: "Net Profit" },
                      { value: "MAX_DRAWDOWN", label: "Max Drawdown" },
                      { value: "WIN_RATE", label: "Win Rate" },
                      { value: "PROFIT_FACTOR", label: "Profit Factor" },
                      { value: "RETURN_OVER_MAX_DRAWDOWN", label: "Return/Drawdown" },
                      { value: "SHARPE_RATIO", label: "Sharpe Ratio" },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Symbol" className="strategy-selector-container">
                  <Input placeholder="Enter trading symbol (e.g., BTC/USDT)" onChange={(e) => setSymbol(e.target.value.toUpperCase())} />
                </Form.Item>

                <Form.Item label="Time Interval" className="strategy-selector-container">
                  <Select
                    placeholder="Select time interval"
                    onChange={(value) => setInterval(value)}
                    options={[
                      { value: '1 min', label: '1 minute' },
                      { value: '5 mins', label: '5 minutes' },
                      { value: '15 mins', label: '15 minutes' },
                      { value: '1 hour', label: '1 hour' },
                      { value: '4 hours', label: '4 hours' },
                      { value: '1 day', label: '1 day' },
                    ]}
                  />
                </Form.Item>

                {!useDateRange ? (
                  <Form.Item label="Period" className="strategy-selector-container">
                    <Select
                      placeholder="Select period"
                      onChange={(value) => setPeriod(value)}
                      value={period}
                      options={[
                        { value: "1 D", label: "1 day" },
                        { value: "5 D", label: "5 days" },
                        { value: "1 M", label: "1 month" },
                        { value: "3 M", label: "3 months" },
                        { value: "6 M", label: "6 months" },
                        { value: "1 Y", label: "1 year" },
                      ]}
                    />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item label="Start Time" className="strategy-selector-container">
                      <Input 
                        type="datetime-local" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </Form.Item>

                    <Form.Item label="End Time" className="strategy-selector-container">
                      <Input 
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </Form.Item>
                  </>
                )}

                <div className="inline-flex rounded-md shadow-sm last-item" role="group">
                  <button
                    type="button"
                    onClick={() => setUseDateRange(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    useDateRange
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Custom Date
                </button>
                <button
                  type="button"
                  onClick={() => setUseDateRange(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                    !useDateRange
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Period
                </button>
              </div>

                <Button type="primary" onClick={handleOptimize} block>
                  Optimize
                </Button>
              </Space>
            </Form>
          </div>

          <div className="w-2/3">
            <div className="parameter-container">
              {parameters.map((param, index) => (
                <Card 
                  key={index} 
                  size="small" 
                  title={param.name} 
                  className="parameter-card mb-2"
                  style={{ backgroundColor: '#fafafa', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  <Space direction="vertical" className="parameter-input-container" size="small">
                    <Form.Item label="Range" className="mb-1">
                      <Space size="small">
                        <StepInput
                          value={param.min}
                          onChange={(value: number) => {
                            const newParams = [...parameters];
                            newParams[index].min = value;
                            setParameters(newParams);
                          }}
                        />
                        <StepInput
                            value={param.max}
                            onChange={(value: number) => {
                              const newParams = [...parameters];
                              newParams[index].max = value;
                              setParameters(newParams);
                            }}
                          />
                      </Space>
                    </Form.Item>
                    <Form.Item label="Step" className="mb-1">
                      <StepInput
                        value={param.step}
                        onChange={(value: number) => {
                          const newParams = [...parameters];
                          newParams[index].step = value;
                          setParameters(newParams);
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="Initial Guess" className="mb-1">
                    <StepInput
                            value={param.initialGuess}
                            onChange={(value: number) => {
                              const newParams = [...parameters];
                              newParams[index].initialGuess = value;
                              setParameters(newParams);
                            }}
                          />
                    </Form.Item>
                  </Space>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center mt-8">
            <Spin size="large" />
          </div>
        )}

        {optimizationResult && (
          <Card title="Optimization Results" className="mt-8">
            <div>
              <OptimizerResults optimizationResult={optimizationResult} />
            </div>
            
            <div className="mt-4">
              <div ref={chartContainerRef} />
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default OptimizerMain;
