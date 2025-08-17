// src/components/BucketForm.tsx
import { Plus } from "lucide-react";
import ActionButton from "./ActionButton";
import type { Category } from "../types";

interface BucketFormProps {
  newBucket: {
    name: string;
    allocated: number;
    categoryId: string;
  };
  setNewBucket: (bucket: any) => void;
  categories: Category[];
  onAdd: () => void;
  darkMode: boolean;
}

const BucketForm = ({
  newBucket,
  setNewBucket,
  categories,
  onAdd,
  darkMode,
}: BucketFormProps) => {
  return (
    <div
      className={`rounded-2xl p-8 shadow-2xl transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
          : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
      }`}
    >
      <h2
        className={`text-xl font-bold mb-6 ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Add New Bucket
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Bucket Name"
          value={newBucket.name}
          onChange={(e) => setNewBucket({ ...newBucket, name: e.target.value })}
          className={`px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-opacity-50 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        <input
          type="number"
          placeholder="Allocated Amount"
          value={newBucket.allocated || ""}
          onChange={(e) =>
            setNewBucket({
              ...newBucket,
              allocated: parseFloat(e.target.value) || 0,
            })
          }
          className={`px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-opacity-50 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        <select
          value={newBucket.categoryId}
          onChange={(e) =>
            setNewBucket({ ...newBucket, categoryId: e.target.value })
          }
          className={`px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-opacity-50 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
              : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
          }`}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <ActionButton
          onClick={onAdd}
          variant="primary"
          size="md"
          darkMode={darkMode}
          className="w-full justify-center flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Bucket
        </ActionButton>
      </div>
    </div>
  );
};

export default BucketForm;
