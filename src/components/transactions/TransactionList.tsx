// src/components/transactions/TransactionList.tsx
import { Edit2, Trash2, Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Transaction, Category, Bucket } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  buckets: Bucket[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
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

const TransactionList = ({ transactions, categories, buckets, onEdit, onDelete }: TransactionListProps) => {
  const { formatCurrency } = useTheme();

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Get today's and yesterday's date strings for comparison
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dateStr;
  };

  // Calculate cumulative item count for animation delays across groups
  let cumulativeIndex = 0;

  return (
    <div className="transaction-list">
      {sortedDates.map((date, groupIndex) => {
        const groupStartIndex = cumulativeIndex;
        cumulativeIndex += groupedTransactions[date].length;

        return (
          <div
            key={date}
            className="transaction-group"
            style={{ animationDelay: `${groupIndex * 150}ms` }}
          >
            <div className="transaction-group-header">
              <span className="transaction-group-date">{formatDateLabel(date)}</span>
              <span className="transaction-group-count">{groupedTransactions[date].length} transaction{groupedTransactions[date].length !== 1 ? 's' : ''}</span>
            </div>

            <div className="transaction-group-items">
              {groupedTransactions[date].map((transaction, index) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const bucket = buckets.find(b => b.id === transaction.bucketId);
                const Icon = ICON_MAP[category?.icon || 'home'] || Home;
                const isExpense = transaction.type === 'expense';
                const itemDelay = (groupStartIndex + index) * 60 + groupIndex * 150;

                return (
                  <div
                    key={transaction.id}
                    className="transaction-item glass-card"
                    style={{ animationDelay: `${itemDelay}ms` }}
                  >
                  <div className="transaction-item-left">
                    <div
                      className="transaction-item-icon"
                      style={{
                        backgroundColor: `${category?.color || '#a78bfa'}20`,
                        color: category?.color || '#a78bfa'
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="transaction-item-info">
                      <span className="transaction-item-description">{transaction.description}</span>
                      <div className="transaction-item-meta">
                        <span className="transaction-item-category">{category?.name}</span>
                        {bucket && (
                          <>
                            <span className="transaction-item-separator">•</span>
                            <span className="transaction-item-bucket">{bucket.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="transaction-item-right">
                    <div className={`transaction-item-amount ${isExpense ? 'expense' : 'income'}`}>
                      {isExpense ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      <span>{isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="transaction-item-actions">
                      <button
                        className="transaction-action-btn"
                        onClick={() => onEdit(transaction)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        className="transaction-action-btn transaction-action-btn-danger"
                        onClick={() => onDelete(transaction)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
