// tests/L1-UnitTests/components/Toast.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      // Close button is always present — it's the last button when no action
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('toast types', () => {
    it('renders for success type', () => {
      render(<Toast {...defaultProps} type="success" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
      // Verify an SVG icon is rendered
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders for error type', () => {
      render(<Toast {...defaultProps} type="error" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders for warning type', () => {
      render(<Toast {...defaultProps} type="warning" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders for info type', () => {
      render(<Toast {...defaultProps} type="info" />);
      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders an icon for each type', () => {
      const { rerender } = render(<Toast {...defaultProps} type="success" />);
      expect(document.querySelector('svg')).toBeInTheDocument();

      rerender(<Toast {...defaultProps} type="error" />);
      expect(document.querySelector('svg')).toBeInTheDocument();

      rerender(<Toast {...defaultProps} type="warning" />);
      expect(document.querySelector('svg')).toBeInTheDocument();

      rerender(<Toast {...defaultProps} type="info" />);
      expect(document.querySelector('svg')).toBeInTheDocument();
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

      // Close button is the last button element
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[buttons.length - 1]);

      // Wait for exit animation
      vi.advanceTimersByTime(300);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('action button', () => {
    it('does not render action button when no action provided', () => {
      render(<Toast {...defaultProps} />);
      // Only the close button should exist
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
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

  describe('close behavior', () => {
    it('toast is visible initially when isVisible is true', () => {
      const { container } = render(<Toast {...defaultProps} />);
      // The toast wrapper div should exist
      expect(container.firstChild).toBeTruthy();
    });

    it('clicking close triggers exit then calls onClose', () => {
      const onClose = vi.fn();
      render(<Toast {...defaultProps} onClose={onClose} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[buttons.length - 1]);

      // onClose should be called after exit animation timeout
      vi.advanceTimersByTime(300);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
