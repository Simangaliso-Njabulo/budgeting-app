// src/components/DonutChart.tsx
import { useState } from "react";
import { Cell, ResponsiveContainer, PieChart, Pie } from "recharts";
import { useTheme } from "../context/ThemeContext";
import type { CategoryData } from "../types";
import styles from './DonutChart.module.css';

interface DonutChartProps {
  data: CategoryData[];
  unallocated?: number;
}

const DonutChart = ({ data, unallocated = 0 }: DonutChartProps) => {
  const { formatCurrency } = useTheme();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate total for percentage calculations
  const totalAllocated = data.reduce((sum, item) => sum + item.allocated, 0);
  const grandTotal = totalAllocated + Math.max(0, unallocated);

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.allocated,
    color: item.color,
    percentage: grandTotal > 0 ? ((item.allocated / grandTotal) * 100).toFixed(1) : "0",
  }));

  // Add unallocated segment if there's unallocated money
  if (unallocated > 0) {
    chartData.push({
      name: "Unallocated",
      value: unallocated,
      color: "#4b5563", // Gray color for unallocated
      percentage: grandTotal > 0 ? ((unallocated / grandTotal) * 100).toFixed(1) : "0",
    });
  }

  const handleLegendEnter = (index: number) => {
    setActiveIndex(index);
  };

  const handleLegendLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Budget Distribution by Category</h3>
      <div className={styles.chartContainer}>
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
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
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
                  filter={activeIndex === index ? "url(#strongGlow)" : "url(#softGlow)"}
                  stroke={activeIndex === index ? entry.color : "none"}
                  strokeWidth={activeIndex === index ? 3 : 0}
                  style={{
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.3,
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend with hover interaction */}
      <div className={styles.chartLegend}>
        {chartData.map((item, index) => (
          <div
            key={index}
            className={`${styles.legendItem} ${activeIndex === index ? styles.legendItemActive : ''}`}
            onMouseEnter={() => handleLegendEnter(index)}
            onMouseLeave={handleLegendLeave}
            style={{
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.5,
              transform: activeIndex === index ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            <div className={styles.legendLeft}>
              <div
                className={styles.legendDot}
                style={{
                  backgroundColor: item.color,
                  boxShadow: activeIndex === index ? `0 0 8px ${item.color}` : 'none',
                  transform: activeIndex === index ? 'scale(1.3)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              />
              <span className={styles.legendLabel}>{item.name}</span>
            </div>
            <div className={styles.legendRight}>
              <span className={styles.legendValue}>{formatCurrency(item.value)}</span>
              <span className={styles.legendPercentage}>{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
