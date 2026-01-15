// src/components/BucketTable.tsx
import { Trash2, Edit2, MoreVertical } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { Bucket, Category, Income } from "../types";

interface BucketTableProps {
  buckets: Bucket[];
  categories: Category[];
  income: Income;
  onDelete: (id: string) => void;
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
  title = "Budget Management",
  subtitle,
}: BucketTableProps) => {
  const { formatCurrency } = useTheme();

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
                    <button className="action-btn action-btn-edit" title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(bucket.id)}
                      className="action-btn action-btn-delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="action-btn action-btn-more" title="More">
                      <MoreVertical className="h-4 w-4" />
                    </button>
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
