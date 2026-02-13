// src/components/transactions/TransactionList.tsx
import { Home, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

const TransactionList = ({ transactions, categories, buckets, monthlyIncome, selectedPeriod, onEdit }: TransactionListProps) => {
  const { formatCurrency } = useTheme();

  // Compute running balance only for the selected period's transactions
  const balanceMap = new Map<string, number>();
  if (monthlyIncome !== undefined && selectedPeriod) {
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
      balanceMap.set(tx.id, Math.round(balance * 100) / 100);
    }
  }

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

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Sort transactions within each group (newest first)
  for (const date of sortedDates) {
    groupedTransactions[date].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return dateStr;
  };

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
              <span className="transaction-group-count">
                {groupedTransactions[date].length} transaction{groupedTransactions[date].length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="transaction-group-items">
              {groupedTransactions[date].map((transaction, index) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const bucket = buckets.find(b => b.id === transaction.bucketId);
                const isExpense = transaction.type === 'expense';
                const Icon = ICON_MAP[category?.icon || 'home'] || Home;
                const balance = balanceMap.get(transaction.id);
                const itemDelay = (groupStartIndex + index) * 60 + groupIndex * 150;

                return (
                  <div
                    key={transaction.id}
                    className="transaction-item glass-card"
                    style={{ animationDelay: `${itemDelay}ms`, cursor: 'pointer' }}
                    onClick={() => onEdit(transaction)}
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
