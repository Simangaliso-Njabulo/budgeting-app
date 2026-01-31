// src/components/FilterBar.tsx
import { Filter, Search, Plus } from "lucide-react";
import styles from './FilterBar.module.css';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterBarProps {
  filters?: {
    id: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onAddClick?: () => void;
  addButtonText?: string;
}

const FilterBar = ({
  filters = [],
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  onAddClick,
  addButtonText = "Add New",
}: FilterBarProps) => {
  return (
    <div className={styles.filterBar}>
      <div className={styles.filterBarLeft}>
        <div className={styles.filterIconWrapper}>
          <Filter className="h-4 w-4" />
        </div>
        <span className={styles.filterLabel}>Filters</span>

        {filters.map((filter) => (
          <div key={filter.id} className={styles.filterDropdown}>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className={styles.filterBarRight}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIconExternal} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {onAddClick && (
          <button onClick={onAddClick} className={styles.addButton}>
            <Plus className="h-4 w-4" />
            <span>{addButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
