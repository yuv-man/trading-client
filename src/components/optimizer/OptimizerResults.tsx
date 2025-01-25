import React from 'react';
import { OptimizationResult } from '../../types/trading';
import { Card, Col, Row, Statistic } from 'antd';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowUpDown,
  Target,
  Activity,
} from 'lucide-react';

export function OptimizerResults({ optimizationResult }: { optimizationResult: OptimizationResult }) {
  const metrics = [
    {
      title: "Net Profit",
      value: optimizationResult.best_performance.data.metrics.Total.net_profit,
      icon: <TrendingUp size={20} className="text-green-500" />,
      prefix: "$",
      precision: 2,
      valueStyle: { color: '#3f8600' }
    },
    {
      title: "Profit Percentage",
      value: optimizationResult.best_performance.data.metrics.Total.profit_pct,
      icon: <PieChart size={20} className="text-blue-500" />,
      suffix: "%",
      precision: 2,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: "Max Drawdown",
      value: optimizationResult.best_performance.data.max_drawdown,
      icon: <TrendingDown size={20} className="text-red-500" />,
      prefix: "$",
      precision: 2,
      valueStyle: { color: '#cf1322' }
    },
    {
      title: "Total Trades",
      value: optimizationResult.best_performance.data.metrics.Total.total_trades,
      icon: <Activity size={20} className="text-purple-500" />,
      precision: 0,
      valueStyle: { color: '#722ed1' }
    },
    {
      title: "Win/Loss Ratio",
      value: optimizationResult.best_performance.data.metrics.Total.win_loss_ratio,
      icon: <ArrowUpDown size={20} className="text-indigo-500" />,
      precision: 2,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: "Win Rate",
      value: optimizationResult.best_performance.data.metrics.Total.winning_rate,
      icon: <Target size={20} className="text-orange-500" />,
      suffix: "%",
      precision: 2,
      valueStyle: { color: '#fa8c16' }
    }
  ];

  return (
    <div className="space-y-4">
      {/* Performance Metrics */}
      <Card title="Performance Metrics" bordered={false}>
        <Row gutter={[16, 16]}>
          {metrics.map((metric) => (
            <Col xs={24} sm={12} md={8} key={metric.title}>
              <Card className="h-full" bordered={false}>
                <div className="flex items-center gap-2 mb-2">
                  {metric.icon}
                  <span className="text-gray-600">{metric.title}</span>
                </div>
                <div className="text-2xl font-semibold" style={metric.valueStyle}>
                  {metric.prefix}
                  {typeof metric.value === 'number' 
                    ? metric.value.toFixed(metric.precision)
                    : metric.value}
                  {metric.suffix}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Best Parameters */}
      <Card title="Best Parameters" bordered={false}>
        <Row gutter={[16, 16]}>
          {Object.entries(optimizationResult.best_parameters).map(([key, value]) => (
            <Col xs={24} sm={12} md={8} lg={6} key={key}>
              <Card className="h-full" bordered={false}>
                <div className="text-gray-600 capitalize mb-1">
                  {key.replace(/_/g, ' ')}
                </div>
                <div className="text-lg font-semibold">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}

export default OptimizerResults;