// src/components/dashboard/RecentTransactions.tsx
import { ArrowRight, ArrowUpRight, ArrowDownRight, Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Transaction, Category } from '../../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onViewAll: () => void;
  limit?: number;
  monthlyIncome?: number;
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

const RecentTransactions = ({ transactions, categories, onViewAll, limit = 5, monthlyIncome }: RecentTransactionsProps) => {
  const { formatCurrency } = useTheme();

  // Sort by date - show all transactions, scroll to see more
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate running balance for displayed transactions
  const balanceMap = new Map<string, number>();
  if (monthlyIncome !== undefined) {
    // Sort transactions chronologically to calculate balance
    const chronological = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.getTime() - b.createdAt.getTime()
    );
    let balance = monthlyIncome;
    for (const tx of chronological) {
      if (tx.type === 'expense') {
        balance -= tx.amount;
      } else {
        balance += tx.amount;
      }
      balanceMap.set(tx.id, Math.round(balance * 100) / 100);
    }
  }

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
        <div
          className="recent-transactions-list"
          style={{ '--visible-items': limit } as React.CSSProperties}
        >
          {recentTransactions.map((transaction, index) => {
            const category = categories.find(c => c.id === transaction.categoryId);
            const Icon = ICON_MAP[category?.icon || 'home'] || Home;
            const isExpense = transaction.type === 'expense';

            return (
              <div
                key={transaction.id}
                className="recent-transaction-item"
                style={{ animationDelay: `${index * 60}ms` }}
              >
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
                  <div className="recent-transaction-amounts">
                    <span className={`recent-transaction-amount ${isExpense ? 'expense' : 'income'}`}>
                      {isExpense ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </span>
                    {balanceMap.has(transaction.id) && (
                      <span className={`recent-transaction-balance ${balanceMap.get(transaction.id)! < 0 ? 'negative' : ''}`}>
                        Bal: {formatCurrency(balanceMap.get(transaction.id)!)}
                      </span>
                    )}
                  </div>
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
