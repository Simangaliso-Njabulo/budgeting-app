// src/components/categories/CategoryGrid.tsx
import { Edit2, Trash2, Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Category, Bucket } from '../../types';

interface CategoryGridProps {
  categories: Category[];
  buckets: Bucket[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
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

const CategoryGrid = ({ categories, buckets, onEdit, onDelete }: CategoryGridProps) => {
  const { formatCurrency } = useTheme();

  const getCategoryStats = (categoryId: string) => {
    const categoryBuckets = buckets.filter(b => b.categoryId === categoryId);
    const totalAllocated = categoryBuckets.reduce((sum, b) => sum + b.allocated, 0);
    const totalSpent = categoryBuckets.reduce((sum, b) => sum + b.actual, 0);
    return { bucketCount: categoryBuckets.length, totalAllocated, totalSpent };
  };

  // Filter out deleted categories
  const activeCategories = categories.filter(c => !c.isDeleted);

  return (
    <div className="category-grid">
      {activeCategories.map((category) => {
        const Icon = ICON_MAP[category.icon || 'home'] || Home;
        const stats = getCategoryStats(category.id);
        const progressPercent = stats.totalAllocated > 0
          ? Math.min((stats.totalSpent / stats.totalAllocated) * 100, 100)
          : 0;

        return (
          <div key={category.id} className="category-card glass-card">
            <div className="category-card-header">
              <div
                className="category-card-icon"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="category-card-actions">
                <button
                  className="category-action-btn"
                  onClick={() => onEdit(category)}
                  title="Edit category"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  className="category-action-btn category-action-btn-danger"
                  onClick={() => onDelete(category)}
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="category-card-name">{category.name}</h3>
            <span className="category-card-type" style={{ color: category.color }}>
              {category.type || 'expense'}
            </span>

            {/* Progress Bar */}
            <div className="category-card-progress">
              <div className="category-progress-bar">
                <div
                  className="category-progress-fill"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
              <div className="category-progress-info">
                <span className="category-progress-spent">{formatCurrency(stats.totalSpent)}</span>
                <span className="category-progress-allocated">/ {formatCurrency(stats.totalAllocated)}</span>
              </div>
            </div>

            <div className="category-card-footer">
              <span className="category-bucket-count">{stats.bucketCount} bucket{stats.bucketCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
