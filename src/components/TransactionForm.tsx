// src/components/TransactionForm.tsx
import { PlusCircle } from "lucide-react";

interface Bucket {
  id: string;
  name: string;
  allocated: number;
  actual: number;
  categoryId: string;
}

interface TransactionFormProps {
  newTransaction: {
    item: string;
    bucketId: string;
    amount: number;
  };
  setNewTransaction: (transaction: any) => void;
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
      className={`p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Item Purchased"
          value={newTransaction.item}
          onChange={(e) =>
            setNewTransaction({ ...newTransaction, item: e.target.value })
          }
          className={`p-2 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
          }`}
        />
        <select
          value={newTransaction.bucketId}
          onChange={(e) =>
            setNewTransaction({ ...newTransaction, bucketId: e.target.value })
          }
          className={`p-2 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
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
            })
          }
          className={`p-2 border rounded-md ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-white border-gray-300"
          }`}
        />
        <button
          onClick={onAdd}
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Transaction
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
