import axios from 'axios';
import { StrategyRegistrationPayload, BacktestPayload, StockDataPayload } from '../types/trading';

const API_BASE_URL = 'http://localhost:5001';

export const registerStrategy = async (payload: StrategyRegistrationPayload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/register_strategy`,
      payload
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


// const payload = {
//   strategy_type: "SMA",
//   symbol: "AAPL",
//   params: {
//     short_window: 20,
//     long_window: 50
//   }
// };
// await registerStrategy(payload);