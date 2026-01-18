import { useState } from "react";
import { Users, Wallet, TrendingUp, PiggyBank, FolderOpen, Receipt } from "lucide-react";

// Components
import {
  Sidebar,
  MobileNav,
  StatCard,
  BucketForm,
  BucketTable,
  FilterBar,
  DonutChart,
  Settings,
  Modal,
  Toast,
  ConfirmDialog,
  EmptyState,
  FAB,
  CategoryForm,
  CategoryGrid,
  TransactionFormModal,
  TransactionList,
  TransactionFilters,
  TransactionSummary,
  RecentTransactions,
  SpendingTrend,
  Login,
  SignUp,
  ForgotPassword,
} from "./components";
import type { ToastType } from "./components";

// Types
import type { Income, Bucket, Category, Transaction, NewCategoryForm, NewTransactionForm } from "./types";

// Admin credentials for development
const ADMIN_CREDENTIALS = {
  email: 'admin@budgetwise.com',
  password: 'admin123',
  name: 'Admin User',
};

const BudgetingApp = () => {
  // Auth state - auto-login for development
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for dev mode
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot'>('login');
  const [user, setUser] = useState<{ name: string; email: string } | null>({
    name: ADMIN_CREDENTIALS.name,
    email: ADMIN_CREDENTIALS.email,
  });

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
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Living Expenses", color: "#a78bfa", icon: "home", type: "expense" },
    { id: "2", name: "Entertainment", color: "#6ee7b7", icon: "entertainment", type: "expense" },
    { id: "3", name: "Investments", color: "#7dd3fc", icon: "work", type: "both" },
    { id: "4", name: "Income", color: "#fdba74", icon: "income", type: "income" },
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", description: "Coffee Shop", amount: 4.50, type: "expense", categoryId: "1", date: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { id: "2", description: "Monthly Salary", amount: 5000, type: "income", categoryId: "4", date: new Date(), createdAt: new Date(), updatedAt: new Date() },
    { id: "3", description: "Grocery Store", amount: 89.00, type: "expense", categoryId: "1", bucketId: "1", date: new Date(Date.now() - 86400000), createdAt: new Date(), updatedAt: new Date() },
    { id: "4", description: "Netflix", amount: 15.99, type: "expense", categoryId: "2", bucketId: "3", date: new Date(Date.now() - 86400000), createdAt: new Date(), updatedAt: new Date() },
    { id: "5", description: "Gas Station", amount: 45.00, type: "expense", categoryId: "1", bucketId: "4", date: new Date(Date.now() - 172800000), createdAt: new Date(), updatedAt: new Date() },
  ]);

  const [newBucket, setNewBucket] = useState({
    name: "",
    allocated: 0,
    categoryId: "",
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Transaction filter states
  const [txSearchQuery, setTxSearchQuery] = useState("");
  const [txCategoryFilter, setTxCategoryFilter] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("");
  const [txDateRange, setTxDateRange] = useState({ start: "", end: "" });

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'transaction' | 'bucket'; item: Category | Transaction | Bucket } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });
  };

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    // Check admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setUser({ name: ADMIN_CREDENTIALS.name, email: ADMIN_CREDENTIALS.email });
      setIsAuthenticated(true);
      showToast('Welcome back!', 'success');
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const handleSignUp = async (name: string, email: string, _password: string) => {
    // For demo, just create the user
    setUser({ name, email });
    setIsAuthenticated(true);
    showToast('Account created successfully!', 'success');
  };

  const handleForgotPassword = async (_email: string) => {
    // For demo, just show success
    showToast('Password reset email sent!', 'success');
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    // For demo, simulate social login
    setUser({ name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`, email: `user@${provider}.com` });
    setIsAuthenticated(true);
    showToast(`Signed in with ${provider}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthPage('login');
    showToast('Signed out successfully', 'info');
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
      showToast("Bucket created successfully!");
    }
  };

  // Delete bucket
  const deleteBucket = (id: string) => {
    setBuckets(buckets.filter((bucket) => bucket.id !== id));
    showToast("Bucket deleted", "info");
  };

  // Category CRUD
  const handleSaveCategory = (data: NewCategoryForm) => {
    if (editingCategory) {
      // Update existing
      setCategories(categories.map(c =>
        c.id === editingCategory.id
          ? { ...c, ...data, updatedAt: new Date() }
          : c
      ));
      showToast("Category updated successfully!");
    } else {
      // Create new
      const newCategory: Category = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCategories([...categories, newCategory]);
      showToast("Category created successfully!");
    }
    setIsCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteConfirm({ type: 'category', item: category });
  };

  const confirmDeleteCategory = () => {
    if (deleteConfirm?.type === 'category') {
      const category = deleteConfirm.item as Category;
      // Soft delete - mark as deleted
      setCategories(categories.map(c =>
        c.id === category.id
          ? { ...c, isDeleted: true, deletedAt: new Date() }
          : c
      ));
      showToast("Category deleted", "info");
    }
    setDeleteConfirm(null);
  };

  // Transaction CRUD
  const handleSaveTransaction = (data: NewTransactionForm) => {
    if (editingTransaction) {
      // Update existing
      setTransactions(transactions.map(t =>
        t.id === editingTransaction.id
          ? { ...t, ...data, updatedAt: new Date() }
          : t
      ));
      showToast("Transaction updated successfully!");
    } else {
      // Create new
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTransactions([...transactions, newTransaction]);

      // Update bucket actual if linked
      if (data.bucketId && data.type === 'expense') {
        setBuckets(buckets.map(b =>
          b.id === data.bucketId
            ? { ...b, actual: b.actual + data.amount }
            : b
        ));
      }

      showToast("Transaction added successfully!");
    }
    setIsTransactionModalOpen(false);
    setEditingTransaction(undefined);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeleteConfirm({ type: 'transaction', item: transaction });
  };

  const confirmDeleteTransaction = () => {
    if (deleteConfirm?.type === 'transaction') {
      const transaction = deleteConfirm.item as Transaction;
      setTransactions(transactions.filter(t => t.id !== transaction.id));

      // Update bucket actual if linked
      if (transaction.bucketId && transaction.type === 'expense') {
        setBuckets(buckets.map(b =>
          b.id === transaction.bucketId
            ? { ...b, actual: Math.max(0, b.actual - transaction.amount) }
            : b
        ));
      }

      showToast("Transaction deleted", "info");
    }
    setDeleteConfirm(null);
  };

  // Filtered buckets
  const filteredBuckets = buckets.filter((bucket) => {
    const matchesSearch = bucket.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || bucket.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(txSearchQuery.toLowerCase());
    const matchesCategory = !txCategoryFilter || tx.categoryId === txCategoryFilter;
    const matchesType = !txTypeFilter || tx.type === txTypeFilter;
    const txDate = new Date(tx.date);
    const matchesDateStart = !txDateRange.start || txDate >= new Date(txDateRange.start);
    const matchesDateEnd = !txDateRange.end || txDate <= new Date(txDateRange.end);
    return matchesSearch && matchesCategory && matchesType && matchesDateStart && matchesDateEnd;
  });

  // Computed values for dashboard
  const totalAllocated = buckets.reduce((sum, bucket) => sum + bucket.allocated, 0);
  const totalSpent = buckets.reduce((sum, bucket) => sum + bucket.actual, 0);
  const remaining = income.amount - totalAllocated;

  // Active categories (not deleted)
  const activeCategories = categories.filter(c => !c.isDeleted);

  const categoryData = activeCategories.map((category) => {
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

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    if (authPage === 'signup') {
      return (
        <SignUp
          onSignUp={handleSignUp}
          onNavigate={() => setAuthPage('login')}
          onSocialLogin={handleSocialLogin}
        />
      );
    }

    if (authPage === 'forgot') {
      return (
        <ForgotPassword
          onResetPassword={handleForgotPassword}
          onNavigate={() => setAuthPage('login')}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onNavigate={(page) => setAuthPage(page)}
        onSocialLogin={handleSocialLogin}
      />
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        appName="MyBudgeting App"
        subtitle="Personal Finance"
        onLogout={handleLogout}
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

              {/* Dashboard Grid - Chart and Recent Transactions */}
              <div className="dashboard-grid">
                <DonutChart data={categoryData} />
                <RecentTransactions
                  transactions={transactions}
                  categories={categories}
                  onViewAll={() => setActiveTab("transactions")}
                  limit={5}
                />
              </div>

              {/* Spending Trend */}
              <SpendingTrend transactions={transactions} days={7} />
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
                    options: activeCategories.map((c) => ({ id: c.id, label: c.name })),
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
                categories={activeCategories}
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

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Transactions</h1>
                <p className="page-subtitle">Track your income and expenses</p>
              </div>

              {/* Transaction Filters */}
              <TransactionFilters
                categories={categories}
                searchQuery={txSearchQuery}
                onSearchChange={setTxSearchQuery}
                categoryFilter={txCategoryFilter}
                onCategoryChange={setTxCategoryFilter}
                typeFilter={txTypeFilter}
                onTypeChange={setTxTypeFilter}
                dateRange={txDateRange}
                onDateRangeChange={setTxDateRange}
                onAddClick={() => {
                  setEditingTransaction(undefined);
                  setIsTransactionModalOpen(true);
                }}
              />

              {/* Transaction Summary */}
              <TransactionSummary transactions={filteredTransactions} />

              {/* Transaction List */}
              {filteredTransactions.length > 0 ? (
                <TransactionList
                  transactions={filteredTransactions}
                  categories={categories}
                  buckets={buckets}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              ) : (
                <EmptyState
                  icon={Receipt}
                  title="No Transactions Yet"
                  description="Start tracking your income and expenses by adding your first transaction."
                  actionLabel="Add Transaction"
                  onAction={() => {
                    setEditingTransaction(undefined);
                    setIsTransactionModalOpen(true);
                  }}
                />
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Categories</h1>
                <p className="page-subtitle">Organize your budget categories</p>
              </div>

              {/* Filter Bar for Categories */}
              <FilterBar
                searchPlaceholder="Search categories..."
                searchValue=""
                onSearchChange={() => {}}
                onAddClick={() => {
                  setEditingCategory(undefined);
                  setIsCategoryModalOpen(true);
                }}
                addButtonText="Add Category"
              />

              {/* Category Grid */}
              {activeCategories.length > 0 ? (
                <CategoryGrid
                  categories={activeCategories}
                  buckets={buckets}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ) : (
                <EmptyState
                  icon={FolderOpen}
                  title="No Categories Yet"
                  description="Create categories to organize your budget buckets and transactions."
                  actionLabel="Add Category"
                  onAction={() => {
                    setEditingCategory(undefined);
                    setIsCategoryModalOpen(true);
                  }}
                />
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <Settings
              income={income}
              onUpdateIncome={setIncome}
              user={user || undefined}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>

      {/* FAB for quick add transaction */}
      {(activeTab === "dashboard" || activeTab === "transactions") && (
        <FAB
          onClick={() => {
            setEditingTransaction(undefined);
            setIsTransactionModalOpen(true);
          }}
          label="Add Transaction"
        />
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(undefined);
        }}
        title={editingCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <CategoryForm
          category={editingCategory}
          onSave={handleSaveCategory}
          onCancel={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(undefined);
          }}
        />
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(undefined);
        }}
        title={editingTransaction ? "Edit Transaction" : "Add Transaction"}
        size="md"
      >
        <TransactionFormModal
          transaction={editingTransaction}
          categories={activeCategories}
          buckets={buckets}
          onSave={handleSaveTransaction}
          onCancel={() => {
            setIsTransactionModalOpen(false);
            setEditingTransaction(undefined);
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteConfirm?.type === 'category' ? confirmDeleteCategory : confirmDeleteTransaction}
        title={`Delete ${deleteConfirm?.type === 'category' ? 'Category' : 'Transaction'}`}
        message={
          deleteConfirm?.type === 'category'
            ? "Are you sure you want to delete this category? Existing transactions will keep their category reference."
            : "Are you sure you want to delete this transaction? This action cannot be undone."
        }
        confirmText="Delete"
        variant="danger"
      />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default BudgetingApp;
