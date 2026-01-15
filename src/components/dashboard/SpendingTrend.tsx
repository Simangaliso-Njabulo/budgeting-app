// src/components/dashboard/SpendingTrend.tsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import type { Transaction } from '../../types';

interface SpendingTrendProps {
  transactions: Transaction[];
  days?: number;
}

const SpendingTrend = ({ transactions, days = 7 }: SpendingTrendProps) => {
  const { formatCurrency, theme } = useTheme();

  // Generate last N days
  const generateDays = () => {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date,
      });
    }
    return result;
  };

  const daysList = generateDays();

  // Calculate spending per day
  const chartData = daysList.map(day => {
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.date).toISOString().split('T')[0];
      return tDate === day.date && t.type === 'expense';
    });

    const totalSpent = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      name: day.label,
      spent: totalSpent,
      fullDate: day.date,
    };
  });

  const maxSpent = Math.max(...chartData.map(d => d.spent), 100);

  const isDark = theme === 'dark';

  return (
    <div className="spending-trend glass-card">
      <div className="spending-trend-header">
        <h3 className="spending-trend-title">Spending Trend</h3>
        <span className="spending-trend-period">Last {days} days</span>
      </div>

      <div className="spending-trend-chart">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => value === 0 ? '0' : `${(value / 1000).toFixed(0)}k`}
              domain={[0, Math.ceil(maxSpent / 100) * 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="spending-trend-tooltip">
                      <span className="tooltip-label">{payload[0].payload.name}</span>
                      <span className="tooltip-value">{formatCurrency(payload[0].value as number)}</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="spent"
              fill="#a78bfa"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingTrend;
