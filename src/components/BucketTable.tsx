// src/components/BucketTable.tsx
import { Trash2 } from "lucide-react";

interface Bucket {
  id: string;
  name: string;
  allocated: number;
  actual: number;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface BucketTableProps {
  buckets: Bucket[];
  categories: Category[];
  income: { amount: number; savings: number };
  onDelete: (id: string) => void;
  darkMode: boolean;
}

const BucketTable = ({
  buckets,
  categories,
  income,
  onDelete,
  darkMode,
}: BucketTableProps) => {
  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Allocated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Difference
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                % of Income
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {buckets.map((bucket) => {
              const difference = bucket.allocated - bucket.actual;
              const percentage = (
                (bucket.allocated / income.amount) *
                100
              ).toFixed(1);
              const category = categories.find(
                (c) => c.id === bucket.categoryId
              );

              return (
                <tr key={bucket.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {bucket.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${bucket.allocated.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${bucket.actual.toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-medium ${
                      difference >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${difference.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs rounded-full text-white"
                      style={{ backgroundColor: category?.color }}
                    >
                      {category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onDelete(bucket.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BucketTable;
