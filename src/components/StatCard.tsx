// src/components/StatCard.tsx
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  darkMode: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  darkMode,
}: StatCardProps) => {
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
        className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 ${
          darkMode
            ? "bg-gradient-to-r from-purple-600/10 to-blue-600/10"
            : "bg-gradient-to-r from-blue-500/10 to-purple-500/10"
        }`}
      ></div>

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            } mt-1`}
          >
            ${value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${
            iconColor === "text-blue-500"
              ? "from-blue-500 to-blue-600"
              : iconColor === "text-green-500"
              ? "from-green-500 to-green-600"
              : iconColor === "text-yellow-500"
              ? "from-yellow-500 to-yellow-600"
              : "from-red-500 to-red-600"
          } shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
