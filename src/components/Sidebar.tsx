// src/components/Sidebar.tsx
import { memo } from 'react';
import { LayoutDashboard, Wallet, ArrowUpDown, FolderOpen, Settings, LogOut } from "lucide-react";
import AppLogo from './common/AppLogo';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appName?: string;
  subtitle?: string;
  onLogout?: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "buckets", label: "Buckets", icon: Wallet },
  { id: "transactions", label: "Transactions", icon: ArrowUpDown },
  { id: "categories", label: "Categories", icon: FolderOpen },
] as const;

const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const Sidebar = memo(({ activeTab, setActiveTab, appName = "BudgetPro", subtitle = "Personal Finance", onLogout }: SidebarProps) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarGlow} />

      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIconContainer}>
            <AppLogo size="sm" className={styles.logoSvg} />
          </div>
          <span className={styles.logoTitle}>{appName}</span>
          <span className={styles.logoSubtitle}>{subtitle}</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <div className={styles.navSection}>
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <div className={styles.navIndicator} />}
              </button>
            );
          })}
        </div>

        <div className={`${styles.navSection} ${styles.navSectionBottom}`}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ""}`}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
          <button className={`${styles.navItem} ${styles.navItemLogout}`} onClick={onLogout}>
            <LogOut className={styles.navIcon} />
            <span className={styles.navLabel}>Sign Out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
