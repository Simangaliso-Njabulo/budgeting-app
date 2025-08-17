// src/components/BucketForm.tsx
import { PlusCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

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
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Add New Bucket</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Bucket Name"
          value={newBucket.name}
          onChange={(e) => setNewBucket({ ...newBucket, name: e.target.value })}
          className={`p-2 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
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
          className={`p-2 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
          }`}
        />
        <select
          value={newBucket.categoryId}
          onChange={(e) =>
            setNewBucket({ ...newBucket, categoryId: e.target.value })
          }
          className={`p-2 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
          }`}
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          onClick={onAdd}
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Bucket
        </button>
      </div>
    </div>
  );
};

export default BucketForm;
