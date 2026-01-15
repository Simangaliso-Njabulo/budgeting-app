// src/components/FilterBar.tsx
import { Filter, Search, Plus } from "lucide-react";

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
    <div className="filter-bar">
      <div className="filter-bar-left">
        <div className="filter-icon-wrapper">
          <Filter className="h-4 w-4" />
        </div>
        <span className="filter-label">Filters</span>

        {filters.map((filter) => (
          <div key={filter.id} className="filter-dropdown">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="filter-select"
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

      <div className="filter-bar-right">
        <div className="search-wrapper">
          <Search className="search-icon-external" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="search-input"
          />
        </div>

        {onAddClick && (
          <button onClick={onAddClick} className="add-button">
            <Plus className="h-4 w-4" />
            <span>{addButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
