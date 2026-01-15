// src/components/BucketForm.tsx
import { Plus } from "lucide-react";
import type { Category } from "../types";

interface BucketFormProps {
  newBucket: {
    name: string;
    allocated: number;
    categoryId: string;
  };
  setNewBucket: (bucket: {
    name: string;
    allocated: number;
    categoryId: string;
  }) => void;
  categories: Category[];
  onAdd: () => void;
  darkMode?: boolean;
}

const BucketForm = ({
  newBucket,
  setNewBucket,
  categories,
  onAdd,
}: BucketFormProps) => (
  <div className="form-card">
    <h2 className="form-title">Add New Bucket</h2>
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Bucket Name</label>
        <input
          type="text"
          placeholder="e.g., Groceries"
          value={newBucket.name}
          onChange={(e) => setNewBucket({ ...newBucket, name: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Allocated Amount</label>
        <input
          type="number"
          placeholder="0.00"
          value={newBucket.allocated || ""}
          onChange={(e) =>
            setNewBucket({ ...newBucket, allocated: Number(e.target.value) })
          }
        />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          value={newBucket.categoryId}
          onChange={(e) =>
            setNewBucket({ ...newBucket, categoryId: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">&nbsp;</label>
        <button onClick={onAdd} className="form-button">
          <Plus className="h-5 w-5" />
          <span>Add Bucket</span>
        </button>
      </div>
    </div>
  </div>
);

export default BucketForm;
