import react, { useRef, useState, useEffect, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp  } from 'lightweight-charts';
import { Card, Input, Button, Alert, Space,Select, Typography, Row, Col, Table, Modal, Tabs, Tag, Statistic } from 'antd';
import { PlayCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { columns } from './PositionColumns';
import { Strategy } from '../../types/trading';
import { tradingService } from '../../utils/api';
import '../css/LiveTradingMain.css';
import StrategyParamsInputs from './StrategyParamsInputs';
const { Title } = Typography;
const { TabPane } = Tabs;

interface ChartInstance {
  chart: IChartApi;
  candlestickSeries: ISeriesApi<"Candlestick">;
  container: HTMLDivElement;
}

interface TradingInstance {
  id: number;
  symbol: string;
  strategy: string;
  startTime: Date;
  status: 'active' | 'completed';
  profit: number;
  trades: any[];
  interval: string;
}

interface Position {
  id: number;
  instanceId: number;
  symbol: string;
  strategy: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  entryTime: string;
  status: 'open' | 'closed';
  profit: number;
}

const LiveTrading = () => {
  const [activeInstances, setActiveInstances] = useState<TradingInstance[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [allPositions, setAllPositions] = useState<Position[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPositionDetails, setSelectedPositionDetails] = useState(null);
  const [tradingData, setTradingData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [orders, setOrders] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [orderForm, setOrderForm] = useState({
        symbol: 'SPY',
        type: 'BUY',
        quantity: '',
        price: ''
    });
  const [strategyParams, setStrategyParams] = useState<Record<string, number>>({});
  const chartContainerRef = useRef();
  const chartRefs = useRef<Record<number, ChartInstance>>({});
  const [confirmedSymbol, setConfirmedSymbol] = useState('');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [currentCapital, setCurrentCapital] = useState();

  // Add interval options
  const intervalOptions = [
    { value: '1 min', label: '1 Minute' },
    { value: '5 mins', label: '5 Minutes' },
    { value: '15 mins', label: '15 Minutes' },
    { value: '1 hour', label: '1 Hour' },
    { value: '4 hours', label: '4 Hours' },
    { value: '1 day', label: 'Daily' }
  ];

  // Function to start a new trading instance
  const startNewInstance = () => {
    if (!selectedSymbol || !selectedStrategy) {
      alert('Please select both symbol and strategy');
      return;
    }

    const newInstance = {
      id: Date.now(),
      symbol: selectedSymbol,
      strategy: strategies.find(s => s.id === selectedStrategy)?.type,
      startTime: new Date(),
      status: 'active',
      profit: 0,
      trades: [],
      interval: selectedInterval,
    };

    setActiveInstances(prev => [...prev, newInstance]);
    tradingService.startTrading({symbol: selectedSymbol, strategy_type: selectedStrategy, interval: selectedInterval, params: strategyParams});
    initializeChart(newInstance.id, selectedSymbol);
  };

  // Initialize chart for a specific instance
  const initializeChart = (instanceId, symbol) => {
    if (!chartRefs.current[instanceId]) {
      const container = document.createElement('div');
      const chart = createChart(container, {
        layout: {
          background: { type: ColorType.Solid, color: 'white' },
          textColor: 'black',
        },
        grid: {
          vertLines: { color: '#E5E5E5' },
          horzLines: { color: '#E5E5E5' },
        },
        width: 800,
        height: 400,
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });

      chartRefs.current[instanceId] = { chart, candlestickSeries, container };
      startDataFeed(instanceId, symbol);
    }
  };

  useEffect(() => {
    if (!confirmedSymbol) return;

    // Subscribe to trading updates
    const tradingUnsubscribe = tradingService.subscribe('tradingUpdate', (data) => {
        setTradingData(prev => ({
            ...prev,
            [data.symbol]: data
        }));
    });

    // Subscribe to connection status
    const connectionUnsubscribe = tradingService.subscribe('connectionStatus', (status) => {
        setConnectionStatus(status);
    });

    // Subscribe to order updates
    const orderUnsubscribe = tradingService.subscribe('orderUpdate', async () => {
        //await fetchOrders();
    });

    // Subscribe to selected symbol
    tradingService.subscribeToSymbol(confirmedSymbol);

    // Cleanup subscriptions
    return () => {
        tradingUnsubscribe();
        connectionUnsubscribe();
        orderUnsubscribe();
    };
}, [confirmedSymbol]);

useEffect(() => {
  initilizeTradingData();
}, []);

const fetchCurrentCapital = useMemo(() => async () => {
  const response = await tradingService.getAccountValue();
  setCurrentCapital(response);
}, []);

const fetchOrders = async () => {
    try {
        const response = await tradingService.getOrders();
        setOrders(response.data);
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
};

const fetchWatchlist = async () => {
    try {
        const response = await tradingService.getWatchlist();
        setWatchlist(response.data);
    } catch (error) {
        console.error('Error fetching watchlist:', error);
    }
};

const initilizeTradingData = useMemo(() => async () => {
  tradingService.getStrategies().then(setStrategies);
  await fetchCurrentCapital()
  await fetchWatchlist();
}, []);

  // Simulated market data feed for each instance
  const startDataFeed = (instanceId, symbol) => {
    let lastClose = 100;
    const interval = setInterval(() => {
      const now = new Date();
      const change = (Math.random() - 0.5) * 2;
      const open = lastClose;
      const close = open + change;
      const high = Math.max(open, close) + Math.random();
      const low = Math.min(open, close) - Math.random();
      
      lastClose = close;

      const candleData = {
        time: (now.getTime() / 1000) as UTCTimestamp,
        open,
        high,
        low,
        close,
      };

      if (chartRefs.current[instanceId]) {
        chartRefs.current[instanceId].candlestickSeries.update(candleData);
        checkTradeSignals(instanceId, candleData);
      }
    }, 1000);

    return interval;
  };

  // Check for trade signals for a specific instance
  const checkTradeSignals = (instanceId, data) => {
    const instance = activeInstances.find(i => i.id === instanceId);
    if (!instance) return;

    if (Math.random() > 0.95) {
      const isBuy = Math.random() > 0.5;
      const newPosition = {
        id: Date.now(),
        instanceId,
        symbol: instance.symbol,
        strategy: instance.strategy,
        type: isBuy ? 'BUY' : 'SELL',
        entryPrice: data.close,
        entryTime: new Date().toLocaleString(),
        status: 'open',
        profit: 0,
      };

      setAllPositions(prev => [...prev, newPosition]);
      updateInstanceProfit(instanceId, Math.random() * 5 * (isBuy ? 1 : -1));
    }
  };

  // Update profit for a specific instance
  const updateInstanceProfit = (instanceId, amount) => {
    setActiveInstances(prev =>
      prev.map(instance =>
        instance.id === instanceId
          ? { ...instance, profit: instance.profit + amount }
          : instance
      )
    );
  };

  // Stop a trading instance
  const stopInstance = (instanceId) => {
    setActiveInstances(prev =>
      prev.map(instance =>
        instance.id === instanceId
          ? { ...instance, status: 'completed' }
          : instance
      )
    );
  };

  // Show position details modal
  const showPositionDetails = (position) => {
    setSelectedPositionDetails(position);
    setIsModalVisible(true);
  };

  // Render position details modal
  const renderPositionModal = () => {
    if (!selectedPositionDetails) return null;

    const instance = activeInstances.find(i => i.id === selectedPositionDetails.instanceId);
    const relatedTrades = allPositions.filter(p => p.instanceId === selectedPositionDetails.instanceId);

    return (
      <Modal
        title={`Position Details - ${selectedPositionDetails.symbol}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={null}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Overview" key="1">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Entry Price"
                  value={selectedPositionDetails.entryPrice}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Current Profit"
                  value={selectedPositionDetails.profit}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: selectedPositionDetails.profit >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Duration"
                  value={instance?.status === 'completed' ? 'Closed' : 'Active'}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 24, height: 400 }} ref={chartContainerRef} />
          </TabPane>
          <TabPane tab="Trade History" key="2">
            <Table
              dataSource={relatedTrades}
              columns={columns.filter(col => col.key !== 'actions')}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  const handleStrategyChange = (strategyId: string) => {
    setSelectedStrategy(strategyId);
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy && strategy.params) {
      setStrategyParams(strategy.params);
    } else {
      setStrategyParams({});
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-row justify-between items-center">
        <h2 className="text-xl font-bold mb-4">Live Trading Dashboard</h2>
        <div className="trading-current-portfolio">
          <div style={{fontSize: '12px', color: 'grey'}}>CURRENT PORTFOLIO</div>
          <div className="text-green-600">${currentCapital}</div>
        </div>
      </div>
      <Card>
        <Space className="mb-4">
          <Input
            style={{ width: 200 }}
            placeholder="Enter symbol"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value.toUpperCase())}
            onBlur={() => setConfirmedSymbol(selectedSymbol)}
            maxLength={10}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Select interval"
            value={selectedInterval}
            onChange={setSelectedInterval}
            options={intervalOptions}
          />
          <Button 
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={startNewInstance}
          style={{ backgroundColor: '#52c41a', marginLeft:'20px'}}
        >
          Start Trading
        </Button>
        </Space>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
            <Select
              style={{ width: 200 }}
              placeholder="Select strategy"
              value={selectedStrategy}
              onChange={handleStrategyChange}
              options={strategies.map(strategy => ({
                value: strategy.id,
                label: strategy.type
              }))}
            />
            {selectedStrategy && <StrategyParamsInputs 
              params={strategyParams}
              onParamChange={(name, value) => {
                setStrategyParams(prev => ({...prev, [name]: Number(value)}));
              }}
            />}
          </div>
        

        <Title style={{ marginBottom:0 }} level={4}>Active Trading Instances</Title>
        <Row gutter={[16, 16]} className="mb-4">
          {activeInstances.map(instance => (
            <Col span={8} key={instance.id}>
              <Card>
                <Statistic
                  title={`${instance.symbol} - ${instance.strategy}`}
                  value={instance.profit}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: instance.profit >= 0 ? '#3f8600' : '#cf1322' }}
                />
                <div style={{ marginTop: 16 }}>
                  <Tag color={instance.status === 'active' ? 'green' : 'gray'}>
                    {instance.status}
                  </Tag>
                  {instance.status === 'active' && (
                    <Button
                      type="primary"
                      danger
                      size="small"
                      onClick={() => stopInstance(instance.id)}
                      style={{ marginLeft: 8 }}
                    >
                      Stop
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Positions Table */}
        <Title level={4}>Positions</Title>
        <Table
          dataSource={allPositions}
          columns={columns}
          pagination={{ pageSize: 5 }}
        />

        {/* Position Details Modal */}
        {renderPositionModal()}
      </Card>
    </div>
  );
};

export default LiveTrading;

    // const handleOrderSubmit = async (e) => {
    //     e.preventDefault();
    //     try {
    //         await tradingService.placeOrder(orderForm);
    //         setOrderForm({
    //             ...orderForm,
    //             quantity: '',
    //             price: ''
    //         });
    //         await fetchOrders();
    //     } catch (error) {
    //         console.error('Error placing order:', error);
    //     }
    // };

    // const handleWatchlistAdd = async (symbol) => {
    //     try {
    //         await tradingService.addToWatchlist(symbol);
    //         await fetchWatchlist();
    //     } catch (error) {
    //         console.error('Error adding to watchlist:', error);
    //     }
    // };

    // const formatTimestamp = (timestamp) => {
    //     return new Date(timestamp * 1000).toLocaleTimeString();
    // };