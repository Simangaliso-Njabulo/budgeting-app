// src/components/BucketTable.tsx
import { Trash2 } from "lucide-react";
import ActionButton from "./ActionButton";
import type { Bucket, Category, Income } from "../types";

interface BucketTableProps {
  buckets: Bucket[];
  categories: Category[];
  income: Income;
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
      className={`rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
          : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
      }`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`${
              darkMode
                ? "bg-gradient-to-r from-gray-700 to-gray-800"
                : "bg-gradient-to-r from-gray-50 to-gray-100"
            }`}
          >
            <tr>
              {[
                "Name",
                "Allocated",
                "Actual",
                "Difference",
                "% of Income",
                "Category",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/20">
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
                <tr
                  key={bucket.id}
                  className="group hover:bg-black/5 transition-all duration-300"
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {bucket.name}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    ${bucket.allocated.toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    ${bucket.actual.toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-bold ${
                      difference >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    ${difference.toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-3 py-1 text-xs font-medium rounded-full text-white shadow-lg"
                      style={{ backgroundColor: category?.color }}
                    >
                      {category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ActionButton
                      onClick={() => onDelete(bucket.id)}
                      variant="danger"
                      size="sm"
                      darkMode={darkMode}
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </ActionButton>
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
