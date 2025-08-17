// src/components/Header.tsx
import { Moon, Sun, Wallet } from "lucide-react";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Header = ({ darkMode, setDarkMode }: HeaderProps) => {
  return (
    <header
      className={`relative overflow-hidden ${
        darkMode
          ? "bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-b border-purple-500/20"
          : "bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-b border-purple-200"
      } transition-all duration-500`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25"
                  : "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25"
              } transform hover:scale-110 transition-all duration-300`}
            >
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1
              className={`text-2xl font-bold bg-gradient-to-r ${
                darkMode
                  ? "from-purple-400 to-blue-400"
                  : "from-purple-600 to-blue-600"
              } bg-clip-text text-transparent`}
            >
              Personal Budget Tracker
            </h1>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              darkMode
                ? "bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-400/40"
                : "bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40"
            }`}
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-white" />
            ) : (
              <Moon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
