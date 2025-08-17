// src/components/PieChart.tsx
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface ChartData {
  name: string;
  allocated?: number;
  actual?: number;
  color: string;
}

interface PieChartProps {
  data: ChartData[];
  title: string;
  dataKey: "allocated" | "actual";
  tooltipLabel: string;
  darkMode: boolean;
}

const PieChart = ({
  data,
  title,
  dataKey,
  tooltipLabel,
  darkMode,
}: PieChartProps) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                tooltipLabel,
              ]}
            />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChart;
