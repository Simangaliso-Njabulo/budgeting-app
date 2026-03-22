import { useState } from 'react';
import { transactionService, getCurrentUserId } from '../db';
import type { Transaction, Bucket, NewTransactionForm } from '../types';
import type { ToastType } from '../components';

interface UseTransactionActionsOptions {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>;
  recalculateBucketSpending: (txList: Transaction[], bucketList: Bucket[]) => Bucket[];
  fetchTrends: () => Promise<void>;
  showToast: (message: string, type?: ToastType) => void;
}

export function useTransactionActions({
  setTransactions,
  setBuckets,
  recalculateBucketSpending,
  fetchTrends,
  showToast,
}: UseTransactionActionsOptions) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  // Transaction filter states
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txCategoryFilter, setTxCategoryFilter] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('');
  const [txDateRange, setTxDateRange] = useState({ start: '', end: '' });

  const saveTransaction = async (data: NewTransactionForm): Promise<boolean> => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return false;

      const txData = {
        description: data.description,
        amount: data.amount,
        type: data.type,
        date: data.date.toISOString().split('T')[0],
        categoryId: data.categoryId || undefined,
        bucketId: data.bucketId || undefined,
        notes: data.notes,
      };

      if (editingTransaction) {
        const updatedTx = await transactionService.update(editingTransaction.id, txData);
        setTransactions((prevTxs) => {
          const newTxs = prevTxs.map((t) => (t.id === editingTransaction.id ? updatedTx : t));
          setBuckets((prevBuckets) => recalculateBucketSpending(newTxs, prevBuckets));
          return newTxs;
        });
        showToast('Transaction updated successfully!');
      } else {
        const newTransaction = await transactionService.create(userId, txData);
        setTransactions((prevTxs) => {
          const newTxs = [...prevTxs, newTransaction];
          setBuckets((prevBuckets) => recalculateBucketSpending(newTxs, prevBuckets));
          return newTxs;
        });
        showToast('Transaction added successfully!');
      }

      fetchTrends();
      return true;
    } catch {
      showToast('Failed to save transaction', 'error');
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

  const handleSaveAndAddAnother = async (data: NewTransactionForm): Promise<boolean> => {
    await saveTransaction(data);
    return true;
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      await transactionService.delete(transaction.id);
      let updatedTransactions: Transaction[] = [];
      setTransactions((prev) => {
        updatedTransactions = prev.filter((t) => t.id !== transaction.id);
        return updatedTransactions;
      });
      setBuckets((prevBuckets) => recalculateBucketSpending(updatedTransactions, prevBuckets));
      showToast('Transaction deleted', 'info');
    } catch {
      showToast('Failed to delete transaction', 'error');
    }
  };

  const openNewTransactionModal = () => {
    setEditingTransaction(undefined);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(undefined);
  };

  // Filter function
  const filterTransactions = (transactions: Transaction[]) => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description.toLowerCase().includes(txSearchQuery.toLowerCase());
      const matchesCategory = !txCategoryFilter || tx.categoryId === txCategoryFilter;
      const matchesType = !txTypeFilter || tx.type === txTypeFilter;
      const txDate = new Date(tx.date);
      const matchesDateStart = !txDateRange.start || txDate >= new Date(txDateRange.start);
      const matchesDateEnd = !txDateRange.end || txDate <= new Date(txDateRange.end);
      return matchesSearch && matchesCategory && matchesType && matchesDateStart && matchesDateEnd;
    });
  };

  return {
    editingTransaction,
    isTransactionModalOpen,
    saveTransaction,
    handleSaveTransaction,
    handleSaveAndAddAnother,
    handleEditTransaction,
    handleDeleteTransaction,
    openNewTransactionModal,
    closeTransactionModal,

    // Filter state
    txSearchQuery,
    setTxSearchQuery,
    txCategoryFilter,
    setTxCategoryFilter,
    txTypeFilter,
    setTxTypeFilter,
    txDateRange,
    setTxDateRange,
    filterTransactions,
  };
}
