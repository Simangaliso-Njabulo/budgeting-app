// src/components/Navigation.tsx
import { PieChart, Wallet, TrendingUp, DollarSign } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
}

// Navigation Component
const Navigation = ({ activeTab, setActiveTab, darkMode }: NavigationProps) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: PieChart },
    { id: "buckets", label: "Buckets", icon: Wallet },
    { id: "transactions", label: "Transactions", icon: TrendingUp },
    { id: "categories", label: "Categories", icon: DollarSign },
  ];

  return (
    <nav
      className={`sticky top-0 z-10 backdrop-blur-xl border-b transition-all duration-500 ${
        darkMode
          ? "bg-gray-900/80 border-purple-500/20"
          : "bg-white/80 border-purple-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 py-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeTab === id
                  ? darkMode
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25"
                  : darkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              {activeTab === id && (
                <div
                  className={`absolute inset-0 rounded-xl ${
                    darkMode
                      ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse"
                      : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse"
                  }`}
                ></div>
              )}
              <Icon className="h-4 w-4 mr-2 relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
