// src/components/transactions/TransactionForm.tsx
import { useState, useEffect } from 'react';
import { Calendar, Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Transaction, Category, Bucket, NewTransactionForm } from '../../types';

interface TransactionFormProps {
  transaction?: Transaction;
  categories: Category[];
  buckets: Bucket[];
  onSave: (data: NewTransactionForm) => void;
  onCancel: () => void;
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

const TransactionForm = ({ transaction, categories, buckets, onSave, onCancel }: TransactionFormProps) => {
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
    if (form.description.trim() && form.amount > 0 && form.categoryId) {
      onSave(form);
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

  // Filter categories by type
  const filteredCategories = categories.filter(c =>
    !c.isDeleted && (c.type === form.type || c.type === 'both')
  );

  // Filter buckets by selected category
  const filteredBuckets = form.categoryId
    ? buckets.filter(b => b.categoryId === form.categoryId)
    : [];

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

      {/* Category Selection - Visual picker */}
      <div className="form-group">
        <label className="form-label">Category</label>
        <div className="category-picker">
          {filteredCategories.map((category) => {
            const Icon = ICON_MAP[category.icon || 'home'] || Home;
            return (
              <button
                key={category.id}
                type="button"
                className={`category-picker-item ${form.categoryId === category.id ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, categoryId: category.id, bucketId: undefined })}
                style={form.categoryId === category.id ? {
                  borderColor: category.color,
                  backgroundColor: `${category.color}15`
                } : {}}
              >
                <div
                  className="category-picker-icon"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="category-picker-label">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bucket Selection (Optional) */}
      {filteredBuckets.length > 0 && (
        <div className="form-group">
          <label className="form-label">Bucket (Optional)</label>
          <select
            className="form-select"
            value={form.bucketId || ''}
            onChange={(e) => setForm({ ...form, bucketId: e.target.value || undefined })}
          >
            <option value="">Select bucket...</option>
            {filteredBuckets.map((bucket) => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.name} ({formatCurrency(bucket.allocated - bucket.actual)} remaining)
              </option>
            ))}
          </select>
        </div>
      )}

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
      </div>

      {/* Notes (Optional) */}
      <div className="form-group">
        <label className="form-label">Notes (Optional)</label>
        <textarea
          className="form-textarea"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Add any additional notes..."
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!form.description.trim() || form.amount <= 0 || !form.categoryId}
        >
          {transaction ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
