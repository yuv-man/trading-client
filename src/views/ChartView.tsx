import { useTradingContext } from '../context/TradingContext';
import { ControlPanel } from '../components/chart/ControlPanel';
import { Chart } from '../components/chart/Chart';
import { BacktestResults } from '../components/BacktestResults';
import '../App.css';

export function ChartView() {
  const {
    symbol,
    setSymbol,
    interval,
    setInterval,
    period,
    setPeriod,
    timeframe,
    intradayData,
    dailyData,
    backtestResults,
    strategies,
    handleBacktest,
    isIntraday,
    toggleTimeframe,
    handleStrategySelect,
    tradingMode
  } = useTradingContext();

  return (
    <div className="app-main-container">
      <div className="app-main-container-left">
        <ControlPanel
          onSymbolChange={setSymbol}
          onIntervalChange={setInterval}
          onPeriodChange={setPeriod}
          onStrategySelect={handleStrategySelect}
          onBacktest={handleBacktest}
          tradingMode={tradingMode}
          symbol={symbol}
          period={period}
          interval={interval}
          strategies={strategies}
        />
      </div>
      <div className="app-main-container-right">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Chart
            symbol={symbol}
            data={timeframe === 'intraday' ? intradayData : dailyData}
            trades={backtestResults?.trades}
            timeframeChanged={toggleTimeframe}
            timeframe={timeframe}
            isIntraday={isIntraday(interval)}
          />
        </div>
        {backtestResults && <BacktestResults results={backtestResults} />}
      </div>
    </div>
  );
}