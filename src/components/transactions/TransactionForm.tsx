// src/components/transactions/TransactionForm.tsx
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Transaction, Bucket, NewTransactionForm } from '../../types';

interface TransactionFormProps {
  transaction?: Transaction;
  buckets: Bucket[];
  onSave: (data: NewTransactionForm) => void;
  onCancel: () => void;
}

const TransactionForm = ({ transaction, buckets, onSave, onCancel }: TransactionFormProps) => {
  const { formatCurrency, currency } = useTheme();
  const [form, setForm] = useState<NewTransactionForm>({
    description: '',
    amount: 0,
    type: 'expense',
    categoryId: '',
    bucketId: undefined,
    date: new Date(),
    notes: '',
  });
  const [amountDisplay, setAmountDisplay] = useState('');

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.categoryId,
        bucketId: transaction.bucketId,
        date: new Date(transaction.date),
        notes: transaction.notes || '',
      });
      setAmountDisplay(transaction.amount.toString());
    }
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Category comes from the selected bucket
    const categoryId = form.bucketId ? buckets.find(b => b.id === form.bucketId)?.categoryId : '';
    if (form.description.trim() && form.amount > 0 && form.bucketId) {
      onSave({ ...form, categoryId: categoryId || '' });
    }
  };

  // Handle bucket selection - auto-fill category from bucket
  const handleBucketChange = (bucketId: string) => {
    if (bucketId) {
      const bucket = buckets.find(b => b.id === bucketId);
      setForm({
        ...form,
        bucketId,
        categoryId: bucket?.categoryId || form.categoryId,
      });
    } else {
      setForm({ ...form, bucketId: undefined });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmountDisplay(value);
    setForm({ ...form, amount: parseFloat(value) || 0 });
  };

  const handleAmountBlur = () => {
    if (form.amount > 0) {
      setAmountDisplay(form.amount.toLocaleString());
    }
  };

  const handleAmountFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setAmountDisplay(form.amount > 0 ? form.amount.toString() : '');
    e.target.select();
  };

  // All buckets available for both expense and income
  const availableBuckets = buckets;

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      {/* Type Toggle */}
      <div className="transaction-type-toggle">
        <button
          type="button"
          className={`transaction-type-btn ${form.type === 'expense' ? 'active expense' : ''}`}
          onClick={() => setForm({ ...form, type: 'expense', categoryId: '', bucketId: undefined })}
        >
          Expense
        </button>
        <button
          type="button"
          className={`transaction-type-btn ${form.type === 'income' ? 'active income' : ''}`}
          onClick={() => setForm({ ...form, type: 'income', categoryId: '', bucketId: undefined })}
        >
          Income
        </button>
      </div>

      {/* Amount Input - Large and prominent */}
      <div className="form-group transaction-amount-group">
        <div className="transaction-amount-input-wrapper">
          <span className="transaction-currency-symbol">{currency.symbol}</span>
          <input
            type="text"
            className="transaction-amount-input"
            value={amountDisplay}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            onFocus={handleAmountFocus}
            placeholder="0.00"
            autoFocus
          />
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          type="text"
          className="form-input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g., Coffee at Starbucks"
        />
      </div>

      {/* Bucket Selection - For both expense and income */}
      <div className="form-group">
        <label className="form-label">
          {form.type === 'expense' ? 'Take from bucket' : 'Add to bucket'}
        </label>
        <select
          className="form-select"
          value={form.bucketId || ''}
          onChange={(e) => handleBucketChange(e.target.value)}
          required
        >
          <option value="">Select bucket...</option>
          {availableBuckets.map((bucket) => {
            const remaining = bucket.allocated - bucket.actual;
            return (
              <option key={bucket.id} value={bucket.id}>
                {bucket.name} ({formatCurrency(remaining)} {remaining >= 0 ? 'left' : 'over'})
              </option>
            );
          })}
        </select>
      </div>

      {/* Date */}
      <div className="form-group">
        <label className="form-label">Date</label>
        <div className="date-input-wrapper">
          <Calendar className="date-input-icon" />
          <input
            type="date"
            className="form-input date-input"
            value={form.date.toISOString().split('T')[0]}
            onChange={(e) => setForm({ ...form, date: new Date(e.target.value) })}
          />
        </div>
        <div className="date-quick-options">
          {[
            { label: 'Today', days: 0 },
            { label: 'Yesterday', days: 1 },
            { label: '2 days ago', days: 2 },
            { label: '3 days ago', days: 3 },
          ].map(({ label, days }) => {
            const d = new Date();
            d.setDate(d.getDate() - days);
            const isSelected = form.date.toISOString().split('T')[0] === d.toISOString().split('T')[0];
            return (
              <button
                key={days}
                type="button"
                className={`date-quick-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setForm({ ...form, date: d })}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!form.description.trim() || form.amount <= 0 || !form.bucketId}
        >
          {transaction ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
