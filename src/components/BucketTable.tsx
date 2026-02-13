// src/components/BucketTable.tsx
import { Edit2, Trash2, ArrowRightLeft, ArrowDownLeft } from "lucide-react";
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

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <div className="data-table-title-section">
          <h2 className="data-table-title">{title}</h2>
          {subtitle && <p className="data-table-subtitle">{subtitle}</p>}
        </div>
        <div className="data-table-count">{buckets.length} items</div>
      </div>

      {/* Desktop Table */}
      <div className="data-table-wrapper bucket-table-desktop">
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
                        border: `1px solid ${category?.color}40`,
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
                      {difference >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(difference))}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusConfig.className}`}>{statusConfig.label}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => onEdit(bucket)} className="action-btn action-btn-edit" title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => onDelete(bucket.id)} className="action-btn action-btn-delete" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="bucket-list-mobile">
        {buckets.map((bucket, index) => {
          const category = categories.find((c) => c.id === bucket.categoryId);
          const difference = bucket.allocated - bucket.actual;
          const status = getStatus(bucket.allocated, bucket.actual);
          const statusConfig = getStatusConfig(status);
          const pct = income.amount > 0 ? ((bucket.allocated / income.amount) * 100).toFixed(1) : "0";
          const spentPct = bucket.allocated > 0 ? Math.min((bucket.actual / bucket.allocated) * 100, 100) : 0;

          return (
            <div
              key={bucket.id}
              className="bucket-card glass-card"
              style={{ animationDelay: `${index * 60}ms` }}
              onClick={() => onEdit(bucket)}
            >
              {/* Top row: name + status */}
              <div className="bucket-card-header">
                <div className="bucket-card-name-section">
                  <span className="bucket-card-name">{bucket.name}</span>
                  <span
                    className="category-badge"
                    style={{
                      backgroundColor: `${category?.color}20`,
                      color: category?.color,
                      border: `1px solid ${category?.color}40`,
                      fontSize: "0.65rem",
                      padding: "2px 6px",
                    }}
                  >
                    {category?.name}
                  </span>
                </div>
                <span className={`status-badge ${statusConfig.className}`} style={{ fontSize: "0.65rem", padding: "2px 8px" }}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="bucket-card-progress">
                <div className="bucket-card-progress-bar">
                  <div
                    className={`bucket-card-progress-fill ${status === "over" ? "over" : status === "on-track" ? "on-track" : ""}`}
                    style={{ width: `${spentPct}%` }}
                  />
                </div>
                <span className="bucket-card-pct">{pct}% of income</span>
              </div>

              {/* Bottom row: amounts */}
              <div className="bucket-card-amounts">
                <div className="bucket-card-amount-item">
                  <span className="bucket-card-amount-label">Allocated</span>
                  <span className="bucket-card-amount-value">{formatCurrency(bucket.allocated)}</span>
                </div>
                <div className="bucket-card-amount-item">
                  <span className="bucket-card-amount-label">Spent</span>
                  <span className="bucket-card-amount-value">{formatCurrency(bucket.actual)}</span>
                </div>
                <div className="bucket-card-amount-item">
                  <span className="bucket-card-amount-label">Remaining</span>
                  <span className={`bucket-card-amount-value ${difference >= 0 ? "text-success" : "text-danger"}`}>
                    {difference >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(difference))}
                  </span>
                </div>
              </div>

              {/* Quick actions row — stop click propagation so tapping these doesn't open modal */}
              {(onTransferTo || onReceiveFrom) && (
                <div className="bucket-card-actions" onClick={(e) => e.stopPropagation()}>
                  {onTransferTo && (
                    <button className="bucket-card-action-btn" onClick={() => onTransferTo(bucket)}>
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Transfer</span>
                    </button>
                  )}
                  {onReceiveFrom && (
                    <button className="bucket-card-action-btn" onClick={() => onReceiveFrom(bucket)}>
                      <ArrowDownLeft className="h-4 w-4" />
                      <span>Receive</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Table Footer */}
      <div className="data-table-footer">
        <div className="table-pagination">
          <span className="pagination-info">
            Showing {buckets.length} of {buckets.length} entries
          </span>
        </div>
      </div>
    </div>
  );
};

export default BucketTable;
