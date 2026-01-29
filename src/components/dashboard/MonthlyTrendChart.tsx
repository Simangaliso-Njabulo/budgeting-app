// src/components/dashboard/MonthlyTrendChart.tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import type { MonthlyTrendItem } from '../../types';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
}

const MonthlyTrendChart = ({ data }: MonthlyTrendChartProps) => {
  const { formatCurrency, theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = data.map((item) => ({
    name: `${MONTH_SHORT[item.month - 1]} ${item.year}`,
    income: item.income,
    expenses: item.expenses,
    net: item.net,
  }));

  const formatYAxis = (value: number) => {
    if (value === 0) return '0';
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  return (
    <div className="spending-trend glass-card">
      <div className="spending-trend-header">
        <h3 className="spending-trend-title">Monthly Trends</h3>
        <span className="spending-trend-period">Last {data.length} months</span>
      </div>

      <div className="spending-trend-chart">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="spending-trend-tooltip" style={{ minWidth: 140 }}>
                      <span className="tooltip-label" style={{ marginBottom: 4 }}>{payload[0].payload.name}</span>
                      {payload.map((entry) => (
                        <div key={entry.dataKey as string} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                          <span style={{ color: entry.color, fontSize: 12 }}>{entry.dataKey === 'income' ? 'Income' : 'Expenses'}</span>
                          <span className="tooltip-value" style={{ fontSize: 12 }}>{formatCurrency(entry.value as number)}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
              cursor={{ fill: isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)' }}
            />
            <Legend
              verticalAlign="top"
              height={30}
              wrapperStyle={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280' }}
            />
            <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={32} name="Income" />
            <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={32} name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendChart;
