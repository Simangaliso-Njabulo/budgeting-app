// src/components/Header.tsx
interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Header = ({ darkMode, setDarkMode }: HeaderProps) => {
  return (
    <header className={`shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold">Personal Budget Tracker</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-md ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
