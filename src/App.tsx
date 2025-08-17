import { useState } from "react";
import {
  ChartNoAxesCombined,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React from "react";

// Components
import {
  Header,
  Navigation,
  StatCard,
  PieChart,
  BucketForm,
  BucketTable,
  TransactionForm,
  TransactionTable,
  CategoryCard,
} from "./components";

// Types
import type {
  Income,
  Bucket,
  Transaction,
  Category,
  CategoryData,
} from "./types";

const BudgetingApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark mode to body element
  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.style.background =
        "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)";
    } else {
      document.body.classList.remove("dark");
      document.body.style.background =
        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)";
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
  const getCategoryData = (): CategoryData[] => {
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

  // Edit transaction
  const editTransaction = (
    id: number,
    updatedTransaction: Partial<Transaction>
  ) => {
    setTransactions((prevTransactions) => {
      return prevTransactions.map((transaction) => {
        if (transaction.id === id) {
          const oldAmount = transaction.amount;
          const newAmount = updatedTransaction.amount || transaction.amount;
          const oldBucketId = transaction.bucketId;
          const newBucketId =
            updatedTransaction.bucketId || transaction.bucketId;

          // Update bucket actual amounts
          if (oldBucketId !== newBucketId || oldAmount !== newAmount) {
            setBuckets((prevBuckets) =>
              prevBuckets.map((bucket) => {
                if (bucket.id === oldBucketId) {
                  return { ...bucket, actual: bucket.actual - oldAmount };
                }
                if (bucket.id === newBucketId) {
                  return { ...bucket, actual: bucket.actual + newAmount };
                }
                return bucket;
              })
            );
          }

          return { ...transaction, ...updatedTransaction };
        }
        return transaction;
      });
    });
  };

  // Delete transaction
  const deleteTransaction = (id: number) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      // Update bucket actual amount
      setBuckets((prevBuckets) =>
        prevBuckets.map((bucket) =>
          bucket.id === transaction.bucketId
            ? { ...bucket, actual: bucket.actual - transaction.amount }
            : bucket
        )
      );

      setTransactions((prevTransactions) =>
        prevTransactions.filter((t) => t.id !== id)
      );
    }
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
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Income"
            value={income.amount}
            icon={DollarSign}
            iconColor="text-blue-500"
            darkMode={darkMode}
          />
          <StatCard
            title="Savings"
            value={income.savings}
            icon={TrendingUp}
            iconColor="text-green-500"
            darkMode={darkMode}
          />
          <StatCard
            title="Allocated"
            value={totalAllocated}
            icon={Wallet}
            iconColor="text-yellow-500"
            darkMode={darkMode}
          />
          <StatCard
            title="Spent"
            value={totalSpent}
            icon={ChartNoAxesCombined}
            iconColor="text-red-500"
            darkMode={darkMode}
          />
        </div>

        {/* Chart */}
        <PieChart
          data={categoryData}
          title="Income Distribution by Category"
          dataKey="allocated"
          tooltipLabel="Allocated"
          darkMode={darkMode}
        />
      </div>
    );
  };

  const BucketsTab = () => (
    <div className="space-y-8">
      <BucketForm
        newBucket={newBucket}
        setNewBucket={setNewBucket}
        categories={categories}
        onAdd={addBucket}
        darkMode={darkMode}
      />
      <BucketTable
        buckets={buckets}
        categories={categories}
        income={income}
        onDelete={deleteBucket}
        darkMode={darkMode}
      />
    </div>
  );

  const TransactionsTab = () => (
    <div className="space-y-8">
      <TransactionForm
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        buckets={buckets}
        onAdd={addTransaction}
        darkMode={darkMode}
      />
      <TransactionTable
        transactions={transactions}
        buckets={buckets}
        onEdit={editTransaction}
        onDelete={deleteTransaction}
        darkMode={darkMode}
      />
    </div>
  );

  const CategoriesTab = () => {
    const categoryData = getCategoryData();

    return (
      <div className="space-y-8">
        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              darkMode={darkMode}
            />
          ))}
        </div>

        {/* Category Chart */}
        <PieChart
          data={categoryData}
          title="Spending by Category"
          dataKey="actual"
          tooltipLabel="Spent"
          darkMode={darkMode}
        />
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode ? "text-white" : "text-gray-900"
      }`}
    >
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "buckets" && <BucketsTab />}
          {activeTab === "transactions" && <TransactionsTab />}
          {activeTab === "categories" && <CategoriesTab />}
        </div>
      </main>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        /* Smooth transitions for all elements */
        * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${darkMode ? "#374151" : "#f1f5f9"};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? "#6366f1" : "#3b82f6"};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "#4f46e5" : "#2563eb"};
        }
      `}</style>
    </div>
  );
};

export default BudgetingApp;
