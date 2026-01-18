// tests/L1-UnitTests/components/Toast.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Toast from '../../../src/components/common/Toast';

describe('Toast', () => {
  const defaultProps = {
    message: 'Test message',
    type: 'success' as const,
    isVisible: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders when isVisible is true', () => {
      render(<Toast {...defaultProps} />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('does not render when isVisible is false', () => {
      render(<Toast {...defaultProps} isVisible={false} />);
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });

    it('displays the message', () => {
      render(<Toast {...defaultProps} message="Custom message" />);
      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('has close button', () => {
      render(<Toast {...defaultProps} />);
      expect(document.querySelector('.toast-close')).toBeInTheDocument();
    });
  });

  describe('toast types', () => {
    it('applies success class for success type', () => {
      render(<Toast {...defaultProps} type="success" />);
      expect(document.querySelector('.toast-success')).toBeInTheDocument();
    });

    it('applies error class for error type', () => {
      render(<Toast {...defaultProps} type="error" />);
      expect(document.querySelector('.toast-error')).toBeInTheDocument();
    });

    it('applies warning class for warning type', () => {
      render(<Toast {...defaultProps} type="warning" />);
      expect(document.querySelector('.toast-warning')).toBeInTheDocument();
    });

    it('applies info class for info type', () => {
      render(<Toast {...defaultProps} type="info" />);
      expect(document.querySelector('.toast-info')).toBeInTheDocument();
    });

    it('renders appropriate icon for each type', () => {
      const { rerender } = render(<Toast {...defaultProps} type="success" />);
      expect(document.querySelector('.toast-icon')).toBeInTheDocument();

      rerender(<Toast {...defaultProps} type="error" />);
      expect(document.querySelector('.toast-icon')).toBeInTheDocument();

      rerender(<Toast {...defaultProps} type="warning" />);
      expect(document.querySelector('.toast-icon')).toBeInTheDocument();

      rerender(<Toast {...defaultProps} type="info" />);
      expect(document.querySelector('.toast-icon')).toBeInTheDocument();
    });
  });

  describe('auto-close behavior', () => {
    it('calls onClose after default duration (4000ms)', async () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} />);

      // Advance timers past the duration + exit animation
      vi.advanceTimersByTime(4300);

      expect(onClose).toHaveBeenCalled();
    });

    it('respects custom duration', async () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} duration={2000} />);

      // Should not have closed yet
      vi.advanceTimersByTime(1500);
      expect(onClose).not.toHaveBeenCalled();

      // Should close after duration + exit animation
      vi.advanceTimersByTime(1000);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('manual close', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} />);

      fireEvent.click(document.querySelector('.toast-close')!);

      // Wait for exit animation
      vi.advanceTimersByTime(300);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('action button', () => {
    it('does not render action button when no action provided', () => {
      render(<Toast {...defaultProps} />);
      expect(document.querySelector('.toast-action')).not.toBeInTheDocument();
    });

    it('renders action button when action is provided', () => {
      const action = { label: 'Undo', onClick: vi.fn() };
      render(<Toast {...defaultProps} action={action} />);
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('calls action.onClick when action button is clicked', () => {
      const onClick = vi.fn();
      const action = { label: 'Undo', onClick };
      render(<Toast {...defaultProps} action={action} />);

      fireEvent.click(screen.getByText('Undo'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('animation classes', () => {
    it('applies enter animation class when visible', () => {
      render(<Toast {...defaultProps} />);
      expect(document.querySelector('.toast-enter')).toBeInTheDocument();
    });

    it('applies exit animation class when closing', () => {
      render(<Toast {...defaultProps} />);

      fireEvent.click(document.querySelector('.toast-close')!);

      expect(document.querySelector('.toast-exit')).toBeInTheDocument();
    });
  });
});
