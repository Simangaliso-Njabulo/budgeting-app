// src/components/transactions/TransactionFilters.tsx
import { Filter, Search, Plus } from 'lucide-react';
import type { Category } from '../../types';

interface TransactionFiltersProps {
  categories: Category[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onAddClick: () => void;
}

const TransactionFilters = ({
  categories,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  typeFilter,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  onAddClick,
}: TransactionFiltersProps) => {
  const activeCategories = categories.filter(c => !c.isDeleted);

  return (
    <div className="transaction-filters">
      <div className="transaction-filters-left">
        <div className="filter-icon-wrapper">
          <Filter className="h-4 w-4" />
        </div>

        {/* Cat | Type */}
        <div className="filter-dropdown">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-dropdown">
          <select
            value={typeFilter}
            onChange={(e) => onTypeChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* From | To */}
        <div className="filter-date-start">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
            className="filter-date-input"
          />
        </div>
        <div className="filter-date-end">
          <span className="filter-date-separator">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
            className="filter-date-input"
          />
        </div>

        {/* Search (aligned with From date) */}
        <div className="search-wrapper">
          <Search className="search-icon-external" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="transaction-filters-right">
        <button className="add-button" onClick={onAddClick}>
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>
    </div>
  );
};

export default TransactionFilters;
