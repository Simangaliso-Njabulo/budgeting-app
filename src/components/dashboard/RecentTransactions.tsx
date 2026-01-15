// src/components/dashboard/RecentTransactions.tsx
import { ArrowRight, ArrowUpRight, ArrowDownRight, Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Transaction, Category } from '../../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onViewAll: () => void;
  limit?: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  shopping: ShoppingBag,
  car: Car,
  food: Utensils,
  entertainment: Film,
  work: Briefcase,
  health: Heart,
  gift: Gift,
  travel: Plane,
  tech: Smartphone,
  utilities: Zap,
  income: DollarSign,
};

const RecentTransactions = ({ transactions, categories, onViewAll, limit = 5 }: RecentTransactionsProps) => {
  const { formatCurrency } = useTheme();

  // Sort by date and take the most recent
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="recent-transactions glass-card">
      <div className="recent-transactions-header">
        <h3 className="recent-transactions-title">Recent Transactions</h3>
        <button className="recent-transactions-view-all" onClick={onViewAll}>
          View All <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="recent-transactions-empty">
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="recent-transactions-list">
          {recentTransactions.map((transaction) => {
            const category = categories.find(c => c.id === transaction.categoryId);
            const Icon = ICON_MAP[category?.icon || 'home'] || Home;
            const isExpense = transaction.type === 'expense';

            return (
              <div key={transaction.id} className="recent-transaction-item">
                <div className="recent-transaction-left">
                  <div
                    className="recent-transaction-icon"
                    style={{
                      backgroundColor: `${category?.color || '#a78bfa'}15`,
                      color: category?.color || '#a78bfa'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="recent-transaction-info">
                    <span className="recent-transaction-description">{transaction.description}</span>
                    <span className="recent-transaction-category">{category?.name}</span>
                  </div>
                </div>
                <div className="recent-transaction-right">
                  <span className={`recent-transaction-amount ${isExpense ? 'expense' : 'income'}`}>
                    {isExpense ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                    {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </span>
                  <span className="recent-transaction-date">{formatDate(transaction.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
