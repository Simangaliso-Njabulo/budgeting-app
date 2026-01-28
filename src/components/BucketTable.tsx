// src/components/BucketTable.tsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, Edit2, MoreVertical, ArrowRightLeft, ArrowDownLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { Bucket, Category, Income } from "../types";

interface BucketTableProps {
  buckets: Bucket[];
  categories: Category[];
  income: Income;
  onDelete: (id: string) => void;
  onEdit: (bucket: Bucket) => void;
  onTransferTo?: (bucket: Bucket) => void;
  onReceiveFrom?: (bucket: Bucket) => void;
  title?: string;
  subtitle?: string;
}

type BucketStatus = "under" | "on-track" | "over";

const getStatus = (allocated: number, actual: number): BucketStatus => {
  const ratio = actual / allocated;
  if (ratio < 0.8) return "under";
  if (ratio <= 1) return "on-track";
  return "over";
};

const getStatusConfig = (status: BucketStatus) => {
  switch (status) {
    case "under":
      return { label: "Under Budget", className: "status-badge-success" };
    case "on-track":
      return { label: "On Track", className: "status-badge-info" };
    case "over":
      return { label: "Over Budget", className: "status-badge-danger" };
  }
};

const BucketTable = ({
  buckets,
  categories,
  income,
  onDelete,
  onEdit,
  onTransferTo,
  onReceiveFrom,
  title = "Budget Management",
  subtitle,
}: BucketTableProps) => {
  const { formatCurrency } = useTheme();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleMenuToggle = (bucketId: string, buttonElement: HTMLButtonElement) => {
    if (openMenuId === bucketId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = buttonElement.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 180, // 180px is min-width of dropdown
      });
      setOpenMenuId(bucketId);
    }
  };

  return (
  <div className="data-table-container">
    <div className="data-table-header">
      <div className="data-table-title-section">
        <h2 className="data-table-title">{title}</h2>
        {subtitle && <p className="data-table-subtitle">{subtitle}</p>}
      </div>
      <div className="data-table-count">
        {buckets.length} items
      </div>
    </div>

    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Allocated</th>
            <th>Spent</th>
            <th>Remaining</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => {
            const category = categories.find((c) => c.id === bucket.categoryId);
            const difference = bucket.allocated - bucket.actual;
            const status = getStatus(bucket.allocated, bucket.actual);
            const statusConfig = getStatusConfig(status);

            return (
              <tr key={bucket.id}>
                <td>
                  <div className="cell-primary">{bucket.name}</div>
                  <div className="cell-secondary">
                    {((bucket.allocated / income.amount) * 100).toFixed(1)}% of income
                  </div>
                </td>
                <td>
                  <span
                    className="category-badge"
                    style={{
                      backgroundColor: `${category?.color}20`,
                      color: category?.color,
                      border: `1px solid ${category?.color}40`
                    }}
                  >
                    {category?.name}
                  </span>
                </td>
                <td>
                  <span className="cell-amount">{formatCurrency(bucket.allocated)}</span>
                </td>
                <td>
                  <span className="cell-amount">{formatCurrency(bucket.actual)}</span>
                </td>
                <td>
                  <span className={`cell-amount ${difference >= 0 ? "text-success" : "text-danger"}`}>
                    {difference >= 0 ? "+" : "-"}{formatCurrency(Math.abs(difference))}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${statusConfig.className}`}>
                    {statusConfig.label}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onEdit(bucket)}
                      className="action-btn action-btn-edit"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(bucket.id)}
                      className="action-btn action-btn-delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {(onTransferTo || onReceiveFrom) && (
                      <div className="action-menu-container">
                        <button
                          ref={(el) => {
                            if (el) buttonRefs.current.set(bucket.id, el);
                          }}
                          onClick={(e) => handleMenuToggle(bucket.id, e.currentTarget)}
                          className="action-btn action-btn-more"
                          title="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === bucket.id && menuPosition && createPortal(
                          <div
                            ref={menuRef}
                            className="action-dropdown-portal"
                            style={{
                              position: 'fixed',
                              top: menuPosition.top,
                              left: menuPosition.left,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {onTransferTo && (
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setMenuPosition(null);
                                  onTransferTo(bucket);
                                }}
                              >
                                <ArrowRightLeft className="h-4 w-4" />
                                <span>Transfer to...</span>
                              </button>
                            )}
                            {onReceiveFrom && (
                              <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  setMenuPosition(null);
                                  onReceiveFrom(bucket);
                                }}
                              >
                                <ArrowDownLeft className="h-4 w-4" />
                                <span>Receive from...</span>
                              </button>
                            )}
                          </div>,
                          document.body
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>

    {/* Table Footer */}
    <div className="data-table-footer">
      <div className="table-pagination">
        <span className="pagination-info">Showing {buckets.length} of {buckets.length} entries</span>
      </div>
    </div>
  </div>
  );
};

export default BucketTable;
