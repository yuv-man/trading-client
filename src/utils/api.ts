import axios from 'axios';
import { StrategyRegistrationPayload, BacktestPayload, StockDataPayload, Parameter, StartTradingPayload } from '../types/trading';

import io from 'socket.io-client';

const API_URL = 'http://localhost:5001/api';
const SOCKET_SERVER_URL = 'http://localhost:5001';

class TradingService {
    private socket: any | null;
    private api: any;
    private subscribers: Record<string, Set<any>>;

    constructor() {
        this.socket = null;
        this.api = axios.create({ baseURL: API_URL });
        this.subscribers = {
            tradingUpdate: new Set(),
            connectionStatus: new Set(),
            orderUpdate: new Set()
        };

        // Add token to requests
        // this.api.interceptors.request.use(config => {
        //     const token = localStorage.getItem('token');
        //     if (token) {
        //         config.headers.Authorization = `Bearer ${token}`;
        //     }
        //     return config;
        // });
    }

    // Socket Connection Management
    initializeSocket() {
        if (this.socket) {
            return;
        }

        this.socket = io(SOCKET_SERVER_URL);

        this.socket.on('connect', () => {
            this.notifySubscribers('connectionStatus', 'Connected');
            console.log('Connected to socket');
        });

        this.socket.on('disconnect', () => {
            this.notifySubscribers('connectionStatus', 'Disconnected');
            console.log('Disconnected from socket');
        });

        this.socket.on('trading_update', (data) => {
            this.notifySubscribers('tradingUpdate', data);
        });

        this.socket.on('order_update', (data) => {
            this.notifySubscribers('orderUpdate', data);
        });
    }

    subscribeToSymbol(symbol) {
        if (this.socket) {
            this.socket.emit('subscribe', symbol);
        }
    }

    // Subscriber Management
    subscribe(event, callback) {
        if (this.subscribers[event]) {
            this.subscribers[event].add(callback);
        }
        
        // Initialize socket if this is the first subscriber
        if (event === 'tradingUpdate' && !this.socket) {
            this.initializeSocket();
        }

        // Return unsubscribe function
        return () => {
            if (this.subscribers[event]) {
                this.subscribers[event].delete(callback);
            }
        };
    }

    notifySubscribers(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => callback(data));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    // REST API Methods
    async login(username: string, password: string) {
        return this.api.post('/login', { username, password });
    }

    async register(username: string, password: string, email: string) {
        return this.api.post('/register', { username, password, email });
    }

    async placeOrder(orderData) {
        return this.api.post('/order', orderData);
    }

    async getOrders() {
        try {
            const response = await this.api.get('/orders');
            return response.data;
        } catch (error) {
            console.error('Error getting orders:', error);
            throw error;
        }
    }

    async getWatchlist() {
        return this.api.get('/watchlist');
    }

    async addToWatchlist(symbol: string) {
        return this.api.post('/watchlist', { symbol });
    }

    async getMarketHistory(symbol: string) {
        return this.api.get(`/market/history/${symbol}`);
    }

    async getAccountValue() {
        try {
            const response = await this.api.get(`/get_account_value`);
            const availableFund = response.data?.account_value?.availableFunds;
            return availableFund;
        } catch (error) {
            console.error('Error getting account value:', error);
            throw error;
        }
    }   

    // New API Methods
    async registerStrategy(payload: StrategyRegistrationPayload, symbol: string) {
        try {
            const payloadWithSymbol: any = {
                ...payload,
                symbol: symbol
            }
            payloadWithSymbol['strategy_type'] = payload.type;
            delete payloadWithSymbol.type;
            
            const response = await this.api.post('/register_strategy', payloadWithSymbol);
            return response.data;
        } catch (error) {
            console.error('Error registering strategy:', error);
            throw error;
        }
    }

    async runBacktest(payload: BacktestPayload) {
        try {
            const response = await this.api.post('/backtest', payload);
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error('Error running backtest:', error);
            throw error;
        }
    }

    async getStockData(payload: StockDataPayload) {
        try {
            const response = await this.api.post('/get_stock_data', payload);
            return response.data;
        } catch (error) {
            console.error('Error getting stock data:', error);
            throw error;
        }
    }

    async getStrategies() {
        try {
            const response = await this.api.get('/get_strategies');
            return response.data.strategies;
        } catch (error) {
            console.error('Error getting strategies:', error);
            throw error;
        }
    }

    async optimizeStrategy(
        strategy_type: string,
        parameters: Parameter[],
        optimize_target: string,
        symbol: string,
        interval: string,
        period?: string,
        startTime?: string,
        endTime?: string
    ) {
        try {
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

            const response = await this.api.post('/optimize_strategy', payload);
            return response.data;
        } catch (error) {
            console.error('Error optimizing strategy:', error);
            throw error;
        }
    }

    async startTrading(payload: StartTradingPayload) {
        try {
            const response = await this.api.post('/start_trading', payload);
            return response.data;
        } catch (error) {
            console.error('Error starting trading:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const tradingService = new TradingService();