// src/components/TransactionTable.tsx
import { Edit2, Trash2, Save, X } from "lucide-react";
import { useState } from "react";
import ActionButton from "./ActionButton";
import type { Bucket, Transaction } from "../types";

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
                "#",
                "Item",
                "Bucket",
                "Date",
                "Amount",
                "Balance After",
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
            {transactions.map((transaction) => {
              const bucket = buckets.find((b) => b.id === transaction.bucketId);
              const isEditing = editingId === transaction.id;

              return (
                <tr
                  key={transaction.id}
                  className="group hover:bg-black/5 transition-all duration-300"
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
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
                        className={`p-2 border rounded-xl text-sm w-full transition-all duration-300 focus:ring-2 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
                            : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                    ) : (
                      <span
                        className={darkMode ? "text-white" : "text-gray-900"}
                      >
                        {transaction.item}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select
                        value={editForm.bucketId}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bucketId: e.target.value })
                        }
                        className={`p-2 border rounded-xl text-sm w-full transition-all duration-300 focus:ring-2 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
                            : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      >
                        {buckets.map((bucket) => (
                          <option key={bucket.id} value={bucket.id}>
                            {bucket.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={darkMode ? "text-gray-300" : "text-gray-600"}
                      >
                        {bucket?.name}
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-red-500">
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
                        className={`p-2 border rounded-xl text-sm w-full transition-all duration-300 focus:ring-2 ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500"
                            : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                      />
                    ) : (
                      `-$${transaction.amount.toLocaleString()}`
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ${transaction.balanceAfter.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      {isEditing ? (
                        <>
                          <ActionButton
                            onClick={saveEdit}
                            variant="success"
                            size="sm"
                            darkMode={darkMode}
                          >
                            <Save className="h-4 w-4" />
                          </ActionButton>
                          <ActionButton
                            onClick={cancelEdit}
                            variant="secondary"
                            size="sm"
                            darkMode={darkMode}
                          >
                            <X className="h-4 w-4" />
                          </ActionButton>
                        </>
                      ) : (
                        <>
                          <ActionButton
                            onClick={() => startEdit(transaction)}
                            variant="primary"
                            size="sm"
                            darkMode={darkMode}
                          >
                            <Edit2 className="h-4 w-4" />
                          </ActionButton>
                          <ActionButton
                            onClick={() => onDelete(transaction.id)}
                            variant="danger"
                            size="sm"
                            darkMode={darkMode}
                          >
                            <Trash2 className="h-4 w-4" />
                          </ActionButton>
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
