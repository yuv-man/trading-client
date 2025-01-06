interface PerformanceTableProps {
    results: {
      performance: {
        Total: Record<string, number>;
        Long: Record<string, number>;
        Short: Record<string, number>;
      };
    };
  }
  
  const PerformanceTable: React.FC<PerformanceTableProps> = ({ results }) => {
    const formatCurrency = (value: number) => {
      const isNegative = value < 0;
      const formattedValue = `$ ${value.toFixed(2)}`;
      return {
        value: isNegative ? `(${formattedValue})` : formattedValue,
        isNegative
      };
    };
  
    const formatPercentage = (value: number) => {
      const isNegative = value < 0;
      const formattedValue = `${value.toFixed(2)} %`;
      return {
        value: isNegative ? `(${formattedValue})` : formattedValue,
        isNegative
      };
    };
  
    const formatNumber = (value: number) => {
      const isNegative = value < 0;
      const formattedValue = Math.round(value).toString();
      return {
        value: isNegative ? `(${formattedValue})` : formattedValue,
        isNegative
      };
    };
  
    const getMetricValue = (data: any, metric: string, type: 'Total' | 'Long' | 'Short') => {
      const value = results?.performance?.[type]?.[metric];
      if (value === undefined) return { value: '0', isNegative: false };
      
      // Format based on metric type
      if (metric.includes('profits') || metric.includes('losses') || 
          metric.includes('net_profit') || metric.includes('avg_trade') ||
          metric.includes('max_loss') || metric.includes('avg_winning_trade') || metric.includes('avg_losing_trade')) {
        return formatCurrency(value);
      }
      if (metric.includes('ratio') || metric.includes('winning_rate') || metric.includes('profit_pct')) {
        return formatPercentage(value);
      }
      return formatNumber(value);
    };
  
    const tableRows = [
      { metric: 'Profits', key: 'profits' },
      { metric: 'Losses', key: 'losses' },
      { metric: 'Net Profit', key: 'net_profit' },
      { metric: '% Profit', key: 'profit_pct' },
      { metric: 'Winning Rate', key: 'winning_rate' },
      { metric: 'Max Loss', key: 'max_loss' },
      { metric: 'Number of Trades', key: 'total_trades' },
      { metric: 'Number of Winning Trades', key: 'winning_trades' },
      { metric: 'Number of Losing Trades', key: 'losing_trades' },
      { metric: 'Number of Even Trades', key: 'even_trades' },
      { metric: 'Number of Trends', key: 'num_trends' },
      { metric: 'Number of Trends Intra Day', key: 'num_trends_intraday' },
      { metric: 'Avg Trade', key: 'avg_trade' },
      { metric: 'Avg Winning Trade', key: 'avg_winning_trade' },
      { metric: 'Avg Losing Trade', key: 'avg_losing_trade' },
      { metric: 'Ratio Avg Win/Avg Loss', key: 'win_loss_ratio' }
    ].map((row, index) => {
      const total = getMetricValue(results?.performance, row.key, 'Total');
      const long = getMetricValue(results?.performance, row.key, 'Long');
      const short = getMetricValue(results?.performance, row.key, 'Short');
      
      return {
        key: index,
        metric: row.metric,
        total,
        long,
        short
      };
    });
  
    return (
      <tbody className="divide-y divide-gray-200">
        {tableRows.map((row) => (
          <tr key={row.key} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-900">{row.metric}</td>
            <td className={`px-6 py-4 text-sm text-right font-mono ${row.total.isNegative ? 'text-red-500' : 'text-gray-900'}`}>
              {row.total.value}
            </td>
            <td className={`px-6 py-4 text-sm text-right font-mono ${row.long.isNegative ? 'text-red-500' : 'text-gray-900'}`}>
              {row.long.value}
            </td>
            <td className={`px-6 py-4 text-sm text-right font-mono ${row.short.isNegative ? 'text-red-500' : 'text-gray-900'}`}>
              {row.short.value}
            </td>
          </tr>
        ))}
      </tbody>
    );
  };
  
  export default PerformanceTable;