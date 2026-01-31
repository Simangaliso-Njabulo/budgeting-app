import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Wallet,
  TrendingUp,
  PiggyBank,
  FolderOpen,
  Receipt,
} from "lucide-react";

// Components
import {
  Sidebar,
  MobileNav,
  StatCard,
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
  MonthlyTrendChart,
  MonthSelector,
  Login,
  SignUp,
  ForgotPassword,
} from "./components";
import type { ToastType } from "./components";

// Types
import type {
  Income,
  Bucket,
  Category,
  Transaction,
  NewCategoryForm,
  NewTransactionForm,
  BudgetPeriod,
  MonthlyTrendItem,
} from "./types";

// Context
import { useTheme } from "./context/ThemeContext";

// API
import {
  authApi,
  categoriesApi,
  bucketsApi,
  transactionsApi,
  usersApi,
  monthlyIncomeApi,
  getAccessToken,
  clearTokens,
} from "./services/api";

// User type from API
interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  theme: string;
  accent_color: string;
  monthly_income: number;
  savings_target: number;
}

// Transform API response to frontend types
const transformCategory = (cat: Record<string, unknown>): Category => ({
  id: cat.id as string,
  name: cat.name as string,
  color: cat.color as string,
  icon: cat.icon as string | undefined,
  type: cat.type as "expense" | "income" | "both",
  isDeleted: cat.is_deleted as boolean,
  deletedAt: cat.deleted_at ? new Date(cat.deleted_at as string) : undefined,
  createdAt: cat.created_at ? new Date(cat.created_at as string) : undefined,
  updatedAt: cat.updated_at ? new Date(cat.updated_at as string) : undefined,
});

const transformBucket = (bucket: Record<string, unknown>): Bucket => ({
  id: bucket.id as string,
  name: bucket.name as string,
  allocated: Number(bucket.allocated) || 0,
  actual: 0, // Will be calculated from transactions
  categoryId: (bucket.category_id as string) || "",
  icon: bucket.icon as string | undefined,
  color: bucket.color as string | undefined,
  createdAt: bucket.created_at
    ? new Date(bucket.created_at as string)
    : undefined,
  updatedAt: bucket.updated_at
    ? new Date(bucket.updated_at as string)
    : undefined,
});

const transformTransaction = (tx: Record<string, unknown>): Transaction => ({
  id: tx.id as string,
  description: tx.description as string,
  amount: Number(tx.amount) || 0,
  type: tx.type as "income" | "expense",
  categoryId: (tx.category_id as string) || "",
  bucketId: tx.bucket_id as string | undefined,
  date: new Date(tx.date as string),
  notes: tx.notes as string | undefined,
  createdAt: new Date(tx.created_at as string),
  updatedAt: new Date(tx.updated_at as string),
});

