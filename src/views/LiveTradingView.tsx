import { useTradingContext } from '../context/TradingContext';
import LiveTradingMain from '../components/liveTrade/LiveTradingMain';

export function LiveTradingView() {
  const { strategies } = useTradingContext();

  return <LiveTradingMain strategies={strategies} />;
}