// src/components/transactions/TransactionList.tsx
import { memo, useMemo, useCallback } from 'react';
import { Home, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ICON_MAP } from '../../utils/iconMap';
import type { Transaction, Category, Bucket } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  buckets: Bucket[];
  monthlyIncome?: number;
  selectedPeriod?: { year: number; month: number };
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const TransactionList = memo(({ transactions, categories, buckets, monthlyIncome, selectedPeriod, onEdit, onDelete }: TransactionListProps) => {
  const { formatCurrency } = useTheme();

  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }, []);

  const balanceMap = useMemo(() => {
    const map = new Map<string, number>();
    if (monthlyIncome === undefined || !selectedPeriod) return map;
    
    const periodTxs = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === selectedPeriod.year && d.getMonth() + 1 === selectedPeriod.month;
    });
    const chronological = [...periodTxs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt.getTime() - b.createdAt.getTime()
    );
    let balance = monthlyIncome;
    for (const tx of chronological) {
      if (tx.type === 'expense') {
        balance -= tx.amount;
      } else {
        balance += tx.amount;
      }
      map.set(tx.id, Math.round(balance * 100) / 100);
    }
    return map;
  }, [transactions, monthlyIncome, selectedPeriod]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((transaction) => {
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
    });
    return groups;
  }, [transactions]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedTransactions).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedTransactions]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  const bucketMap = useMemo(() => {
    const map = new Map<string, Bucket>();
    buckets.forEach(b => map.set(b.id, b));
    return map;
  }, [buckets]);

  const handleEdit = useCallback((transaction: Transaction) => onEdit(transaction), [onEdit]);
  const handleDelete = useCallback((e: React.MouseEvent, transaction: Transaction) => {
    e.stopPropagation();
    onDelete(transaction);
  }, [onDelete]);

  const formatDateLabel = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dateStr;
  }, [today, yesterday]);

  let cumulativeIndex = 0;

  return (
    <div className="transaction-list">
      {sortedDates.map((date, groupIndex) => {
        const groupStartIndex = cumulativeIndex;
        cumulativeIndex += groupedTransactions[date].length;
        const sortedGroupTxs = [...groupedTransactions[date]].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.getTime() - a.createdAt.getTime()
        );

        return (
          <div
            key={date}
            className="transaction-group"
            style={{ animationDelay: `${groupIndex * 100}ms` }}
          >
            <div className="transaction-group-header">
              <span className="transaction-group-date">{formatDateLabel(date)}</span>
              <span className="transaction-group-count">
                {groupedTransactions[date].length} transaction{groupedTransactions[date].length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="transaction-group-items">
              {sortedGroupTxs.map((transaction, index) => {
                const category = transaction.categoryId ? categoryMap.get(transaction.categoryId) : undefined;
                const bucket = transaction.bucketId ? bucketMap.get(transaction.bucketId) : undefined;
                const isExpense = transaction.type === 'expense';
                const Icon = ICON_MAP[category?.icon || 'home'] || Home;
                const balance = balanceMap.get(transaction.id);
                const itemDelay = (groupStartIndex + index) * 40;

                return (
                  <div
                    key={transaction.id}
                    className="transaction-item glass-card"
                    style={{ animationDelay: `${itemDelay}ms`, cursor: 'pointer' }}
                    onClick={() => handleEdit(transaction)}
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
                          {isExpense ? (
                            <span className="transaction-item-bucket">{bucket?.name || 'No bucket'}</span>
                          ) : (
                            <span className="transaction-item-category">{category?.name || 'Income'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="transaction-item-right">
                      <div className="transaction-item-amounts">
                        <div className={`transaction-item-amount ${isExpense ? 'expense' : 'income'}`}>
                          {isExpense ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          <span>{isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}</span>
                        </div>
                        {balance !== undefined && (
                          <span className={`transaction-item-balance ${balance < 0 ? 'negative' : ''}`}>
                            Bal: {formatCurrency(balance)}
                          </span>
                        )}
                      </div>
                      <button
                        className="transaction-item-delete"
                        onClick={(e) => handleDelete(e, transaction)}
                        aria-label={`Delete ${transaction.description}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
});

TransactionList.displayName = 'TransactionList';

export default TransactionList;
