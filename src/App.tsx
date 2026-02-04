import { useState, useCallback, useEffect } from "react";
import { Users, FolderOpen, Receipt } from "lucide-react";

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

// Types
import type { Bucket } from "./types";

// Hooks
import {
  useToast,
  useAuth,
  useBudgetData,
  useBucketActions,
  useCategoryActions,
  useTransactionActions,
} from "./hooks";

import { usersApi } from "./services/api";
import { getCurrentPayCycle } from "./utils/payCycle";

// Context
import { useTheme } from "./context/ThemeContext";

// Simple hook for tab navigation and bucket page filters
function useBucketFilters(buckets: Bucket[]) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "over" | "within" | ""

  const filteredBuckets = buckets.filter((bucket) => {
    const matchesSearch = bucket.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || bucket.categoryId === categoryFilter;
    const matchesStatus = !statusFilter ||
      (statusFilter === "over" && bucket.actual > bucket.allocated) ||
      (statusFilter === "within" && bucket.actual <= bucket.allocated);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return { activeTab, setActiveTab, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter, filteredBuckets };
}

const BudgetingApp = () => {
  const { formatCurrency } = useTheme();

  // Toast notifications
  const { toast, showToast, hideToast } = useToast();

  // Core budget data (state, fetching, computed values)
  const budgetData = useBudgetData({ showToast });

  const {
    income,
    buckets,
    setBuckets,
    categories,
    transactions,
    payDate,
    setPayDate,
    selectedPeriod,
    trendData,
    recentTxLimit,
    fetchData,
    fetchTrends,
    handlePeriodChange,
    handleUpdateIncome,
    recalculateBucketSpending,
    totalAllocated,
    periodTransactions,
    totalSpent,
    remaining,
    activeCategories,
  } = budgetData;

  // Auth
  const stableFetchData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const auth = useAuth({
    onAuthenticated: stableFetchData,
    showToast,
    onLogoutCleanup: () => {
      budgetData.setBuckets([]);
      budgetData.setCategories([]);
      budgetData.setTransactions([]);
    },
  });

  // Tab navigation and bucket filters
  const nav = useBucketFilters(buckets);

  // Scroll to top when switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [nav.activeTab]);

  // Always start at dashboard after login
  useEffect(() => {
    if (auth.isAuthenticated) {
      nav.setActiveTab("dashboard");
    }
  }, [auth.isAuthenticated]);

  // Bucket CRUD + transfers
  const bucketActions = useBucketActions({
    buckets,
    setBuckets,
    showToast,
    formatCurrency,
  });

  // Category CRUD
  const categoryActions = useCategoryActions({
    categories,
    setCategories: budgetData.setCategories,
    showToast,
  });

  // Transaction CRUD + filters
  const txActions = useTransactionActions({
    transactions,
    setTransactions: budgetData.setTransactions,
    setBuckets,
    recalculateBucketSpending,
    fetchTrends,
    showToast,
  });

  const filteredTransactions = txActions.filterTransactions(transactions);

  // Category data for donut chart
  const categoryData = activeCategories.map((category) => {
    const categoryBuckets = buckets.filter((b) => b.categoryId === category.id);
    const catAllocated = categoryBuckets.reduce((sum, b) => sum + b.allocated, 0);
    const catActual = categoryBuckets.reduce((sum, b) => sum + b.actual, 0);
    return {
      name: category.name,
      allocated: catAllocated,
      actual: catActual,
      percentage: income.amount > 0 ? ((catAllocated / income.amount) * 100).toFixed(1) : "0",
      color: category.color,
    };
  });

  // Loading state
  if (auth.isLoading && auth.isAuthenticated) {
    return (
      <div
        className="app-layout"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}
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

  // Auth pages
  if (!auth.isAuthenticated) {
    if (auth.authPage === "signup") {
      return <SignUp onSignUp={auth.handleSignUp} onNavigate={() => auth.setAuthPage("login")} />;
    }
    if (auth.authPage === "forgot") {
      return (
        <ForgotPassword
          onResetPassword={auth.handleForgotPassword}
          onNavigate={() => auth.setAuthPage("login")}
        />
      );
    }
    return <Login onLogin={auth.handleLogin} onNavigate={(page) => auth.setAuthPage(page)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={nav.activeTab}
        setActiveTab={nav.setActiveTab}
        appName="MyBudgeting App"
        subtitle="Personal Finance"
        onLogout={auth.handleLogout}
      />

      <main className="main-content">
        <div className="content-wrapper">
          {/* Dashboard Tab */}
          {nav.activeTab === "dashboard" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">
                  {auth.user?.name ? `Welcome, ${auth.user.name}!` : "Track your budget allocation and spending"}
                </p>
              </div>

              <MonthSelector
                year={selectedPeriod.year}
                month={selectedPeriod.month}
                onChange={handlePeriodChange}
                payDate={payDate}
                income={income}
                onUpdateIncome={handleUpdateIncome}
              />

              <div className="dashboard-top-cards">
                <StatCard
                  title="Total Spent"
                  value={totalSpent}
                  total={income.amount}
                  icon={Users}
                  gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                  subtitle="spent this month"
                  delay={0}
                />

                <div className="over-budget-alerts glass-card">
                  <h3 className="over-budget-title">Over Budget Alerts</h3>
                  {buckets.filter((b) => b.actual > b.allocated).length === 0 ? (
                    <div className="over-budget-empty">
                      <p>All buckets are within budget!</p>
                    </div>
                  ) : (
                    <div className="over-budget-list">
                      {buckets
                        .filter((b) => b.actual > b.allocated)
                        .sort((a, b) => b.actual - b.allocated - (a.actual - a.allocated))
                        .map((bucket) => {
                          const overage = bucket.actual - bucket.allocated;
                          const percentage =
                            bucket.allocated > 0 ? ((overage / bucket.allocated) * 100).toFixed(0) : "100";
                          return (
                            <div key={bucket.id} className="over-budget-item">
                              <div className="over-budget-item-left">
                                <span className="over-budget-bucket-name">{bucket.name}</span>
                                <span className="over-budget-amounts">
                                  {formatCurrency(bucket.actual)} / {formatCurrency(bucket.allocated)}
                                </span>
                              </div>
                              <div className="over-budget-item-right">
                                <span className="over-budget-overage">+{formatCurrency(overage)}</span>
                                <span className="over-budget-percentage">{percentage}% over</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-grid">
                <DonutChart data={categoryData} unallocated={remaining} />
                <RecentTransactions
                  transactions={periodTransactions}
                  categories={categories}
                  onViewAll={() => nav.setActiveTab("transactions")}
                  onEdit={txActions.handleEditTransaction}
                  limit={recentTxLimit}
                  monthlyIncome={income.amount}
                />
              </div>

              {trendData.length > 0 ? (
                <MonthlyTrendChart data={trendData} />
              ) : (
                <SpendingTrend transactions={periodTransactions} days={7} />
              )}
            </div>
          )}

          {/* Buckets Tab */}
          {nav.activeTab === "buckets" && (() => {
            // Compute category-specific totals when filtering by category
            const selectedCategory = nav.categoryFilter
              ? activeCategories.find((c) => c.id === nav.categoryFilter)
              : null;
            const categoryBuckets = nav.categoryFilter
              ? buckets.filter((b) => b.categoryId === nav.categoryFilter)
              : buckets;
            const catAllocated = categoryBuckets.reduce((sum, b) => sum + b.allocated, 0);
            const catSpent = categoryBuckets.reduce((sum, b) => sum + b.actual, 0);
            const catRemaining = catAllocated - catSpent;

            return (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Buckets</h1>
                <p className="page-subtitle">Manage your budget buckets and allocations</p>
              </div>

              {/* Global budget summary - shown when no category filter */}
              {!nav.categoryFilter && (
                <div className="budget-summary glass-card">
                  <div className="budget-summary-stats">
                    <div>
                      <span className="budget-summary-label">Total Income</span>
                      <div className="budget-summary-value">{formatCurrency(income.amount)}</div>
                    </div>
                    <div>
                      <span className="budget-summary-label">Allocated</span>
                      <div className="budget-summary-value budget-summary-value--allocated">
                        {formatCurrency(totalAllocated)}
                      </div>
                    </div>
                    <div>
                      <span className="budget-summary-label">Unallocated</span>
                      <div
                        className={`budget-summary-value ${
                          remaining > 0
                            ? "budget-summary-value--positive"
                            : remaining < 0
                              ? "budget-summary-value--negative"
                              : ""
                        }`}
                      >
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
              )}

              {/* Category-specific summary - shown when category filter is active */}
              {nav.categoryFilter && selectedCategory && (
                <div className="budget-summary glass-card" style={{ borderLeft: `3px solid ${selectedCategory.color}` }}>
                  <div className="budget-summary-stats">
                    <div>
                      <span className="budget-summary-label">{selectedCategory.name} Allocated</span>
                      <div className="budget-summary-value budget-summary-value--allocated">
                        {formatCurrency(catAllocated)}
                      </div>
                    </div>
                    <div>
                      <span className="budget-summary-label">Spent</span>
                      <div className="budget-summary-value">{formatCurrency(catSpent)}</div>
                    </div>
                    <div>
                      <span className="budget-summary-label">Remaining</span>
                      <div
                        className={`budget-summary-value ${
                          catRemaining > 0
                            ? "budget-summary-value--positive"
                            : catRemaining < 0
                              ? "budget-summary-value--negative"
                              : ""
                        }`}
                      >
                        {formatCurrency(catRemaining)}
                      </div>
                    </div>
                  </div>
                  {catRemaining > 0 && (
                    <div className="budget-summary-badge budget-summary-badge--positive">
                      {formatCurrency(catRemaining)} left in {selectedCategory.name}
                    </div>
                  )}
                  {catRemaining < 0 && (
                    <div className="budget-summary-badge budget-summary-badge--negative">
                      {selectedCategory.name} over budget by {formatCurrency(Math.abs(catRemaining))}
                    </div>
                  )}
                </div>
              )}

              <FilterBar
                filters={[
                  {
                    id: "category",
                    label: "All Categories",
                    options: activeCategories.map((c) => ({ id: c.id, label: c.name })),
                    value: nav.categoryFilter,
                    onChange: nav.setCategoryFilter,
                  },
                  {
                    id: "status",
                    label: "All Status",
                    options: [
                      { id: "over", label: "Over Budget" },
                      { id: "within", label: "Within Budget" },
                    ],
                    value: nav.statusFilter,
                    onChange: nav.setStatusFilter,
                  },
                ]}
                searchPlaceholder="Search buckets..."
                searchValue={nav.searchQuery}
                onSearchChange={nav.setSearchQuery}
                onAddClick={bucketActions.openNewBucketModal}
                addButtonText="Add Bucket"
              />

              <BucketTable
                buckets={nav.filteredBuckets}
                categories={categories}
                income={income}
                onDelete={bucketActions.deleteBucket}
                onEdit={bucketActions.handleEditBucket}
                onTransferTo={bucketActions.handleTransferTo}
                onReceiveFrom={bucketActions.handleReceiveFrom}
                title="Budget Management"
                subtitle={`${nav.filteredBuckets.length} buckets found`}
              />

              {/* Transfer History */}
              {bucketActions.transferHistory.length > 0 && (
                <div
                  className="transfer-history glass-card"
                  style={{ marginTop: "1.5rem", padding: "1rem 1.5rem", borderRadius: "0.75rem", cursor: "default", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                      Transfer History
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>
                        ({bucketActions.transferHistory.length} transfers)
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => bucketActions.setTransferHistory([])}
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", background: "rgba(252, 165, 165, 0.1)", border: "1px solid rgba(252, 165, 165, 0.2)", borderRadius: "0.25rem", color: "#fca5a5", cursor: "pointer", transition: "all 0.2s ease" }}
                    >
                      Clear History
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {bucketActions.transferHistory.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "0.5rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(139, 92, 246, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa", fontSize: "0.875rem" }}>
                            →
                          </div>
                          <div>
                            <div style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                              <span style={{ color: "#fca5a5" }}>{item.fromBucketName}</span>
                              {" → "}
                              <span style={{ color: "#6ee7b7" }}>{item.toBucketName}</span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {item.date.toDateString() === new Date().toDateString()
                                ? `Today at ${item.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                : item.date.toLocaleDateString([], { month: "short", day: "numeric" }) +
                                  " at " +
                                  item.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#a78bfa" }}>
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {bucketActions.transferHistory.length > 5 && (
                    <div style={{ textAlign: "center", marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      +{bucketActions.transferHistory.length - 5} more transfers
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          })()}

          {/* Transactions Tab */}
          {nav.activeTab === "transactions" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Transactions</h1>
                <p className="page-subtitle">Track your income and expenses</p>
              </div>

              <TransactionFilters
                categories={categories}
                searchQuery={txActions.txSearchQuery}
                onSearchChange={txActions.setTxSearchQuery}
                categoryFilter={txActions.txCategoryFilter}
                onCategoryChange={txActions.setTxCategoryFilter}
                typeFilter={txActions.txTypeFilter}
                onTypeChange={txActions.setTxTypeFilter}
                dateRange={txActions.txDateRange}
                onDateRangeChange={txActions.setTxDateRange}
                onAddClick={txActions.openNewTransactionModal}
              />

              <TransactionSummary transactions={filteredTransactions} monthlyIncome={income.amount} />

              {filteredTransactions.length > 0 ? (
                <TransactionList
                  transactions={filteredTransactions}
                  categories={categories}
                  buckets={buckets}
                  monthlyIncome={income.amount}
                  selectedPeriod={selectedPeriod}
                  onEdit={txActions.handleEditTransaction}
                  onDelete={txActions.handleDeleteTransaction}
                />
              ) : (
                <EmptyState
                  icon={Receipt}
                  title="No Transactions Yet"
                  description="Start tracking your income and expenses by adding your first transaction."
                  actionLabel="Add Transaction"
                  onAction={txActions.openNewTransactionModal}
                />
              )}
            </div>
          )}

          {/* Categories Tab */}
          {nav.activeTab === "categories" && (
            <div className="page-content">
              <div className="page-header">
                <h1 className="page-title">Categories</h1>
                <p className="page-subtitle">Organize your budget categories</p>
              </div>

              <FilterBar
                searchPlaceholder="Search categories..."
                searchValue=""
                onSearchChange={() => {}}
                onAddClick={categoryActions.openNewCategoryModal}
                addButtonText="Add Category"
              />

              {activeCategories.length > 0 ? (
                <CategoryGrid
                  categories={activeCategories}
                  buckets={buckets}
                  onEdit={categoryActions.handleEditCategory}
                  onDelete={categoryActions.handleDeleteCategory}
                />
              ) : (
                <EmptyState
                  icon={FolderOpen}
                  title="No Categories Yet"
                  description="Create categories to organize your budget buckets and transactions."
                  actionLabel="Add Category"
                  onAction={categoryActions.openNewCategoryModal}
                />
              )}
            </div>
          )}

          {/* Settings Tab */}
          {nav.activeTab === "settings" && (
            <Settings
              user={auth.user ? { name: auth.user.name, email: auth.user.email } : undefined}
              payDate={payDate}
              onUpdatePayDate={async (val: number) => {
                try {
                  await usersApi.updateMe({ pay_date: val });
                  setPayDate(val);
                  // Navigate to the correct current pay cycle for the new pay date
                  const cycle = getCurrentPayCycle(new Date(), val);
                  handlePeriodChange(cycle.year, cycle.month);
                  showToast('Pay date updated!', 'success');
                } catch {
                  showToast('Failed to update pay date', 'error');
                }
              }}
              onLogout={auth.handleLogout}
            />
          )}
        </div>
      </main>

      {/* FAB - available on all tabs except settings */}
      {nav.activeTab !== "settings" && (
        <FAB onClick={txActions.openNewTransactionModal} label="Add Transaction" />
      )}

      {/* Category Modal */}
      <Modal
        isOpen={categoryActions.isCategoryModalOpen}
        onClose={categoryActions.closeCategoryModal}
        title={categoryActions.editingCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <CategoryForm
          category={categoryActions.editingCategory}
          onSave={categoryActions.handleSaveCategory}
          onCancel={categoryActions.closeCategoryModal}
        />
      </Modal>

      {/* Transaction Modal */}
      <Modal
        isOpen={txActions.isTransactionModalOpen}
        onClose={txActions.closeTransactionModal}
        title={txActions.editingTransaction ? "Edit Transaction" : "Add Transaction"}
        size="md"
      >
        <TransactionFormModal
          transaction={txActions.editingTransaction}
          buckets={buckets}
          onSave={txActions.handleSaveTransaction}
          onSaveAndAddAnother={txActions.handleSaveAndAddAnother}
          onCancel={txActions.closeTransactionModal}
          onDelete={
            txActions.editingTransaction
              ? () => {
                  txActions.closeTransactionModal();
                  txActions.handleDeleteTransaction(txActions.editingTransaction!);
                }
              : undefined
          }
        />
      </Modal>

      {/* Bucket Edit Modal */}
      <Modal
        isOpen={bucketActions.isBucketModalOpen}
        onClose={bucketActions.cancelBucketEdit}
        title={bucketActions.editingBucket ? "Edit Bucket" : "Add Bucket"}
        size="md"
      >
        <div className="bucket-edit-form">
          <div className="form-group">
            <label className="form-label">Bucket Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Groceries"
              value={bucketActions.newBucket.name}
              onChange={(e) => bucketActions.setNewBucket({ ...bucketActions.newBucket, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Allocated Amount</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={bucketActions.newBucket.allocated || ""}
              onChange={(e) =>
                bucketActions.setNewBucket({ ...bucketActions.newBucket, allocated: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={bucketActions.newBucket.categoryId}
              onChange={(e) =>
                bucketActions.setNewBucket({ ...bucketActions.newBucket, categoryId: e.target.value })
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
            <button type="button" className="btn btn-secondary" onClick={bucketActions.cancelBucketEdit}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={bucketActions.saveBucket}
              disabled={!bucketActions.newBucket.name || bucketActions.newBucket.allocated <= 0}
            >
              {bucketActions.editingBucket ? "Update Bucket" : "Create Bucket"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        isOpen={bucketActions.isTransferModalOpen}
        onClose={bucketActions.closeTransferModal}
        title={
          bucketActions.transferMode === "to" && bucketActions.transferContextBucket
            ? `Transfer from ${bucketActions.transferContextBucket.name}`
            : bucketActions.transferMode === "from" && bucketActions.transferContextBucket
              ? `Receive into ${bucketActions.transferContextBucket.name}`
              : "Transfer Between Buckets"
        }
        size="md"
      >
        <div className="bucket-edit-form">
          {bucketActions.transferContextBucket && (
            <div style={{ padding: "0.75rem 1rem", background: "rgba(167, 139, 250, 0.1)", borderRadius: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              {bucketActions.transferMode === "to" ? (
                <>
                  Transferring <strong>from</strong>{" "}
                  <span style={{ color: "#a78bfa" }}>{bucketActions.transferContextBucket.name}</span>{" "}
                  ({formatCurrency(bucketActions.transferContextBucket.allocated)} allocated)
                </>
              ) : (
                <>
                  Receiving <strong>into</strong>{" "}
                  <span style={{ color: "#a78bfa" }}>{bucketActions.transferContextBucket.name}</span>{" "}
                  ({formatCurrency(bucketActions.transferContextBucket.allocated)} allocated)
                </>
              )}
            </div>
          )}

          {bucketActions.transferMode !== "to" && (
            <div className="form-group">
              <label className="form-label">From Bucket</label>
              <select
                className="form-select"
                value={bucketActions.transfer.fromBucketId}
                onChange={(e) => bucketActions.setTransfer({ ...bucketActions.transfer, fromBucketId: e.target.value })}
              >
                <option value="">Select source bucket...</option>
                {buckets
                  .filter((b) => b.id !== bucketActions.transfer.toBucketId)
                  .map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name} ({formatCurrency(bucket.allocated)} allocated)
                    </option>
                  ))}
              </select>
            </div>
          )}

          {bucketActions.transferMode !== "from" && (
            <div className="form-group">
              <label className="form-label">To Bucket</label>
              <select
                className="form-select"
                value={bucketActions.transfer.toBucketId}
                onChange={(e) => bucketActions.setTransfer({ ...bucketActions.transfer, toBucketId: e.target.value })}
              >
                <option value="">Select destination bucket...</option>
                {buckets
                  .filter((b) => b.id !== bucketActions.transfer.fromBucketId)
                  .map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name} ({formatCurrency(bucket.allocated)} allocated)
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
              value={bucketActions.transfer.amount || ""}
              onChange={(e) => bucketActions.setTransfer({ ...bucketActions.transfer, amount: Number(e.target.value) })}
            />
            {bucketActions.transfer.fromBucketId && (
              <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <small style={{ color: "var(--text-muted)" }}>
                  Available: {formatCurrency(buckets.find((b) => b.id === bucketActions.transfer.fromBucketId)?.allocated || 0)}
                </small>
                <button
                  type="button"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", background: "rgba(110, 231, 183, 0.15)", border: "1px solid rgba(110, 231, 183, 0.3)", borderRadius: "0.25rem", color: "#6ee7b7", cursor: "pointer", transition: "all 0.2s ease" }}
                  onClick={() => {
                    const fromBucket = buckets.find((b) => b.id === bucketActions.transfer.fromBucketId);
                    if (fromBucket) {
                      bucketActions.setTransfer({ ...bucketActions.transfer, amount: fromBucket.allocated });
                    }
                  }}
                >
                  Transfer All
                </button>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={bucketActions.closeTransferModal}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={bucketActions.handleTransfer}
              disabled={!bucketActions.transfer.fromBucketId || !bucketActions.transfer.toBucketId || bucketActions.transfer.amount <= 0}
            >
              Transfer
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={nav.activeTab} setActiveTab={nav.setActiveTab} />
    </div>
  );
};

export default BudgetingApp;
