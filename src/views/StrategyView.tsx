import { useTradingContext } from '../context/TradingContext';
import BacktestSheet from '../components/strategy/BacktestSheet';

export function StrategyView() {
  const {
    backtestResults,
    symbol,
    period,
    interval,
    selectedStrategy
  } = useTradingContext();

  return (
    <BacktestSheet
      results={backtestResults}
      symbol={symbol}
      period={period}
      interval={interval}
      strategy_name={selectedStrategy?.type}
    />
  );
}