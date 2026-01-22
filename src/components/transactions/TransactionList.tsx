// src/components/transactions/TransactionList.tsx
import { useState, useRef, useEffect, useCallback } from 'react';
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

// Swipeable transaction item component for mobile
interface SwipeableItemProps {
  transaction: Transaction;
  category: Category | undefined;
  bucket: Bucket | undefined;
  isExpense: boolean;
  formatCurrency: (amount: number) => string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  itemDelay: number;
}

const SwipeableTransactionItem = ({
  transaction,
  category,
  bucket,
  isExpense,
  formatCurrency,
  onEdit,
  onDelete,
  itemDelay
}: SwipeableItemProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const swipeOffsetRef = useRef(0);
  const isSwipeOpenRef = useRef(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const Icon = ICON_MAP[category?.icon || 'home'] || Home;
  const ACTION_WIDTH = 120;

  // Keep refs in sync with state
  useEffect(() => {
    swipeOffsetRef.current = swipeOffset;
  }, [swipeOffset]);

  useEffect(() => {
    isSwipeOpenRef.current = isSwipeOpen;
  }, [isSwipeOpen]);

  const handleClose = useCallback(() => {
    setSwipeOffset(0);
    setIsSwipeOpen(false);
  }, []);

  const handleEdit = useCallback(() => {
    handleClose();
    onEdit(transaction);
  }, [handleClose, onEdit, transaction]);

  const handleDelete = useCallback(() => {
    handleClose();
    onDelete(transaction);
  }, [handleClose, onDelete, transaction]);

  // Handle swipe - works with both touch and mouse (for testing)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    let isDragging = false;

    // Touch events
    const handleTouchStart = (e: TouchEvent) => {
      startXRef.current = e.touches[0].clientX;
      startYRef.current = e.touches[0].clientY;
      isHorizontalSwipe.current = null;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      handleMove(currentX, currentY, e);
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      handleEnd();
    };

    // Mouse events (for desktop/browser testing)
    const handleMouseDown = (e: MouseEvent) => {
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      isHorizontalSwipe.current = null;
      isDragging = true;
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      handleEnd();
    };

    const handleMouseLeave = () => {
      if (!isDragging) return;
      isDragging = false;
      handleEnd();
    };

    // Shared move logic
    const handleMove = (currentX: number, currentY: number, e?: TouchEvent) => {
      const diffX = startXRef.current - currentX;
      const diffY = startYRef.current - currentY;

      // Determine swipe direction on first significant movement
      if (isHorizontalSwipe.current === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
        isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
      }

      // Only handle horizontal swipes
      if (isHorizontalSwipe.current !== true) return;

      // Prevent page scrolling when swiping horizontally
      if (e) e.preventDefault();

      const isOpen = isSwipeOpenRef.current;

      // Swiping left (positive diff) - open actions
      if (diffX > 0 && !isOpen) {
        const newOffset = Math.min(diffX, ACTION_WIDTH);
        setSwipeOffset(newOffset);
      }
      // Swiping right (negative diff) - close actions
      else if (diffX < 0 && isOpen) {
        const newOffset = Math.max(ACTION_WIDTH + diffX, 0);
        setSwipeOffset(newOffset);
      }
      // Already open and swiping left more - resist
      else if (diffX > 0 && isOpen) {
        const newOffset = Math.min(ACTION_WIDTH + (diffX * 0.2), ACTION_WIDTH + 20);
        setSwipeOffset(newOffset);
      }
    };

    // Shared end logic
    const handleEnd = () => {
      if (isHorizontalSwipe.current !== true) {
        isHorizontalSwipe.current = null;
        return;
      }

      const currentOffset = swipeOffsetRef.current;

      // Snap to open or closed position
      if (currentOffset > ACTION_WIDTH / 2) {
        setSwipeOffset(ACTION_WIDTH);
        setIsSwipeOpen(true);
      } else {
        setSwipeOffset(0);
        setIsSwipeOpen(false);
      }

      isHorizontalSwipe.current = null;
    };

    // Add touch listeners
    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Add mouse listeners for desktop testing
    card.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
      card.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="transaction-item-swipe-container"
      style={{ animationDelay: `${itemDelay}ms` }}
    >
      {/* Background actions revealed on swipe */}
      <div className="transaction-item-swipe-actions">
        <button
          className="swipe-action-btn swipe-action-edit"
          onClick={handleEdit}
        >
          <Edit2 className="h-5 w-5" />
          <span>Edit</span>
        </button>
        <button
          className="swipe-action-btn swipe-action-delete"
          onClick={handleDelete}
        >
          <Trash2 className="h-5 w-5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Main transaction card */}
      <div
        ref={cardRef}
        className="transaction-item glass-card transaction-item-swipeable"
        style={{ transform: `translateX(-${swipeOffset}px)` }}
        onClick={isSwipeOpen ? handleClose : undefined}
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
          {/* Desktop-only action buttons */}
          <div className="transaction-item-actions transaction-item-actions-desktop">
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
    </div>
  );
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
                const isExpense = transaction.type === 'expense';
                const itemDelay = (groupStartIndex + index) * 60 + groupIndex * 150;

                return (
                  <SwipeableTransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    category={category}
                    bucket={bucket}
                    isExpense={isExpense}
                    formatCurrency={formatCurrency}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    itemDelay={itemDelay}
                  />
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
