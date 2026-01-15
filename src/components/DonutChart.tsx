// src/components/DonutChart.tsx
import { Cell, ResponsiveContainer, PieChart, Pie } from "recharts";
import { useTheme } from "../context/ThemeContext";
import type { CategoryData } from "../types";

interface DonutChartProps {
  data: CategoryData[];
}

const DonutChart = ({ data }: DonutChartProps) => {
  const { formatCurrency } = useTheme();
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.allocated,
    color: item.color,
    percentage: item.percentage,
  }));

  return (
    <div className="chart-card">
      <h3 className="chart-title">Income Distribution by Category</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <defs>
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  filter="url(#softGlow)"
                  stroke="none"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="chart-legend">
        {chartData.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-left">
              <div
                className="legend-dot"
                style={{ backgroundColor: item.color }}
              />
              <span className="legend-label">{item.name}</span>
            </div>
            <div className="legend-right">
              <span className="legend-value">{formatCurrency(item.value)}</span>
              <span className="legend-percentage">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
