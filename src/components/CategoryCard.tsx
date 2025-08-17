import type { CategoryData } from "../types";

// src/components/CategoryCard.tsx
interface CategoryCardProps {
  category: CategoryData;
  darkMode: boolean;
}

const CategoryCard = ({ category, darkMode }: CategoryCardProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 shadow-xl"
          : "bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl"
      }`}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: `${category.color}10` }}
      ></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {category.name}
          </h3>
          <div
            className="w-4 h-4 rounded-full shadow-lg"
            style={{ backgroundColor: category.color }}
          ></div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Allocated
            </span>
            <span
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ${category.allocated.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Spent
            </span>
            <span
              className={`font-medium ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              ${category.actual.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              % of Income
            </span>
            <span className="font-bold text-blue-500">
              {category.percentage}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className={`mt-4 w-full rounded-full h-2 ${
            darkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        >
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(
                (category.actual / category.allocated) * 100,
                100
              )}%`,
              backgroundColor: category.color,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
