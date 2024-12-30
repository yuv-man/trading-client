import axios from 'axios';
import { StrategyRegistrationPayload, BacktestPayload, StockDataPayload } from '../types/trading';

const API_BASE_URL = 'http://localhost:5001';

export const registerStrategy = async (payload: StrategyRegistrationPayload, symbol: string) => {
    const payloadWithSymbol: any = {
        ...payload,
        symbol: symbol
    }
    payloadWithSymbol['strategy_type'] = payload.type;
    delete payloadWithSymbol.type;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/register_strategy`,
      payloadWithSymbol
    );
    return response.data;
  } catch (error) {
    console.error('Error registering strategy:', error);
    throw error;
  }
};

export const runBacktest = async (payload: BacktestPayload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/backtest`, payload);
      return response.data;
    } catch (error) {
      console.error('Error running backtest:', error);
      throw error;
    }
  };

export const getStockData = async (payload: StockDataPayload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/get_stock_data`, payload);
      return response.data;
    } catch (error) {
      console.error('Error running backtest:', error);
      throw error;
    }
  };

export const getStrategies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_strategies`);
      return response.data.strategies;
    } catch (error) {
      console.error('Error getting strategies:', error);
      throw error;
    }
  };


// const payload = {
//   strategy_type: "SMA",
//   symbol: "AAPL",
//   params: {
//     short_window: 20,
//     long_window: 50
//   }
// };
// await registerStrategy(payload);