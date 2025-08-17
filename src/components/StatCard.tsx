// src/components/StatCard.tsx
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
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
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex items-center">
        <Icon className={`h-8 w-8 ${iconColor}`} />
        <div className="ml-4">
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {title}
          </p>
          <p className="text-2xl font-bold">
            {typeof value === "number" ? `$${value.toLocaleString()}` : value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
