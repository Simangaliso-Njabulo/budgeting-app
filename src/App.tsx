import { useState } from "react";
import { Users, Wallet, TrendingUp, PiggyBank } from "lucide-react";

// Components
import {
  Sidebar,
  StatCard,
  BucketForm,
  BucketTable,
  FilterBar,
  DonutChart,
  Settings,
} from "./components";

// Types
import type { Income, Bucket, Category } from "./types";

const BudgetingApp = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // State
  const [income, setIncome] = useState<Income>({ amount: 5000, savings: 1000 });
  const [buckets, setBuckets] = useState<Bucket[]>([
    { id: "1", name: "Food & Groceries", allocated: 800, actual: 650, categoryId: "1" },
    { id: "2", name: "Rent", allocated: 1500, actual: 1500, categoryId: "1" },
    { id: "3", name: "Entertainment", allocated: 300, actual: 220, categoryId: "2" },
    { id: "4", name: "Transportation", allocated: 200, actual: 180, categoryId: "1" },
    { id: "5", name: "Investments", allocated: 500, actual: 500, categoryId: "3" },
  ]);
  const [categories] = useState<Category[]>([
    { id: "1", name: "Living Expenses", color: "#a78bfa" },
    { id: "2", name: "Entertainment", color: "#6ee7b7" },
    { id: "3", name: "Investments", color: "#7dd3fc" },
  ]);

  const [newBucket, setNewBucket] = useState({
    name: "",
    allocated: 0,
    categoryId: "",
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  // Delete bucket
  const deleteBucket = (id: string) => {
    setBuckets(buckets.filter((bucket) => bucket.id !== id));
  };

  // Filtered buckets
  const filteredBuckets = buckets.filter((bucket) => {
    const matchesSearch = bucket.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || bucket.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Computed values for dashboard
  const totalAllocated = buckets.reduce((sum, bucket) => sum + bucket.allocated, 0);
  const totalSpent = buckets.reduce((sum, bucket) => sum + bucket.actual, 0);
  const remaining = income.amount - totalAllocated;

  const categoryData = categories.map((category) => {
    const categoryBuckets = buckets.filter((bucket) => bucket.categoryId === category.id);
    const catAllocated = categoryBuckets.reduce((sum, bucket) => sum + bucket.allocated, 0);
    const catActual = categoryBuckets.reduce((sum, bucket) => sum + bucket.actual, 0);

    return {
      name: category.name,
      allocated: catAllocated,
      actual: catActual,
      percentage: ((catAllocated / income.amount) * 100).toFixed(1),
      color: category.color,
    };
  });

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appName="BudgetPro"
        subtitle="Personal Finance"
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Track your budget allocation and spending</p>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                <StatCard
                  title="Total Spent"
                  value={totalSpent}
                  total={income.amount}
                  icon={Users}
                  gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="spent"
                  delay={0}
                />
                <StatCard
                  title="Savings"
                  value={income.savings}
                  total={income.amount}
                  icon={PiggyBank}
                  gradient="bg-gradient-to-br from-green-500 to-green-600"
                  subtitle="saved"
                  delay={150}
                />
                <StatCard
                  title="Allocated"
                  value={totalAllocated}
                  total={income.amount}
                  icon={Wallet}
                  gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                  subtitle="budgeted"
                  delay={300}
                />
                <StatCard
                  title="Remaining"
                  value={remaining > 0 ? remaining : 0}
                  total={income.amount}
                  icon={TrendingUp}
                  gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                  subtitle="available"
                  delay={450}
                />
              </div>

              {/* Chart Section */}
              <DonutChart data={categoryData} />
            </div>
          )}

          {/* Buckets Tab */}
          {activeTab === "buckets" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Buckets</h1>
                <p className="page-subtitle">Manage your budget buckets and allocations</p>
              </div>

              {/* Filter Bar */}
              <FilterBar
                filters={[
                  {
                    id: "category",
                    label: "All Categories",
                    options: categories.map((c) => ({ id: c.id, label: c.name })),
                    value: categoryFilter,
                    onChange: setCategoryFilter,
                  },
                ]}
                searchPlaceholder="Search buckets..."
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
              />

              {/* Add Bucket Form */}
              <BucketForm
                newBucket={newBucket}
                setNewBucket={setNewBucket}
                categories={categories}
                onAdd={addBucket}
                darkMode={true}
              />

              {/* Buckets Table */}
              <BucketTable
                buckets={filteredBuckets}
                categories={categories}
                income={income}
                onDelete={deleteBucket}
                title="Budget Management"
                subtitle={`${filteredBuckets.length} buckets found`}
              />
            </div>
          )}
          {activeTab === "transactions" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Transactions</h1>
                <p className="page-subtitle">Track your income and expenses</p>
              </div>
              <div className="empty-state">
                <div className="empty-state-icon">
                  <TrendingUp className="h-12 w-12" />
                </div>
                <h3>Coming Soon</h3>
                <p>Transaction management is under development.</p>
              </div>
            </div>
          )}
          {activeTab === "categories" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Categories</h1>
                <p className="page-subtitle">Organize your budget categories</p>
              </div>
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Wallet className="h-12 w-12" />
                </div>
                <h3>Coming Soon</h3>
                <p>Category management is under development.</p>
              </div>
            </div>
          )}
          {activeTab === "settings" && (
            <Settings income={income} onUpdateIncome={setIncome} />
          )}
        </div>
      </main>
    </div>
  );
};

export default BudgetingApp;
