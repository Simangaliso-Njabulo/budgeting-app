// src/components/transactions/TransactionSummary.tsx
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Transaction } from '../../types';

interface TransactionSummaryProps {
  transactions: Transaction[];
  monthlyIncome?: number;
  period?: string;
}

const TransactionSummary = ({ transactions, monthlyIncome, period = 'This Month' }: TransactionSummaryProps) => {
  const { formatCurrency } = useTheme();

  const transactionIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = (monthlyIncome ?? 0) + transactionIncome;

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;
  const isPositive = netAmount >= 0;

  return (
    <div className="transaction-summary glass-card">
      <div className="transaction-summary-header">
        <span className="transaction-summary-title">Summary: {period}</span>
      </div>
      <div className="transaction-summary-content">
        <div className="transaction-summary-item">
          <div className="transaction-summary-icon income">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div className="transaction-summary-info">
            <span className="transaction-summary-label">Income</span>
            <span className="transaction-summary-value income">{formatCurrency(totalIncome)}</span>
          </div>
        </div>
        <div className="transaction-summary-divider" />
        <div className="transaction-summary-item">
          <div className="transaction-summary-icon expense">
            <ArrowDownRight className="h-4 w-4" />
          </div>
          <div className="transaction-summary-info">
            <span className="transaction-summary-label">Expenses</span>
            <span className="transaction-summary-value expense">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
        <div className="transaction-summary-divider" />
        <div className="transaction-summary-item">
          <div className={`transaction-summary-icon ${isPositive ? 'positive' : 'negative'}`}>
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="transaction-summary-info">
            <span className="transaction-summary-label">Net</span>
            <span className={`transaction-summary-value ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{formatCurrency(netAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;
