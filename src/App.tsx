import { useState } from "react";
import {
  PlusCircle,
  Wallet,
  TrendingUp,
  PieChart,
  List,
  Trash2,
  DollarSign,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import React from "react";

// Types
type Income = {
  amount: number;
  savings: number;
};

type Bucket = {
  id: string;
  name: string;
  allocated: number;
  actual: number;
  categoryId: string;
};

type Transaction = {
  id: number;
  item: string;
  bucketId: string;
  date: string;
  amount: number;
  balanceAfter: number;
};

type Category = {
  id: string;
  name: string;
  color: string;
};

const BudgetingApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  // Apply dark mode to body element
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  // State
  const [income] = useState<Income>({ amount: 5000, savings: 1000 });
  const [buckets, setBuckets] = useState<Bucket[]>([
    {
      id: "1",
      name: "Food & Groceries",
      allocated: 800,
      actual: 650,
      categoryId: "1",
    },
    { id: "2", name: "Rent", allocated: 1500, actual: 1500, categoryId: "1" },
    {
      id: "3",
      name: "Entertainment",
      allocated: 300,
      actual: 220,
      categoryId: "2",
    },
    {
      id: "4",
      name: "Transportation",
      allocated: 200,
      actual: 180,
      categoryId: "1",
    },
    {
      id: "5",
      name: "Investments",
      allocated: 500,
      actual: 500,
      categoryId: "3",
    },
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      item: "Grocery Shopping",
      bucketId: "1",
      date: "2025-08-15",
      amount: 150,
      balanceAfter: 4850,
    },
    {
      id: 2,
      item: "Monthly Rent",
      bucketId: "2",
      date: "2025-08-01",
      amount: 1500,
      balanceAfter: 3350,
    },
    {
      id: 3,
      item: "Movie Night",
      bucketId: "3",
      date: "2025-08-10",
      amount: 50,
      balanceAfter: 3300,
    },
  ]);
  const [categories] = useState<Category[]>([
    { id: "1", name: "Living Expenses", color: "#3B82F6" },
    { id: "2", name: "Entertainment", color: "#10B981" },
    { id: "3", name: "Investments", color: "#F59E0B" },
  ]);

  // Form states
  const [newBucket, setNewBucket] = useState({
    name: "",
    allocated: 0,
    categoryId: "",
  });
  const [newTransaction, setNewTransaction] = useState({
    item: "",
    bucketId: "",
    amount: 0,
  });

  // Calculate category data for charts
  const getCategoryData = () => {
    return categories.map((category) => {
      const categoryBuckets = buckets.filter(
        (bucket) => bucket.categoryId === category.id
      );
      const totalAllocated = categoryBuckets.reduce(
        (sum, bucket) => sum + bucket.allocated,
        0
      );
      const totalActual = categoryBuckets.reduce(
        (sum, bucket) => sum + bucket.actual,
        0
      );

      return {
        name: category.name,
        allocated: totalAllocated,
        actual: totalActual,
        percentage: ((totalAllocated / income.amount) * 100).toFixed(1),
        color: category.color,
      };
    });
  };

  // Add new bucket
  const addBucket = () => {
    if (newBucket.name && newBucket.allocated > 0 && newBucket.categoryId) {
      const bucket: Bucket = {
        id: Date.now().toString(),
        name: newBucket.name,
        allocated: newBucket.allocated,
        actual: 0,
        categoryId: newBucket.categoryId,
      };
      setBuckets([...buckets, bucket]);
      setNewBucket({ name: "", allocated: 0, categoryId: "" });
    }
  };

  // Add new transaction
  const addTransaction = () => {
    if (
      newTransaction.item &&
      newTransaction.bucketId &&
      newTransaction.amount > 0
    ) {
      const lastBalance =
        transactions.length > 0
          ? transactions[transactions.length - 1].balanceAfter
          : income.amount;
      const transaction: Transaction = {
        id: transactions.length + 1,
        item: newTransaction.item,
        bucketId: newTransaction.bucketId,
        date: new Date().toISOString().split("T")[0],
        amount: newTransaction.amount,
        balanceAfter: lastBalance - newTransaction.amount,
      };

      setTransactions([...transactions, transaction]);

      // Update bucket actual amount
      setBuckets(
        buckets.map((bucket) =>
          bucket.id === newTransaction.bucketId
            ? { ...bucket, actual: bucket.actual + newTransaction.amount }
            : bucket
        )
      );

      setNewTransaction({ item: "", bucketId: "", amount: 0 });
    }
  };

  // Delete bucket
  const deleteBucket = (id: string) => {
    setBuckets(buckets.filter((bucket) => bucket.id !== id));
    setTransactions(
      transactions.filter((transaction) => transaction.bucketId !== id)
    );
  };

  // Tab content components
  const DashboardTab = () => {
    const categoryData = getCategoryData();
    const totalAllocated = buckets.reduce(
      (sum, bucket) => sum + bucket.allocated,
      0
    );
    const totalSpent = buckets.reduce((sum, bucket) => sum + bucket.actual, 0);

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Total Income
                </p>
                <p className="text-2xl font-bold">
                  ${income.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Savings
                </p>
                <p className="text-2xl font-bold">
                  ${income.savings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Allocated
                </p>
                <p className="text-2xl font-bold">
                  ${totalAllocated.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg shadow-md ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Spent
                </p>
                <p className="text-2xl font-bold">
                  ${totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div
          className={`p-6 rounded-lg shadow-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">
            Income Distribution by Category
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="allocated"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Allocated",
                  ]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const BucketsTab = () => (
    <div className="space-y-6">
      {/* Add Bucket Form */}
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
            onChange={(e) =>
              setNewBucket({ ...newBucket, name: e.target.value })
            }
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
            onClick={addBucket}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Bucket
          </button>
        </div>
      </div>

      {/* Buckets List */}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {percentage}%
                    </td>
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
                        onClick={() => deleteBucket(bucket.id)}
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
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-6">
      {/* Add Transaction Form */}
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
            onClick={addTransaction}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center justify-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Transactions List */}
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
                const bucket = buckets.find(
                  (b) => b.id === transaction.bucketId
                );
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
    </div>
  );

  const CategoriesTab = () => {
    const categoryData = getCategoryData();

    return (
      <div className="space-y-6">
        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.map((category) => (
            <div
              key={category.name}
              className={`p-6 rounded-lg shadow-md ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center mb-4">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category.color }}
                ></div>
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Allocated:
                  </span>
                  <span className="font-medium">
                    ${category.allocated.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Spent:
                  </span>
                  <span className="font-medium">
                    ${category.actual.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    % of Income:
                  </span>
                  <span className="font-medium">{category.percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Chart */}
        <div
          className={`p-6 rounded-lg shadow-md ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="actual"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    "Spent",
                  ]}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Header */}
      <header className={`shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Personal Budget Tracker</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-md ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav
        className={`shadow-sm border-b ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: PieChart },
              { id: "buckets", label: "Buckets", icon: Wallet },
              { id: "transactions", label: "Transactions", icon: List },
              { id: "categories", label: "Categories", icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  backgroundColor:
                    activeTab === id
                      ? darkMode
                        ? "#2563eb"
                        : "#dbeafe"
                      : "transparent",
                  color:
                    activeTab === id
                      ? darkMode
                        ? "#ffffff"
                        : "#1d4ed8"
                      : darkMode
                      ? "#d1d5db"
                      : "#4b5563",
                }}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 border-0 ${
                  activeTab !== id && darkMode
                    ? "hover:bg-gray-700 hover:text-white"
                    : ""
                } ${
                  activeTab !== id && !darkMode
                    ? "hover:bg-gray-100 hover:text-gray-900"
                    : ""
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "buckets" && <BucketsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "categories" && <CategoriesTab />}
      </main>
    </div>
  );
};

export default BudgetingApp;
