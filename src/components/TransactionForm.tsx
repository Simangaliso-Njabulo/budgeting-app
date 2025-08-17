// src/components/TransactionForm.tsx
import { Plus } from "lucide-react";
import ActionButton from "./ActionButton";
import type { Bucket, Transaction } from "../types";

interface TransactionFormProps {
  newTransaction: {
    item: string;
    bucketId: string;
    amount: number;
  };
  setNewTransaction: (transaction: Transaction) => void;
  buckets: Bucket[];
  onAdd: () => void;
  darkMode: boolean;
}

const TransactionForm = ({
  newTransaction,
  setNewTransaction,
  buckets,
  onAdd,
  darkMode,
}: TransactionFormProps) => {
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
        Add New Transaction
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Transaction Item"
          value={newTransaction.item}
          onChange={(e) =>
            setNewTransaction({
              ...newTransaction,
              item: e.target.value,
              id: 0,
              date: "",
              balanceAfter: 0,
            })
          }
          className={`px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-opacity-50 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        <select
          value={newTransaction.bucketId}
          onChange={(e) =>
            setNewTransaction({
              ...newTransaction,
              bucketId: e.target.value,
              id: 0,
              date: "",
              balanceAfter: 0,
            })
          }
          className={`px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-opacity-50 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
              : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
          }`}
        >
          <option value="">Select Bucket</option>
          {buckets.map((bucket) => (
            <option key={bucket.id} value={bucket.id}>
              {bucket.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={newTransaction.amount || ""}
          onChange={(e) =>
            setNewTransaction({
              ...newTransaction,
              amount: parseFloat(e.target.value) || 0,
              id: 0,
              date: "",
              balanceAfter: 0,
            })
          }
          className={`px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-opacity-50 ${
            darkMode
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          }`}
        />
        <ActionButton
          onClick={onAdd}
          variant="primary"
          size="md"
          darkMode={darkMode}
          className="w-full justify-center flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </ActionButton>
      </div>
    </div>
  );
};

export default TransactionForm;
