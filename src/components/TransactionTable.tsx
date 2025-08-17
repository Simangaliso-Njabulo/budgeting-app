// src/components/TransactionTable.tsx
import { Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: number;
  item: string;
  bucketId: string;
  date: string;
  amount: number;
  balanceAfter: number;
}

interface Bucket {
  id: string;
  name: string;
  allocated: number;
  actual: number;
  categoryId: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  buckets: Bucket[];
  onEdit: (id: number, updatedTransaction: Partial<Transaction>) => void;
  onDelete: (id: number) => void;
  darkMode: boolean;
}

const TransactionTable = ({
  transactions,
  buckets,
  onEdit,
  onDelete,
  darkMode,
}: TransactionTableProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    item: "",
    bucketId: "",
    amount: 0,
  });

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      item: transaction.item,
      bucketId: transaction.bucketId,
      amount: transaction.amount,
    });
  };

  const saveEdit = () => {
    if (
      editingId &&
      editForm.item &&
      editForm.bucketId &&
      editForm.amount > 0
    ) {
      onEdit(editingId, editForm);
      setEditingId(null);
      setEditForm({ item: "", bucketId: "", amount: 0 });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ item: "", bucketId: "", amount: 0 });
  };

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
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Bucket
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Balance After
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const bucket = buckets.find((b) => b.id === transaction.bucketId);
              const isEditing = editingId === transaction.id;

              return (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.item}
                        onChange={(e) =>
                          setEditForm({ ...editForm, item: e.target.value })
                        }
                        className={`p-1 border rounded text-sm w-full ${
                          darkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        }`}
                      />
                    ) : (
                      transaction.item
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editForm.bucketId}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bucketId: e.target.value })
                        }
                        className={`p-1 border rounded text-sm w-full ${
                          darkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {buckets.map((bucket) => (
                          <option key={bucket.id} value={bucket.id}>
                            {bucket.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      bucket?.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.amount || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            amount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`p-1 border rounded text-sm w-full ${
                          darkMode
                            ? "bg-gray-700 border-gray-600"
                            : "bg-white border-gray-300"
                        }`}
                      />
                    ) : (
                      `-${transaction.amount.toLocaleString()}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ${transaction.balanceAfter.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="text-green-500 hover:text-green-700 transition-colors"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(transaction)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDelete(transaction.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
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

export default TransactionTable;
