// tests/L1-UnitTests/components/TransactionSummary.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TransactionSummary from '../../../src/components/transactions/TransactionSummary';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import { mockTransactions, createMockTransaction } from '../../fixtures';
import type { Transaction } from '../../../src/types';

// Wrapper with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('TransactionSummary', () => {
  describe('rendering', () => {
    it('renders the summary component', () => {
      renderWithTheme(<TransactionSummary transactions={[]} />);
      expect(document.querySelector('.transaction-summary')).toBeInTheDocument();
    });

    it('displays default period "This Month"', () => {
      renderWithTheme(<TransactionSummary transactions={[]} />);
      expect(screen.getByText('Summary: This Month')).toBeInTheDocument();
    });

    it('displays custom period when provided', () => {
      renderWithTheme(<TransactionSummary transactions={[]} period="Last Week" />);
      expect(screen.getByText('Summary: Last Week')).toBeInTheDocument();
    });

    it('displays Income, Expenses, and Net labels', () => {
      renderWithTheme(<TransactionSummary transactions={[]} />);
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Net')).toBeInTheDocument();
    });
  });

  describe('calculations', () => {
    it('calculates total income correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction({ type: 'income', amount: 1000 }),
        createMockTransaction({ type: 'income', amount: 500 }),
        createMockTransaction({ type: 'expense', amount: 100 }),
      ];

      renderWithTheme(<TransactionSummary transactions={transactions} />);
      // Should show income value (format may vary by locale)
      const incomeValue = document.querySelector('.transaction-summary-value.income');
      expect(incomeValue?.textContent).toMatch(/\$1[,\s]?500/);
    });

    it('calculates total expenses correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction({ type: 'expense', amount: 100 }),
        createMockTransaction({ type: 'expense', amount: 50 }),
        createMockTransaction({ type: 'income', amount: 1000 }),
      ];

      renderWithTheme(<TransactionSummary transactions={transactions} />);
      // Should show expense value
      const expenseValue = document.querySelector('.transaction-summary-value.expense');
      expect(expenseValue?.textContent).toMatch(/\$150/);
    });

    it('calculates positive net amount correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction({ type: 'income', amount: 1000 }),
        createMockTransaction({ type: 'expense', amount: 400 }),
      ];

      renderWithTheme(<TransactionSummary transactions={transactions} />);
      // Net = 1000 - 400 = 600
      const netValue = document.querySelector('.transaction-summary-value.positive');
      expect(netValue?.textContent).toMatch(/\+\$600/);
    });

    it('calculates negative net amount correctly', () => {
      const transactions: Transaction[] = [
        createMockTransaction({ type: 'income', amount: 200 }),
        createMockTransaction({ type: 'expense', amount: 500 }),
      ];

      renderWithTheme(<TransactionSummary transactions={transactions} />);
      // Net = 200 - 500 = -300
      // The component shows negative without +
      const netValue = document.querySelector('.transaction-summary-value.negative');
      expect(netValue).toBeInTheDocument();
    });

    it('shows zero values when no transactions', () => {
      renderWithTheme(<TransactionSummary transactions={[]} />);
      // All monetary values should show 0
      const incomeValue = document.querySelector('.transaction-summary-value.income');
      const expenseValue = document.querySelector('.transaction-summary-value.expense');
      expect(incomeValue?.textContent).toMatch(/\$0/);
      expect(expenseValue?.textContent).toMatch(/\$0/);
    });
  });

  describe('styling classes', () => {
    it('applies positive class for positive net amount', () => {
      const transactions: Transaction[] = [
        createMockTransaction({ type: 'income', amount: 1000 }),
        createMockTransaction({ type: 'expense', amount: 100 }),
      ];

      renderWithTheme(<TransactionSummary transactions={transactions} />);
      expect(document.querySelector('.transaction-summary-value.positive')).toBeInTheDocument();
      expect(document.querySelector('.transaction-summary-icon.positive')).toBeInTheDocument();
    });

    it('applies negative class for negative net amount', () => {
      const transactions: Transaction[] = [
        createMockTransaction({ type: 'income', amount: 100 }),
        createMockTransaction({ type: 'expense', amount: 500 }),
      ];

      renderWithTheme(<TransactionSummary transactions={transactions} />);
      expect(document.querySelector('.transaction-summary-value.negative')).toBeInTheDocument();
      expect(document.querySelector('.transaction-summary-icon.negative')).toBeInTheDocument();
    });

    it('applies income class to income value', () => {
      renderWithTheme(<TransactionSummary transactions={mockTransactions} />);
      expect(document.querySelector('.transaction-summary-value.income')).toBeInTheDocument();
      expect(document.querySelector('.transaction-summary-icon.income')).toBeInTheDocument();
    });

    it('applies expense class to expense value', () => {
      renderWithTheme(<TransactionSummary transactions={mockTransactions} />);
      expect(document.querySelector('.transaction-summary-value.expense')).toBeInTheDocument();
      expect(document.querySelector('.transaction-summary-icon.expense')).toBeInTheDocument();
    });
  });

  describe('with mock data', () => {
    it('correctly processes mock transactions', () => {
      renderWithTheme(<TransactionSummary transactions={mockTransactions} />);

      // Verify the summary displays
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Net')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty array without errors', () => {
      expect(() => {
        renderWithTheme(<TransactionSummary transactions={[]} />);
      }).not.toThrow();
    });

    it('handles single income transaction', () => {
      const transactions = [createMockTransaction({ type: 'income', amount: 500 })];
      renderWithTheme(<TransactionSummary transactions={transactions} />);
      const incomeValue = document.querySelector('.transaction-summary-value.income');
      expect(incomeValue?.textContent).toMatch(/\$500/);
    });

    it('handles single expense transaction', () => {
      const transactions = [createMockTransaction({ type: 'expense', amount: 50 })];
      renderWithTheme(<TransactionSummary transactions={transactions} />);
      const expenseValue = document.querySelector('.transaction-summary-value.expense');
      expect(expenseValue?.textContent).toMatch(/\$50/);
    });

    it('treats zero net as positive', () => {
      const transactions: Transaction[] = [
        createMockTransaction({ type: 'income', amount: 100 }),
        createMockTransaction({ type: 'expense', amount: 100 }),
      ];

      renderWithTheme(<TransactionSummary transactions={transactions} />);
      // Zero is considered positive (isPositive = netAmount >= 0)
      expect(document.querySelector('.transaction-summary-value.positive')).toBeInTheDocument();
    });
  });
});
