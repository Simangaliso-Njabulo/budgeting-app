// src/components/categories/CategoryGrid.tsx
import { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Category, Bucket } from '../../types';

// Hook for animated counting
const useCountUp = (end: number, duration: number = 1000, delay: number = 300) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        countRef.current = Math.floor(eased * end);
        setCount(countRef.current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      startTimeRef.current = null;
    };
  }, [end, duration, delay]);

  return count;
};

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

// Individual category card component with animations
interface CategoryCardProps {
  category: Category;
  stats: { bucketCount: number; totalAllocated: number; totalSpent: number };
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryCard = ({ category, stats, onEdit, onDelete }: CategoryCardProps) => {
  const { formatCurrency, currency } = useTheme();
  const Icon = ICON_MAP[category.icon || 'home'] || Home;

  const progressPercent = stats.totalAllocated > 0
    ? Math.min((stats.totalSpent / stats.totalAllocated) * 100, 100)
    : 0;

  // Animated values
  const animatedSpent = useCountUp(stats.totalSpent, 1000, 400);
  const animatedAllocated = useCountUp(stats.totalAllocated, 1000, 400);
  const animatedProgress = useCountUp(Math.round(progressPercent), 1000, 400);

  return (
    <div className="category-card glass-card">
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
              width: `${animatedProgress}%`,
              backgroundColor: category.color
            }}
          />
        </div>
        <div className="category-progress-info">
          <span className="category-progress-spent">{currency.symbol}{animatedSpent.toLocaleString()}</span>
          <span className="category-progress-allocated">/ {formatCurrency(animatedAllocated)}</span>
        </div>
      </div>

      <div className="category-card-footer">
        <span className="category-bucket-count">{stats.bucketCount} bucket{stats.bucketCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
};

const CategoryGrid = ({ categories, buckets, onEdit, onDelete }: CategoryGridProps) => {
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
      {activeCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          stats={getCategoryStats(category.id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CategoryGrid;
