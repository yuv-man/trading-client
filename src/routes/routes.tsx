import { RouteObject, Navigate } from 'react-router-dom';
import { ChartView } from '../views/ChartView';
import { StrategyView } from '../views/StrategyView';
import { OptimizerView } from '../views/OptimizerView';
import { LiveTradingView } from '../views/LiveTradingView';
import { BacktestView } from '../views/BacktestView';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/chart" replace />
  },
  {
    path: '/chart',
    element: <ChartView />
  },
  {
    path: '/backtest',
    element: <BacktestView />
  },
  {
    path: '/strategy',
    element: <StrategyView />
  },
  {
    path: '/optimize',
    element: <OptimizerView />
  },
  {
    path: '/live',
    element: <LiveTradingView />
  }
];