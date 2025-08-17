// src/components/TransactionTable.tsx
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
  darkMode: boolean;
}

const TransactionTable = ({
  transactions,
  buckets,
  darkMode,
}: TransactionTableProps) => {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const bucket = buckets.find((b) => b.id === transaction.bucketId);
              return (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.item}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bucket?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">
                    -${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    ${transaction.balanceAfter.toLocaleString()}
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
