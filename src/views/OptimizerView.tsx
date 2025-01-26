import { useTradingContext } from '../context/TradingContext';
import { OptimizerMain } from '../components/optimizer/OptimizerMain';

export function OptimizerView() {
  const { strategies } = useTradingContext();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Strategy Optimization</h2>
      <OptimizerMain strategies={strategies} />
    </div>
  );
}