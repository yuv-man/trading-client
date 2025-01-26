import { useTradingContext } from '../context/TradingContext';
import BacktestSheet from '../components/strategy/BacktestSheet';

export function BacktestView() {
  const { backtestResults, symbol, interval, period, selectedStrategy } = useTradingContext();

  return <BacktestSheet 
  results={backtestResults}
  symbol={symbol}
  interval={interval}
  period={period}
  strategy_name={selectedStrategy?.type}
  />;
}