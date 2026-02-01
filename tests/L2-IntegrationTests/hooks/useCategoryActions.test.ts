// tests/L2-IntegrationTests/hooks/useCategoryActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategoryActions } from '../../../src/hooks/useCategoryActions';
import type { Category } from '../../../src/types';

// Mock the API module
vi.mock('../../../src/services/api', () => ({
  categoriesApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the transform function
vi.mock('../../../src/hooks/useBudgetData', () => ({
  transformCategory: vi.fn((cat: Record<string, unknown>) => ({
    id: cat.id as string,
    name: cat.name as string,
    color: cat.color as string,
    icon: cat.icon as string | undefined,
    type: cat.type as 'expense' | 'income' | 'both',
    isDeleted: cat.is_deleted as boolean,
  })),
}));

import { categoriesApi } from '../../../src/services/api';

const mockCategories: Category[] = [
  { id: '1', name: 'Living Expenses', color: '#a78bfa', icon: 'home', type: 'expense' },
  { id: '2', name: 'Entertainment', color: '#6ee7b7', icon: 'entertainment', type: 'expense' },
];

function createHookOptions() {
  return {
    categories: mockCategories,
    setCategories: vi.fn(),
    showToast: vi.fn(),
  };
}

describe('useCategoryActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with no editing category', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useCategoryActions(options));

      expect(result.current.editingCategory).toBeUndefined();
      expect(result.current.isCategoryModalOpen).toBe(false);
    });
  });

  describe('modal management', () => {
    it('opens new category modal', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useCategoryActions(options));

      act(() => {
        result.current.openNewCategoryModal();
      });

      expect(result.current.isCategoryModalOpen).toBe(true);
      expect(result.current.editingCategory).toBeUndefined();
    });

    it('closes category modal', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useCategoryActions(options));

      act(() => {
        result.current.openNewCategoryModal();
      });

      act(() => {
        result.current.closeCategoryModal();
      });

      expect(result.current.isCategoryModalOpen).toBe(false);
    });

    it('opens edit modal with category data', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useCategoryActions(options));

      act(() => {
        result.current.handleEditCategory(mockCategories[0]);
      });

      expect(result.current.isCategoryModalOpen).toBe(true);
      expect(result.current.editingCategory).toEqual(mockCategories[0]);
    });

    it('clears editing category when opening new modal', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useCategoryActions(options));

      // First open edit
      act(() => {
        result.current.handleEditCategory(mockCategories[0]);
      });
      expect(result.current.editingCategory).toBeDefined();

      // Close
      act(() => {
        result.current.closeCategoryModal();
      });

      // Open new
      act(() => {
        result.current.openNewCategoryModal();
      });
      expect(result.current.editingCategory).toBeUndefined();
    });
  });

  describe('handleSaveCategory - create', () => {
    it('creates a new category and closes modal', async () => {
      const options = createHookOptions();
      vi.mocked(categoriesApi.create).mockResolvedValue({
        id: 'new-1',
        name: 'New Category',
        color: '#ff0000',
        type: 'expense',
      });

      const { result } = renderHook(() => useCategoryActions(options));

      await act(async () => {
        await result.current.handleSaveCategory({
          name: 'New Category',
          color: '#ff0000',
          icon: undefined,
          type: 'expense',
        });
      });

      expect(categoriesApi.create).toHaveBeenCalledWith({
        name: 'New Category',
        color: '#ff0000',
        icon: undefined,
        type: 'expense',
      });
      expect(options.setCategories).toHaveBeenCalled();
      expect(options.showToast).toHaveBeenCalledWith('Category created successfully!');
      expect(result.current.isCategoryModalOpen).toBe(false);
    });

    it('shows error toast on create failure', async () => {
      const options = createHookOptions();
      vi.mocked(categoriesApi.create).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCategoryActions(options));

      await act(async () => {
        await result.current.handleSaveCategory({
          name: 'New Category',
          color: '#ff0000',
          type: 'expense',
        });
      });

      expect(options.showToast).toHaveBeenCalledWith('Failed to save category', 'error');
    });
  });

  describe('handleSaveCategory - update', () => {
    it('updates an existing category', async () => {
      const options = createHookOptions();
      vi.mocked(categoriesApi.update).mockResolvedValue({
        id: '1',
        name: 'Updated Name',
        color: '#a78bfa',
        type: 'expense',
      });

      const { result } = renderHook(() => useCategoryActions(options));

      // Set editing mode
      act(() => {
        result.current.handleEditCategory(mockCategories[0]);
      });

      await act(async () => {
        await result.current.handleSaveCategory({
          name: 'Updated Name',
          color: '#a78bfa',
          icon: 'home',
          type: 'expense',
        });
      });

      expect(categoriesApi.update).toHaveBeenCalledWith('1', {
        name: 'Updated Name',
        color: '#a78bfa',
        icon: 'home',
        type: 'expense',
      });
      expect(options.showToast).toHaveBeenCalledWith('Category updated successfully!');
    });
  });

  describe('handleDeleteCategory', () => {
    it('deletes a category and shows toast', async () => {
      const options = createHookOptions();
      vi.mocked(categoriesApi.delete).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCategoryActions(options));

      await act(async () => {
        await result.current.handleDeleteCategory(mockCategories[0]);
      });

      expect(categoriesApi.delete).toHaveBeenCalledWith('1');
      expect(options.setCategories).toHaveBeenCalled();
      expect(options.showToast).toHaveBeenCalledWith('Category deleted', 'info');
    });

    it('shows error toast on delete failure', async () => {
      const options = createHookOptions();
      vi.mocked(categoriesApi.delete).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCategoryActions(options));

      await act(async () => {
        await result.current.handleDeleteCategory(mockCategories[0]);
      });

      expect(options.showToast).toHaveBeenCalledWith('Failed to delete category', 'error');
    });
  });
});
