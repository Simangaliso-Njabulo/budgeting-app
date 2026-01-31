import { useState } from 'react';
import { categoriesApi } from '../services/api';
import type { Category, NewCategoryForm } from '../types';
import type { ToastType } from '../components';
import { transformCategory } from './useBudgetData';

interface UseCategoryActionsOptions {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  showToast: (message: string, type?: ToastType) => void;
}

export function useCategoryActions({ categories, setCategories, showToast }: UseCategoryActionsOptions) {
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
          categories.map((c) => (c.id === editingCategory.id ? transformCategory(updated) : c))
        );
        showToast('Category updated successfully!');
      } else {
        const created = await categoriesApi.create({
          name: data.name,
          color: data.color,
          icon: data.icon,
          type: data.type,
        });
        setCategories([...categories, transformCategory(created)]);
        showToast('Category created successfully!');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(undefined);
    } catch {
      showToast('Failed to save category', 'error');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await categoriesApi.delete(category.id);
      setCategories(categories.filter((c) => c.id !== category.id));
      showToast('Category deleted', 'info');
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  const openNewCategoryModal = () => {
    setEditingCategory(undefined);
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(undefined);
  };

  return {
    editingCategory,
    isCategoryModalOpen,
    handleSaveCategory,
    handleEditCategory,
    handleDeleteCategory,
    openNewCategoryModal,
    closeCategoryModal,
  };
}
