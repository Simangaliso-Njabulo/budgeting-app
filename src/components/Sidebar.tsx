// src/components/Sidebar.tsx
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

const Sidebar = ({ activeTab, setActiveTab, appName = "BudgetPro", subtitle = "Personal Finance", onLogout }: SidebarProps) => {
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
    <aside className={styles.sidebar}>
      {/* Subtle background glow */}
      <div className={styles.sidebarGlow} />

      {/* Logo Section */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIconContainer}>
            <AppLogo size="sm" className={styles.logoSvg} />
          </div>
          <span className={styles.logoTitle}>{appName}</span>
          <span className={styles.logoSubtitle}>{subtitle}</span>
        </div>
      </div>

      {/* Navigation */}
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
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
                {isActive && <div className={styles.navIndicator} />}
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
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
};

export default Sidebar;
