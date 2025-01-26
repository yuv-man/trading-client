import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { TradingProvider } from './context/TradingContext';

export default function App() {
  return (
    <BrowserRouter>
      <TradingProvider>
        <div className="min-h-screen bg-gray-100 flex">
          <AppRoutes />
        </div>
      </TradingProvider>
    </BrowserRouter>
  );
}