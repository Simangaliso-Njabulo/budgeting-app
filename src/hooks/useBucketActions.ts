import { useState, useEffect } from 'react';
import { bucketsApi } from '../services/api';
import type { Bucket } from '../types';
import type { ToastType } from '../components';
import { transformBucket } from './useBudgetData';

interface UseBucketActionsOptions {
  buckets: Bucket[];
  setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>;
  showToast: (message: string, type?: ToastType) => void;
  formatCurrency: (amount: number) => string;
}

export function useBucketActions({ buckets, setBuckets, showToast }: UseBucketActionsOptions) {
  // Bucket editing state
  const [newBucket, setNewBucket] = useState({ name: '', allocated: 0, categoryId: '' });
  const [editingBucket, setEditingBucket] = useState<Bucket | undefined>();
  const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);

  // Transfer state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transfer, setTransfer] = useState({ fromBucketId: '', toBucketId: '', amount: 0 });
  const [transferMode, setTransferMode] = useState<'to' | 'from' | null>(null);
  const [transferContextBucket, setTransferContextBucket] = useState<Bucket | null>(null);

  // Transfer history
  const [transferHistory, setTransferHistory] = useState<
    { id: string; fromBucketName: string; toBucketName: string; amount: number; date: Date }[]
  >(() => {
    try {
      const saved = localStorage.getItem('transferHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(
          (item: { id: string; fromBucketName: string; toBucketName: string; amount: number; date: string }) => ({
            ...item,
            date: new Date(item.date),
          })
        );
      }
    } catch (e) {
      console.error('Failed to load transfer history:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('transferHistory', JSON.stringify(transferHistory));
    } catch (e) {
      console.error('Failed to save transfer history:', e);
    }
  }, [transferHistory]);

  const deleteBucket = async (id: string) => {
    try {
      await bucketsApi.delete(id);
      setBuckets(buckets.filter((bucket) => bucket.id !== id));
      showToast('Bucket deleted', 'info');
    } catch {
      showToast('Failed to delete bucket', 'error');
    }
  };

  const handleEditBucket = (bucket: Bucket) => {
    setEditingBucket(bucket);
    setNewBucket({ name: bucket.name, allocated: bucket.allocated, categoryId: bucket.categoryId });
    setIsBucketModalOpen(true);
  };

  const saveBucket = async () => {
    if (newBucket.name && newBucket.allocated > 0) {
      try {
        if (editingBucket) {
          const updated = await bucketsApi.update(editingBucket.id, {
            name: newBucket.name,
            allocated: newBucket.allocated,
            category_id: newBucket.categoryId || undefined,
          });
          const bucket = transformBucket(updated);
          setBuckets(
            buckets.map((b) => (b.id === editingBucket.id ? { ...bucket, actual: b.actual } : b))
          );
          showToast('Bucket updated successfully!');
        } else {
          const created = await bucketsApi.create({
            name: newBucket.name,
            allocated: newBucket.allocated,
            category_id: newBucket.categoryId || undefined,
          });
          const bucket = transformBucket(created);
          setBuckets([...buckets, { ...bucket, actual: 0 }]);
          showToast('Bucket created successfully!');
        }
        setNewBucket({ name: '', allocated: 0, categoryId: '' });
        setEditingBucket(undefined);
        setIsBucketModalOpen(false);
      } catch {
        showToast(
          editingBucket ? 'Failed to update bucket' : 'Failed to create bucket',
          'error'
        );
      }
    }
  };

  const cancelBucketEdit = () => {
    setNewBucket({ name: '', allocated: 0, categoryId: '' });
    setEditingBucket(undefined);
    setIsBucketModalOpen(false);
  };

  const handleTransfer = async () => {
    if (transfer.fromBucketId && transfer.toBucketId && transfer.amount > 0) {
      const fromBucket = buckets.find((b) => b.id === transfer.fromBucketId);
      const toBucket = buckets.find((b) => b.id === transfer.toBucketId);

      if (!fromBucket || !toBucket) {
        showToast('Invalid buckets selected', 'error');
        return;
      }

      try {
        await Promise.all([
          bucketsApi.update(fromBucket.id, { allocated: fromBucket.allocated - transfer.amount }),
          bucketsApi.update(toBucket.id, { allocated: toBucket.allocated + transfer.amount }),
        ]);

        setBuckets(
          buckets.map((b) => {
            if (b.id === fromBucket.id) return { ...b, allocated: b.allocated - transfer.amount };
            if (b.id === toBucket.id) return { ...b, allocated: b.allocated + transfer.amount };
            return b;
          })
        );

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

        showToast('Transferred successfully!', 'success');
        setTransfer({ fromBucketId: '', toBucketId: '', amount: 0 });
        setTransferMode(null);
        setTransferContextBucket(null);
        setIsTransferModalOpen(false);
      } catch {
        showToast('Failed to transfer', 'error');
      }
    }
  };

  const handleTransferTo = (bucket: Bucket) => {
    setTransferMode('to');
    setTransferContextBucket(bucket);
    setTransfer({ fromBucketId: bucket.id, toBucketId: '', amount: 0 });
    setIsTransferModalOpen(true);
  };

  const handleReceiveFrom = (bucket: Bucket) => {
    setTransferMode('from');
    setTransferContextBucket(bucket);
    setTransfer({ fromBucketId: '', toBucketId: bucket.id, amount: 0 });
    setIsTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setTransfer({ fromBucketId: '', toBucketId: '', amount: 0 });
    setTransferMode(null);
    setTransferContextBucket(null);
    setIsTransferModalOpen(false);
  };

  const openNewBucketModal = () => {
    setEditingBucket(undefined);
    setNewBucket({ name: '', allocated: 0, categoryId: '' });
    setIsBucketModalOpen(true);
  };

  return {
    // Bucket modal state
    newBucket,
    setNewBucket,
    editingBucket,
    isBucketModalOpen,
    saveBucket,
    deleteBucket,
    handleEditBucket,
    cancelBucketEdit,
    openNewBucketModal,

    // Transfer state
    isTransferModalOpen,
    transfer,
    setTransfer,
    transferMode,
    transferContextBucket,
    transferHistory,
    setTransferHistory,
    handleTransfer,
    handleTransferTo,
    handleReceiveFrom,
    closeTransferModal,
  };
}
