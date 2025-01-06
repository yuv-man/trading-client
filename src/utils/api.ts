import axios from 'axios';
import { StrategyRegistrationPayload, BacktestPayload, StockDataPayload, Parameter } from '../types/trading';

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

export const optimizeFromServer = async (strategy_type: string, parameters: Parameter[], optimize_target: string,
        symbol: string, interval: string, period?: string, startTime?: string, endTime?: string) => {
    // Transform parameters into required format
    const param_ranges: { [key: string]: { range: number[] } } = {};
    const initial_guess: number[] = [];
    
    parameters.forEach((param: Parameter) => {
        param_ranges[param.name] = {
            range: [param.min, param.max, param.step],
        };
        initial_guess.push(param.initialGuess);
    });

    const payload = {
        strategy_type,
        param_ranges,
        initial_guess,
        symbol,
        interval,
        period,
        startTime,
        endTime,
        optimize_target
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/optimize_strategy`, payload);
        return response.data;
    } catch (error) {
        console.error('Error optimizing strategy:', error);
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