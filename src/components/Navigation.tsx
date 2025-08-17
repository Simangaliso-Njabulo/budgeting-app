// src/components/Navigation.tsx
import { PieChart, Wallet, List, TrendingUp } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
}

const Navigation = ({ activeTab, setActiveTab, darkMode }: NavigationProps) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: PieChart },
    { id: "buckets", label: "Buckets", icon: Wallet },
    { id: "transactions", label: "Transactions", icon: List },
    { id: "categories", label: "Categories", icon: TrendingUp },
  ];

  return (
    <nav
      className={`shadow-sm border-b ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                backgroundColor:
                  activeTab === id
                    ? darkMode
                      ? "#2563eb"
                      : "#dbeafe"
                    : "transparent",
                color:
                  activeTab === id
                    ? darkMode
                      ? "#ffffff"
                      : "#1d4ed8"
                    : darkMode
                    ? "#d1d5db"
                    : "#4b5563",
              }}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 border-0 ${
                activeTab !== id && darkMode
                  ? "hover:bg-gray-700 hover:text-white"
                  : ""
              } ${
                activeTab !== id && !darkMode
                  ? "hover:bg-gray-100 hover:text-gray-900"
                  : ""
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
