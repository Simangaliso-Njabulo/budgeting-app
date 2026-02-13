// src/components/categories/CategoryForm.tsx
import { useState, useEffect } from 'react';
import { Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign } from 'lucide-react';
import type { Category, NewCategoryForm } from '../../types';

interface CategoryFormProps {
  category?: Category;
  onSave: (data: NewCategoryForm) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const ICONS = [
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'shopping', icon: ShoppingBag, label: 'Shopping' },
  { name: 'car', icon: Car, label: 'Transport' },
  { name: 'food', icon: Utensils, label: 'Food' },
  { name: 'entertainment', icon: Film, label: 'Entertainment' },
  { name: 'work', icon: Briefcase, label: 'Work' },
  { name: 'health', icon: Heart, label: 'Health' },
  { name: 'gift', icon: Gift, label: 'Gifts' },
  { name: 'travel', icon: Plane, label: 'Travel' },
  { name: 'tech', icon: Smartphone, label: 'Tech' },
  { name: 'utilities', icon: Zap, label: 'Utilities' },
  { name: 'income', icon: DollarSign, label: 'Income' },
];

const COLORS = [
  '#a78bfa', '#8b5cf6', '#7c3aed', // Purples
  '#6ee7b7', '#34d399', '#10b981', // Greens
  '#7dd3fc', '#38bdf8', '#0ea5e9', // Blues
  '#fdba74', '#fb923c', '#f97316', // Oranges
  '#fca5a5', '#f87171', '#ef4444', // Reds
  '#67e8f9', '#22d3ee', '#06b6d4', // Cyans
];

const CategoryForm = ({ category, onSave, onCancel, onDelete }: CategoryFormProps) => {
  const [form, setForm] = useState<NewCategoryForm>({
    name: '',
    color: COLORS[0],
    icon: 'home',
    type: 'expense',
  });

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        color: category.color,
        icon: category.icon || 'home',
        type: category.type || 'expense',
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) {
      onSave(form);
    }
  };

  return (
    <form className="category-form" onSubmit={handleSubmit}>
      {/* Name Input */}
      <div className="form-group">
        <label className="form-label">Category Name</label>
        <input
          type="text"
          className="form-input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Food & Dining"
          autoFocus
        />
      </div>

      {/* Type Selection */}
      <div className="form-group">
        <label className="form-label">Type</label>
        <div className="type-toggle-group">
          <button
            type="button"
            className={`type-toggle-btn ${form.type === 'expense' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, type: 'expense' })}
          >
            Expense
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${form.type === 'income' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, type: 'income' })}
          >
            Income
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${form.type === 'both' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, type: 'both' })}
          >
            Both
          </button>
        </div>
      </div>

      {/* Icon Selection */}
      <div className="form-group">
        <label className="form-label">Icon</label>
        <div className="icon-grid">
          {ICONS.map(({ name, icon: Icon, label }) => (
            <button
              key={name}
              type="button"
              className={`icon-option ${form.icon === name ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, icon: name })}
              title={label}
              style={form.icon === name ? { borderColor: form.color, background: `${form.color}20` } : {}}
            >
              <Icon className="h-5 w-5" style={form.icon === name ? { color: form.color } : {}} />
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="form-group">
        <label className="form-label">Color</label>
        <div className="color-grid">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-option ${form.color === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setForm({ ...form, color })}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="form-group">
        <label className="form-label">Preview</label>
        <div className="category-preview" style={{ borderColor: `${form.color}40` }}>
          <div className="category-preview-icon" style={{ backgroundColor: `${form.color}20`, color: form.color }}>
            {(() => {
              const IconComponent = ICONS.find(i => i.name === form.icon)?.icon || Home;
              return <IconComponent className="h-6 w-6" />;
            })()}
          </div>
          <div className="category-preview-info">
            <span className="category-preview-name">{form.name || 'Category Name'}</span>
            <span className="category-preview-type">{form.type}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={!form.name.trim()}>
          {category ? 'Update Category' : 'Create Category'}
        </button>
      </div>

      {/* Delete button (shown only when editing) */}
      {category && onDelete && (
        <div className="form-delete-section">
          <button
            type="button"
            className="btn btn-danger btn-delete-transaction"
            onClick={onDelete}
          >
            Delete Category
          </button>
        </div>
      )}
    </form>
  );
};

export default CategoryForm;
export { ICONS };