const BudgetingApp = () => {
  // Theme
  const { formatCurrency } = useTheme();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [authPage, setAuthPage] = useState<"login" | "signup" | "forgot">(
    "login",
  );
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");

  // Selected budget period (month/year)
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [trendData, setTrendData] = useState<MonthlyTrendItem[]>([]);

  // State
  const [income, setIncome] = useState<Income>({ amount: 0, savings: 0 });
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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
  const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >();
  const [editingBucket, setEditingBucket] = useState<Bucket | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "category" | "transaction" | "bucket";
    item: Category | Transaction | Bucket;
  } | null>(null);

  // Transfer state
  const [transfer, setTransfer] = useState({
    fromBucketId: "",
    toBucketId: "",
    amount: 0,
  });
  const [transferMode, setTransferMode] = useState<"to" | "from" | null>(null);
  const [transferContextBucket, setTransferContextBucket] =
    useState<Bucket | null>(null);

  // Transfer history - load from localStorage
  const [transferHistory, setTransferHistory] = useState<
    {
      id: string;
      fromBucketName: string;
      toBucketName: string;
      amount: number;
      date: Date;
    }[]
  >(() => {
    try {
      const saved = localStorage.getItem("transferHistory");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(
          (item: {
            id: string;
            fromBucketName: string;
            toBucketName: string;
            amount: number;
            date: string;
          }) => ({
            ...item,
            date: new Date(item.date),
          }),
        );
      }
    } catch (e) {
      console.error("Failed to load transfer history:", e);
    }
    return [];
  });

  // Save transfer history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("transferHistory", JSON.stringify(transferHistory));
    } catch (e) {
      console.error("Failed to save transfer history:", e);
    }
  }, [transferHistory]);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type, visible: true });
  };

  // Helper to recalculate bucket spending from transactions
  // Expenses add to spending, income subtracts from spending (adds money back to bucket)
  const recalculateBucketSpending = useCallback(
    (txList: Transaction[], bucketList: Bucket[]): Bucket[] => {
      const bucketSpending: Record<string, number> = {};
      txList.forEach((tx) => {
        if (tx.bucketId) {
          if (tx.type === "expense") {
            bucketSpending[tx.bucketId] =
              (bucketSpending[tx.bucketId] || 0) + tx.amount;
          } else if (tx.type === "income") {
            bucketSpending[tx.bucketId] =
              (bucketSpending[tx.bucketId] || 0) - tx.amount;
          }
        }
      });
      return bucketList.map((b) => ({
        ...b,
        actual: Math.max(0, bucketSpending[b.id] || 0), // Don't go negative
      }));
    },
    [],
  );

  // Fetch monthly income for a given period
  const fetchMonthlyIncome = useCallback(
    async (year: number, month: number) => {
      try {
        const monthlyData = await monthlyIncomeApi.get(year, month);
        setIncome({
          amount: Number(monthlyData.amount) || 0,
          savings: Number(monthlyData.savings_target) || 0,
        });
      } catch {
        // Fall back to user defaults (already set)
      }
    },
    [],
  );

  // Fetch trend data
  const fetchTrends = useCallback(async () => {
    try {
      const trendsResponse = await monthlyIncomeApi.getTrends(6);
      setTrendData(
        trendsResponse.data.map((item: Record<string, unknown>) => ({
          year: item.year as number,
          month: item.month as number,
          income: Number(item.income) || 0,
          expenses: Number(item.expenses) || 0,
          savingsTarget: Number(item.savings_target) || 0,
          net: Number(item.net) || 0,
        })),
      );
    } catch {
      // Trends are non-critical
    }
  }, []);

  // Handle period change from MonthSelector
  const handlePeriodChange = useCallback(
    async (year: number, month: number) => {
      setSelectedPeriod({ year, month });
      await fetchMonthlyIncome(year, month);
    },
    [fetchMonthlyIncome],
  );

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch user data
      const userData = await authApi.getMe();
      setUser(userData);

      // Set income from user defaults initially
      setIncome({
        amount: Number(userData.monthly_income) || 0,
        savings: Number(userData.savings_target) || 0,
        currency: userData.currency,
      });

      // Fetch categories, buckets, transactions, monthly income, and trends in parallel
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const [
        categoriesData,
        bucketsData,
        transactionsData,
        monthlyData,
        trendsResponse,
      ] = await Promise.all([
        categoriesApi.getAll(),
        bucketsApi.getAll(),
        transactionsApi.getAll(),
        monthlyIncomeApi.get(currentYear, currentMonth).catch(() => null),
        monthlyIncomeApi.getTrends(6).catch(() => ({ data: [] })),
      ]);

      // Set monthly income for current period (overrides user defaults)
      if (monthlyData) {
        setIncome({
          amount: Number(monthlyData.amount) || 0,
          savings: Number(monthlyData.savings_target) || 0,
        });
      }

      // Set trend data
      setTrendData(
        (trendsResponse.data || []).map((item: Record<string, unknown>) => ({
          year: item.year as number,
          month: item.month as number,
          income: Number(item.income) || 0,
          expenses: Number(item.expenses) || 0,
          savingsTarget: Number(item.savings_target) || 0,
          net: Number(item.net) || 0,
        })),
      );

      setCategories(categoriesData.map(transformCategory));

      // Transform buckets and calculate actual spent from transactions
      const transformedBuckets = bucketsData.map(transformBucket);
      const transformedTransactions =
        transactionsData.map(transformTransaction);

      // Calculate actual spent per bucket (expenses add, income subtracts)
      const bucketSpending: Record<string, number> = {};
      transformedTransactions.forEach((tx: Transaction) => {
        if (tx.bucketId) {
          if (tx.type === "expense") {
            bucketSpending[tx.bucketId] =
              (bucketSpending[tx.bucketId] || 0) + tx.amount;
          } else if (tx.type === "income") {
            bucketSpending[tx.bucketId] =
              (bucketSpending[tx.bucketId] || 0) - tx.amount;
          }
        }
      });

      setBuckets(
        transformedBuckets.map((b: Bucket) => ({
          ...b,
          actual: Math.max(0, bucketSpending[b.id] || 0),
        })),
      );

      setTransactions(transformedTransactions);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth status and fetch data on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (getAccessToken()) {
        try {
          await fetchData();
          setIsAuthenticated(true);
        } catch {
          clearTokens();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [fetchData]);

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      await authApi.login(email, password);
      await fetchData();
      setIsAuthenticated(true);
      showToast("Welcome back!", "success");
    } catch (error) {
      throw error;
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string,
  ) => {
    try {
      await authApi.register(name, email, password);
      // Auto-login after registration
      await authApi.login(email, password);
      await fetchData();
      setIsAuthenticated(true);
      showToast("Account created successfully!", "success");
    } catch (error) {
      throw error;
    }
  };

  const handleForgotPassword = async (_email: string) => {
    // Backend doesn't have this yet - show message
    showToast("Password reset is not yet implemented", "info");
  };

  const handleSocialLogin = async (
    provider: "google" | "facebook" | "apple",
  ) => {
    showToast(`${provider} login is not yet implemented`, "info");
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAuthPage("login");
    setBuckets([]);
    setCategories([]);
    setTransactions([]);
    showToast("Signed out successfully", "info");
  };

  // Delete bucket
  const deleteBucket = async (id: string) => {
    try {
      await bucketsApi.delete(id);
      setBuckets(buckets.filter((bucket) => bucket.id !== id));
      showToast("Bucket deleted", "info");
    } catch {
      showToast("Failed to delete bucket", "error");
    }
  };

  // Edit bucket
  const handleEditBucket = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setNewBucket({
      name: bucket.name,
      allocated: bucket.allocated,
      categoryId: bucket.categoryId,
    });
    setIsBucketModalOpen(true);
  };

  // Save bucket (create or update)
  const saveBucket = async () => {
    if (newBucket.name && newBucket.allocated > 0) {
      try {
        if (editingBucket) {
          // Update existing bucket
          const updated = await bucketsApi.update(editingBucket.id, {
            name: newBucket.name,
            allocated: newBucket.allocated,
            category_id: newBucket.categoryId || undefined,
          });
          const bucket = transformBucket(updated);
          setBuckets(
            buckets.map((b) =>
              b.id === editingBucket.id ? { ...bucket, actual: b.actual } : b,
            ),
          );
          showToast("Bucket updated successfully!");
        } else {
          // Create new bucket
          const created = await bucketsApi.create({
            name: newBucket.name,
            allocated: newBucket.allocated,
            category_id: newBucket.categoryId || undefined,
          });
          const bucket = transformBucket(created);
          setBuckets([...buckets, { ...bucket, actual: 0 }]);
          showToast("Bucket created successfully!");
        }
        setNewBucket({ name: "", allocated: 0, categoryId: "" });
        setEditingBucket(undefined);
        setIsBucketModalOpen(false);
      } catch {
        showToast(
          editingBucket ? "Failed to update bucket" : "Failed to create bucket",
          "error",
        );
      }
    }
  };

  // Cancel bucket editing
  const cancelBucketEdit = () => {
    setNewBucket({ name: "", allocated: 0, categoryId: "" });
    setEditingBucket(undefined);
    setIsBucketModalOpen(false);
  };

  // Transfer between buckets
  const handleTransfer = async () => {
    if (transfer.fromBucketId && transfer.toBucketId && transfer.amount > 0) {
      const fromBucket = buckets.find((b) => b.id === transfer.fromBucketId);
      const toBucket = buckets.find((b) => b.id === transfer.toBucketId);

      if (!fromBucket || !toBucket) {
        showToast("Invalid buckets selected", "error");
        return;
      }

      try {
        // Update both buckets' allocated amounts
        await Promise.all([
          bucketsApi.update(fromBucket.id, {
            allocated: fromBucket.allocated - transfer.amount,
          }),
          bucketsApi.update(toBucket.id, {
            allocated: toBucket.allocated + transfer.amount,
          }),
        ]);

        // Update local state
        setBuckets(
          buckets.map((b) => {
            if (b.id === fromBucket.id) {
              return { ...b, allocated: b.allocated - transfer.amount };
            }
            if (b.id === toBucket.id) {
              return { ...b, allocated: b.allocated + transfer.amount };
            }
            return b;
          }),
        );

        // Add to transfer history
        setTransferHistory((prev) => [
          {
            id: Date.now().toString(),
            fromBucketName: fromBucket.name,
            toBucketName: toBucket.name,
            amount: transfer.amount,
            date: new Date(),
          },
          ...prev,
        ]);

        showToast(`Transferred successfully!`, "success");
        setTransfer({ fromBucketId: "", toBucketId: "", amount: 0 });
        setTransferMode(null);
        setTransferContextBucket(null);
        setIsTransferModalOpen(false);
      } catch {
        showToast("Failed to transfer", "error");
      }
    }
  };

  // Handle "Transfer to" from bucket context menu
  const handleTransferTo = (bucket: Bucket) => {
    setTransferMode("to");
    setTransferContextBucket(bucket);
    setTransfer({ fromBucketId: bucket.id, toBucketId: "", amount: 0 });
    setIsTransferModalOpen(true);
  };

  // Handle "Receive from" from bucket context menu
  const handleReceiveFrom = (bucket: Bucket) => {
    setTransferMode("from");
    setTransferContextBucket(bucket);
    setTransfer({ fromBucketId: "", toBucketId: bucket.id, amount: 0 });
    setIsTransferModalOpen(true);
  };

  // Close transfer modal and reset state
  const closeTransferModal = () => {
    setTransfer({ fromBucketId: "", toBucketId: "", amount: 0 });
    setTransferMode(null);
    setTransferContextBucket(null);
    setIsTransferModalOpen(false);
  };

  // Category CRUD
  const handleSaveCategory = async (data: NewCategoryForm) => {
    try {
      if (editingCategory) {
        const updated = await categoriesApi.update(editingCategory.id, {
          name: data.name,
          color: data.color,
          icon: data.icon,
          type: data.type,
        });
        setCategories(
          categories.map((c) =>
            c.id === editingCategory.id ? transformCategory(updated) : c,
          ),
        );
        showToast("Category updated successfully!");
      } else {
        const created = await categoriesApi.create({
          name: data.name,
          color: data.color,
          icon: data.icon,
          type: data.type,
        });
        setCategories([...categories, transformCategory(created)]);
        showToast("Category created successfully!");
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(undefined);
    } catch {
      showToast("Failed to save category", "error");
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteConfirm({ type: "category", item: category });
  };

  const confirmDeleteCategory = async () => {
    if (deleteConfirm?.type === "category") {
      const category = deleteConfirm.item as Category;
      try {
        await categoriesApi.delete(category.id);
        setCategories(categories.filter((c) => c.id !== category.id));
        showToast("Category deleted", "info");
      } catch {
        showToast("Failed to delete category", "error");
      }
    }
    setDeleteConfirm(null);
  };

  // Transaction CRUD
  const saveTransaction = async (data: NewTransactionForm): Promise<boolean> => {
    try {
      const apiData = {
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date.toISOString().split("T")[0],
        category_id: data.categoryId || undefined,
        bucket_id: data.bucketId || undefined,
        notes: data.notes,
      };

      if (editingTransaction) {
        const updated = await transactionsApi.update(
          editingTransaction.id,
          apiData,
        );
        const transformedTx = transformTransaction(updated);
        setTransactions((prevTxs) => {
          const newTxs = prevTxs.map((t) =>
            t.id === editingTransaction.id ? transformedTx : t,
          );
          // React 18 automatically batches this setState call
          queueMicrotask(() => {
            setBuckets((prevBuckets) =>
              recalculateBucketSpending(newTxs, prevBuckets),
            );
          });
          return newTxs;
        });
        showToast("Transaction updated successfully!");
      } else {
        const created = await transactionsApi.create(apiData);
        const newTransaction = transformTransaction(created);
        setTransactions((prevTxs) => {
          const newTxs = [...prevTxs, newTransaction];
          // React 18 automatically batches this setState call
          queueMicrotask(() => {
            setBuckets((prevBuckets) =>
              recalculateBucketSpending(newTxs, prevBuckets),
            );
          });
          return newTxs;
        });
        showToast("Transaction added successfully!");
      }

      // Refresh trend data to keep charts in sync
      fetchTrends();
      return true;
    } catch {
      showToast("Failed to save transaction", "error");
      return false;
    }
  };

  const handleSaveTransaction = async (data: NewTransactionForm) => {
    const success = await saveTransaction(data);
    if (success) {
      setIsTransactionModalOpen(false);
      setEditingTransaction(undefined);
    }
  };

  const handleSaveAndAddAnother = async (data: NewTransactionForm) => {
    await saveTransaction(data);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    setDeleteConfirm({ type: "transaction", item: transaction });
  };

  const confirmDeleteTransaction = async () => {
    if (deleteConfirm?.type === "transaction") {
      const transaction = deleteConfirm.item as Transaction;
      try {
        await transactionsApi.delete(transaction.id);
        let updatedTransactions: Transaction[] = [];
        setTransactions((prev) => {
          updatedTransactions = prev.filter(
            (t) => t.id !== transaction.id,
          );
          return updatedTransactions;
        });

        // Recalculate all bucket spending
        setBuckets((prevBuckets) =>
          recalculateBucketSpending(updatedTransactions, prevBuckets),
        );

        showToast("Transaction deleted", "info");
      } catch {
        showToast("Failed to delete transaction", "error");
      }
    }
    setDeleteConfirm(null);
  };

  // Update income settings (saves to both user defaults and current month)
  const handleUpdateIncome = async (newIncome: Income) => {
    try {
      await Promise.all([
        usersApi.updateMe({
          monthly_income: newIncome.amount,
          savings_target: newIncome.savings,
        }),
        monthlyIncomeApi.update(selectedPeriod.year, selectedPeriod.month, {
          amount: newIncome.amount,
          savings_target: newIncome.savings,
        }),
      ]);
      setIncome(newIncome);
      fetchTrends(); // Refresh trend data
      showToast("Settings updated!", "success");
    } catch {
      showToast("Failed to update settings", "error");
    }
  };

  // Filtered buckets
  const filteredBuckets = buckets.filter((bucket) => {
    const matchesSearch = bucket.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !categoryFilter || bucket.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description
      .toLowerCase()
      .includes(txSearchQuery.toLowerCase());
    const matchesCategory =
      !txCategoryFilter || tx.categoryId === txCategoryFilter;
    const matchesType = !txTypeFilter || tx.type === txTypeFilter;
    const txDate = new Date(tx.date);
    const matchesDateStart =
      !txDateRange.start || txDate >= new Date(txDateRange.start);
    const matchesDateEnd =
      !txDateRange.end || txDate <= new Date(txDateRange.end);
    return (
      matchesSearch &&
      matchesCategory &&
      matchesType &&
      matchesDateStart &&
      matchesDateEnd
    );
  });

  // Transactions filtered to the selected period (for dashboard)
  const periodTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return (
      txDate.getFullYear() === selectedPeriod.year &&
      txDate.getMonth() + 1 === selectedPeriod.month
    );
  });

  // Computed values for dashboard
  const totalAllocated = buckets.reduce(
    (sum, bucket) => sum + bucket.allocated,
    0,
  );
  const periodSpent = periodTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpent = periodSpent;
  const remaining = income.amount - totalAllocated;

  // Active categories (not deleted)
  const activeCategories = categories.filter((c) => !c.isDeleted);

  const categoryData = activeCategories.map((category) => {
    const categoryBuckets = buckets.filter(
      (bucket) => bucket.categoryId === category.id,
    );
    const catAllocated = categoryBuckets.reduce(
      (sum, bucket) => sum + bucket.allocated,
      0,
    );
    const catActual = categoryBuckets.reduce(
      (sum, bucket) => sum + bucket.actual,
      0,
    );

    return {
      name: category.name,
      allocated: catAllocated,
      actual: catActual,
      percentage:
        income.amount > 0
          ? ((catAllocated / income.amount) * 100).toFixed(1)
          : "0",
      color: category.color,
    };
  });

  // Show loading state
  if (isLoading && isAuthenticated) {
    return (
      <div
        className="app-layout"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="spinner"
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(139, 92, 246, 0.2)",
              borderTop: "4px solid #8b5cf6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#9ca3af" }}>Loading your budget...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Show auth pages if not authenticated
  if (!isAuthenticated) {
    if (authPage === "signup") {
      return (
        <SignUp
          onSignUp={handleSignUp}
          onNavigate={() => setAuthPage("login")}
          onSocialLogin={handleSocialLogin}
        />
      );
    }

    if (authPage === "forgot") {
      return (
        <ForgotPassword
          onResetPassword={handleForgotPassword}
          onNavigate={() => setAuthPage("login")}
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
                <p className="page-subtitle">
                  {user?.name
                    ? `Welcome, ${user.name}!`
                    : "Track your budget allocation and spending"}
                </p>
              </div>

              {/* Month Selector */}
              <MonthSelector
                year={selectedPeriod.year}
                month={selectedPeriod.month}
                onChange={handlePeriodChange}
                income={income}
                onUpdateIncome={handleUpdateIncome}
              />

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
                  subtitle="of income"
                  delay={150}
                  valueLabel="Target"
                  remainingLabel="Available to Spend"
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
                <DonutChart data={categoryData} unallocated={remaining} />
                <RecentTransactions
                  transactions={periodTransactions}
                  categories={categories}
                  onViewAll={() => setActiveTab("transactions")}
                  limit={5}
                />
              </div>

              {/* Monthly Trends */}
              {trendData.length > 0 ? (
                <MonthlyTrendChart data={trendData} />
              ) : (
                <SpendingTrend transactions={periodTransactions} days={7} />
              )}
            </div>
          )}

          {/* Buckets Tab */}
          {activeTab === "buckets" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Buckets</h1>
                <p className="page-subtitle">
                  Manage your budget buckets and allocations
                </p>
              </div>

              {/* Budget Summary */}
              <div className="budget-summary glass-card">
                <div className="budget-summary-stats">
                  <div>
                    <span className="budget-summary-label">Total Income</span>
                    <div className="budget-summary-value">
                      {formatCurrency(income.amount)}
                    </div>
                  </div>
                  <div>
                    <span className="budget-summary-label">Allocated</span>
                    <div className="budget-summary-value budget-summary-value--allocated">
                      {formatCurrency(totalAllocated)}
                    </div>
                  </div>
                  <div>
                    <span className="budget-summary-label">Unallocated</span>
                    <div className={`budget-summary-value ${
                      remaining > 0
                        ? "budget-summary-value--positive"
                        : remaining < 0
                          ? "budget-summary-value--negative"
                          : ""
                    }`}>
                      {formatCurrency(remaining)}
                    </div>
                  </div>
                </div>
                {remaining > 0 && (
                  <div className="budget-summary-badge budget-summary-badge--positive">
                    {formatCurrency(remaining)} available for new buckets
                  </div>
                )}
                {remaining < 0 && (
                  <div className="budget-summary-badge budget-summary-badge--negative">
                    Over-allocated by {formatCurrency(Math.abs(remaining))}
                  </div>
                )}
              </div>

              {/* Filter Bar */}
              <FilterBar
                filters={[
                  {
                    id: "category",
                    label: "All Categories",
                    options: activeCategories.map((c) => ({
                      id: c.id,
                      label: c.name,
                    })),
                    value: categoryFilter,
                    onChange: setCategoryFilter,
                  },
                ]}
                searchPlaceholder="Search buckets..."
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                onAddClick={() => {
                  setEditingBucket(undefined);
                  setNewBucket({ name: "", allocated: 0, categoryId: "" });
                  setIsBucketModalOpen(true);
                }}
                addButtonText="Add Bucket"
              />

              {/* Buckets Table */}
              <BucketTable
                buckets={filteredBuckets}
                categories={categories}
                income={income}
                onDelete={deleteBucket}
                onEdit={handleEditBucket}
                onTransferTo={handleTransferTo}
                onReceiveFrom={handleReceiveFrom}
                title="Budget Management"
                subtitle={`${filteredBuckets.length} buckets found`}
              />

              {/* Transfer History */}
              {transferHistory.length > 0 && (
                <div
                  className="transfer-history glass-card"
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem 1.5rem",
                    borderRadius: "0.75rem",
                    cursor: "default",
                    userSelect: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        margin: 0,
                      }}
                    >
                      Transfer History
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontWeight: 400,
                        }}
                      >
                        ({transferHistory.length} transfers)
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setTransferHistory([])}
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        background: "rgba(252, 165, 165, 0.1)",
                        border: "1px solid rgba(252, 165, 165, 0.2)",
                        borderRadius: "0.25rem",
                        color: "#fca5a5",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Clear History
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {transferHistory.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.75rem 1rem",
                          background: "rgba(255, 255, 255, 0.02)",
                          borderRadius: "0.5rem",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "rgba(139, 92, 246, 0.15)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#a78bfa",
                              fontSize: "0.875rem",
                            }}
                          >
                            →
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--text-primary)",
                              }}
                            >
                              <span style={{ color: "#fca5a5" }}>
                                {item.fromBucketName}
                              </span>
                              {" → "}
                              <span style={{ color: "#6ee7b7" }}>
                                {item.toBucketName}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {item.date.toDateString() ===
                              new Date().toDateString()
                                ? `Today at ${item.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                : item.date.toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                  }) +
                                  " at " +
                                  item.date.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#a78bfa",
                          }}
                        >
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {transferHistory.length > 5 && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "0.75rem",
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      +{transferHistory.length - 5} more transfers
                    </div>
                  )}
                </div>
              )}
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
              <TransactionSummary transactions={filteredTransactions} monthlyIncome={income.amount} />

              {/* Transaction List */}
              {filteredTransactions.length > 0 ? (
                <TransactionList
                  transactions={filteredTransactions}
                  categories={categories}
                  buckets={buckets}
                  monthlyIncome={income.amount}
                  selectedPeriod={selectedPeriod}
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
              onUpdateIncome={handleUpdateIncome}
              user={user ? { name: user.name, email: user.email } : undefined}
              onLogout={handleLogout}
              selectedPeriod={selectedPeriod}
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
          buckets={buckets}
          onSave={handleSaveTransaction}
          onSaveAndAddAnother={handleSaveAndAddAnother}
          onCancel={() => {
            setIsTransactionModalOpen(false);
            setEditingTransaction(undefined);
          }}
        />
      </Modal>

      {/* Bucket Edit Modal */}
      <Modal
        isOpen={isBucketModalOpen}
        onClose={cancelBucketEdit}
        title={editingBucket ? "Edit Bucket" : "Add Bucket"}
        size="md"
      >
        <div className="bucket-edit-form">
          <div className="form-group">
            <label className="form-label">Bucket Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Groceries"
              value={newBucket.name}
              onChange={(e) =>
                setNewBucket({ ...newBucket, name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Allocated Amount</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={newBucket.allocated || ""}
              onChange={(e) =>
                setNewBucket({
                  ...newBucket,
                  allocated: Number(e.target.value),
                })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={newBucket.categoryId}
              onChange={(e) =>
                setNewBucket({ ...newBucket, categoryId: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {activeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelBucketEdit}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveBucket}
              disabled={!newBucket.name || newBucket.allocated <= 0}
            >
              {editingBucket ? "Update Bucket" : "Create Bucket"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={closeTransferModal}
        title={
          transferMode === "to" && transferContextBucket
            ? `Transfer from ${transferContextBucket.name}`
            : transferMode === "from" && transferContextBucket
              ? `Receive into ${transferContextBucket.name}`
              : "Transfer Between Buckets"
        }
        size="md"
      >
        <div className="bucket-edit-form">
          {/* Context info */}
          {transferContextBucket && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(167, 139, 250, 0.1)",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              {transferMode === "to" ? (
                <>
                  Transferring <strong>from</strong>{" "}
                  <span style={{ color: "#a78bfa" }}>
                    {transferContextBucket.name}
                  </span>{" "}
                  ({formatCurrency(transferContextBucket.allocated)} allocated)
                </>
              ) : (
                <>
                  Receiving <strong>into</strong>{" "}
                  <span style={{ color: "#a78bfa" }}>
                    {transferContextBucket.name}
                  </span>{" "}
                  ({formatCurrency(transferContextBucket.allocated)} allocated)
                </>
              )}
            </div>
          )}

          {/* From Bucket - only show selector if not in 'to' mode */}
          {transferMode !== "to" && (
            <div className="form-group">
              <label className="form-label">From Bucket</label>
              <select
                className="form-select"
                value={transfer.fromBucketId}
                onChange={(e) =>
                  setTransfer({ ...transfer, fromBucketId: e.target.value })
                }
              >
                <option value="">Select source bucket...</option>
                {buckets
                  .filter((b) => b.id !== transfer.toBucketId)
                  .map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name} ({formatCurrency(bucket.allocated)}{" "}
                      allocated)
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* To Bucket - only show selector if not in 'from' mode */}
          {transferMode !== "from" && (
            <div className="form-group">
              <label className="form-label">To Bucket</label>
              <select
                className="form-select"
                value={transfer.toBucketId}
                onChange={(e) =>
                  setTransfer({ ...transfer, toBucketId: e.target.value })
                }
              >
                <option value="">Select destination bucket...</option>
                {buckets
                  .filter((b) => b.id !== transfer.fromBucketId)
                  .map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name} ({formatCurrency(bucket.allocated)}{" "}
                      allocated)
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Amount to Transfer</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={transfer.amount || ""}
              onChange={(e) =>
                setTransfer({ ...transfer, amount: Number(e.target.value) })
              }
            />
            {transfer.fromBucketId && (
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <small style={{ color: "var(--text-muted)" }}>
                  Available:{" "}
                  {formatCurrency(
                    buckets.find((b) => b.id === transfer.fromBucketId)
                      ?.allocated || 0,
                  )}
                </small>
                <button
                  type="button"
                  style={{
                    padding: "0.25rem 0.5rem",
                    fontSize: "0.75rem",
                    background: "rgba(110, 231, 183, 0.15)",
                    border: "1px solid rgba(110, 231, 183, 0.3)",
                    borderRadius: "0.25rem",
                    color: "#6ee7b7",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    const fromBucket = buckets.find(
                      (b) => b.id === transfer.fromBucketId,
                    );
                    if (fromBucket) {
                      setTransfer({
                        ...transfer,
                        amount: fromBucket.allocated,
                      });
                    }
                  }}
                >
                  Transfer All
                </button>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeTransferModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleTransfer}
              disabled={
                !transfer.fromBucketId ||
                !transfer.toBucketId ||
                transfer.amount <= 0
              }
            >
              Transfer
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={
          deleteConfirm?.type === "category"
            ? confirmDeleteCategory
            : confirmDeleteTransaction
        }
        title={`Delete ${deleteConfirm?.type === "category" ? "Category" : "Transaction"}`}
        message={
          deleteConfirm?.type === "category"
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
