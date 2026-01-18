// src/components/MobileNav.tsx
import { LayoutDashboard, Wallet, ArrowUpDown, FolderOpen, Settings } from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav = ({ activeTab, setActiveTab }: MobileNavProps) => {
  const navItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard },
    { id: "buckets", label: "Buckets", icon: Wallet },
    { id: "transactions", label: "Transactions", icon: ArrowUpDown },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`mobile-nav-item ${isActive ? "mobile-nav-item-active" : ""}`}
            aria-label={item.label}
          >
            <Icon className="mobile-nav-icon" />
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
