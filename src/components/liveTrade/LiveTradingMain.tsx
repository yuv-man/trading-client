import react, { useRef, useState, useEffect } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, UTCTimestamp  } from 'lightweight-charts';
import { Card, Select, Button, Alert, Space, Typography, Row, Col, Table, Modal, Tabs, Tag, Statistic } from 'antd';
import { PlayCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { Strategy } from '../../types/trading';
import { tradingService } from '../../utils/api';
const { Title } = Typography;
const { TabPane } = Tabs;

const STRATEGIES = [
  { id: 'macd_stoch', name: 'MACD + Stochastic' },
  { id: 'rsi_trend', name: 'RSI Trend Following' },
  { id: 'breakout', name: 'Breakout Strategy' }
];

const SYMBOLS = [
  { value: 'BTCUSDT', label: 'BTC/USDT' },
  { value: 'ETHUSDT', label: 'ETH/USDT' },
  { value: 'BNBUSDT', label: 'BNB/USDT' },
];

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
    const [orderForm, setOrderForm] = useState({
        symbol: 'SPY',
        type: 'BUY',
        quantity: '',
        price: ''
    });
  
  const chartContainerRef = useRef();
  const chartRefs = useRef<Record<number, ChartInstance>>({});

  // Function to start a new trading instance
  const startNewInstance = () => {
    if (!selectedSymbol || !selectedStrategy) {
      alert('Please select both symbol and strategy');
      return;
    }

    const newInstance = {
      id: Date.now(),
      symbol: selectedSymbol,
      strategy: STRATEGIES.find(s => s.id === selectedStrategy).name,
      startTime: new Date(),
      status: 'active',
      profit: 0,
      trades: [],
    };

    setActiveInstances(prev => [...prev, newInstance]);
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
    tradingService.subscribeToSymbol(selectedSymbol);

    // Load initial data
    // fetchOrders();
    // fetchWatchlist();

    // Cleanup subscriptions
    return () => {
        tradingUnsubscribe();
        connectionUnsubscribe();
        orderUnsubscribe();
    };
}, [selectedSymbol]);

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

  // Position details table columns
  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'BUY' ? 'green' : 'red'}>{type}</Tag>
      ),
    },
    {
      title: 'Entry Time',
      dataIndex: 'entryTime',
      key: 'entryTime',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'open' ? 'blue' : 'gray'}>{status}</Tag>
      ),
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => (
        <span style={{ color: profit >= 0 ? '#3f8600' : '#cf1322' }}>
          ${profit.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<LineChartOutlined />}
          onClick={() => showPositionDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

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

  return (
    <Card>
      <Title level={3}>Multi-Instance Trading Dashboard</Title>
      
      {/* Trading Controls */}
      <Space className="mb-4">
        <Select
          style={{ width: 200 }}
          placeholder="Select symbol"
          value={selectedSymbol}
          onChange={setSelectedSymbol}
          options={SYMBOLS}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Select strategy"
          value={selectedStrategy}
          onChange={setSelectedStrategy}
          options={STRATEGIES.map(strategy => ({
            value: strategy.id,
            label: strategy.name
          }))}
        />
        <Button 
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={startNewInstance}
          style={{ backgroundColor: '#52c41a' }}
        >
          Start New Instance
        </Button>
      </Space>

      {/* Active Instances */}
      <Title level={4}>Active Trading Instances</Title>
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