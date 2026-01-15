// src/components/Sidebar.tsx
import { LayoutDashboard, Wallet, ArrowUpDown, FolderOpen, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appName?: string;
  subtitle?: string;
}

// Custom Logo Icon Component - Dollar Sign (always purple)
const AppLogoIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
    <defs>
      {/* Purple gradient for logo */}
      <linearGradient id="logoGradientPurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#c4b5fd" />
      </linearGradient>
      <linearGradient id="dollarGradientPurple" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
    {/* Outer ring */}
    <circle
      cx="20" cy="20" r="18"
      stroke="url(#logoGradientPurple)"
      strokeWidth="2"
      fill="none"
      opacity="0.5"
    />
    {/* Inner circle background */}
    <circle
      cx="20" cy="20" r="15"
      fill="rgba(139, 92, 246, 0.12)"
    />
    {/* Dollar sign */}
    <text
      x="20"
      y="26"
      textAnchor="middle"
      fontSize="20"
      fontWeight="700"
      fontFamily="system-ui, -apple-system, sans-serif"
      fill="url(#dollarGradientPurple)"
    >
      $
    </text>
  </svg>
);

const Sidebar = ({ activeTab, setActiveTab, appName = "BudgetPro", subtitle = "Personal Finance" }: SidebarProps) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "buckets", label: "Buckets", icon: Wallet },
    { id: "transactions", label: "Transactions", icon: ArrowUpDown },
    { id: "categories", label: "Categories", icon: FolderOpen },
  ];

  const bottomItems = [
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="sidebar glass-sidebar">
      {/* Subtle background glow */}
      <div className="sidebar-glow" />

      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon-container">
            <AppLogoIcon />
          </div>
          <div className="logo-text">
            <span className="logo-title">{appName}</span>
            <span className="logo-subtitle">{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive && <div className="nav-indicator" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="nav-section nav-section-bottom">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${activeTab === item.id ? "nav-item-active" : ""}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
          <button className="nav-item nav-item-logout">
            <LogOut className="nav-icon" />
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
