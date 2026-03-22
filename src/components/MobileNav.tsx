// src/components/MobileNav.tsx
import { memo } from 'react';
import { LayoutDashboard, Wallet, ArrowUpDown, FolderOpen, Settings } from "lucide-react";
import styles from './MobileNav.module.css';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "buckets", label: "Buckets", icon: Wallet },
  { id: "transactions", label: "Transactions", icon: ArrowUpDown },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const MobileNav = memo(({ activeTab, setActiveTab }: MobileNavProps) => {
  return (
    <nav className={styles.mobileNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ""}`}
            aria-label={item.label}
          >
            <Icon className={styles.mobileNavIcon} />
            <span className={styles.mobileNavLabel}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
});

MobileNav.displayName = 'MobileNav';

export default MobileNav;
