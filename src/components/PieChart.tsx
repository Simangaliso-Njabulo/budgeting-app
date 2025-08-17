// src/components/PieChart.tsx
import type { CategoryData } from "../types";

interface PieChartProps {
  data: CategoryData[];
  title: string;
  dataKey: "allocated" | "actual";
  tooltipLabel: string;
  darkMode: boolean;
}

const PieChart = ({ data, title, dataKey, darkMode }: PieChartProps) => {
  return (
    <div
      className={`rounded-2xl p-8 shadow-2xl transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
          : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
      }`}
    >
      <h3
        className={`text-xl font-bold mb-6 text-center ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-black/5 transition-all duration-300"
          >
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="flex-1">
              <div
                className={`font-medium ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {item.name}
              </div>
              <div
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                ${item[dataKey as keyof CategoryData].toLocaleString()} (
                {item.percentage}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
