// tests/L1-UnitTests/hooks/useToast.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../../../src/hooks/useToast';

describe('useToast', () => {
  describe('initial state', () => {
    it('starts with no visible toast', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toast.visible).toBe(false);
      expect(result.current.toast.message).toBe('');
      expect(result.current.toast.type).toBe('success');
    });
  });

  describe('showToast', () => {
    it('shows a toast with the given message', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });

      expect(result.current.toast.visible).toBe(true);
      expect(result.current.toast.message).toBe('Test message');
      expect(result.current.toast.type).toBe('success');
    });

    it('shows a toast with a custom type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Error occurred', 'error');
      });

      expect(result.current.toast.visible).toBe(true);
      expect(result.current.toast.message).toBe('Error occurred');
      expect(result.current.toast.type).toBe('error');
    });

    it('supports info type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Info message', 'info');
      });

      expect(result.current.toast.type).toBe('info');
    });

    it('supports warning type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Warning message', 'warning');
      });

      expect(result.current.toast.type).toBe('warning');
    });

    it('overwrites previous toast when called again', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('First message', 'success');
      });

      act(() => {
        result.current.showToast('Second message', 'error');
      });

      expect(result.current.toast.message).toBe('Second message');
      expect(result.current.toast.type).toBe('error');
    });
  });

  describe('hideToast', () => {
    it('hides the toast', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Test message');
      });
      expect(result.current.toast.visible).toBe(true);

      act(() => {
        result.current.hideToast();
      });
      expect(result.current.toast.visible).toBe(false);
    });

    it('preserves message and type when hiding', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showToast('Preserved message', 'error');
      });

      act(() => {
        result.current.hideToast();
      });

      expect(result.current.toast.visible).toBe(false);
      expect(result.current.toast.message).toBe('Preserved message');
      expect(result.current.toast.type).toBe('error');
    });
  });

  describe('function stability', () => {
    it('showToast reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useToast());

      const firstShowToast = result.current.showToast;
      rerender();
      const secondShowToast = result.current.showToast;

      expect(firstShowToast).toBe(secondShowToast);
    });

    it('hideToast reference is stable across renders', () => {
      const { result, rerender } = renderHook(() => useToast());

      const firstHideToast = result.current.hideToast;
      rerender();
      const secondHideToast = result.current.hideToast;

      expect(firstHideToast).toBe(secondHideToast);
    });
  });
});
