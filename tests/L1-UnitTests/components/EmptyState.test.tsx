// tests/L1-UnitTests/components/EmptyState.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FolderOpen } from 'lucide-react';
import EmptyState from '../../../src/components/common/EmptyState';

describe('EmptyState', () => {
  const defaultProps = {
    icon: FolderOpen,
    title: 'No Items',
    description: 'No items to display',
  };

  describe('rendering', () => {
    it('renders the title', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByText('No Items')).toBeInTheDocument();
    });

    it('renders the description', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByText('No items to display')).toBeInTheDocument();
    });

    it('renders the icon', () => {
      render(<EmptyState {...defaultProps} />);
      // Lucide icons render as SVG elements
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders all structural elements', () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      // Should have a wrapper div, heading, and paragraph
      expect(container.querySelector('h3')).toBeInTheDocument();
      expect(container.querySelector('p')).toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('does not render action button when no actionLabel provided', () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not render action button when no onAction provided', () => {
      render(<EmptyState {...defaultProps} actionLabel="Add Item" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders action button when both actionLabel and onAction provided', () => {
      const onAction = vi.fn();
      render(<EmptyState {...defaultProps} actionLabel="Add Item" onAction={onAction} />);
      expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    it('calls onAction when action button is clicked', () => {
      const onAction = vi.fn();
      render(<EmptyState {...defaultProps} actionLabel="Add Item" onAction={onAction} />);

      fireEvent.click(screen.getByRole('button'));
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('displays the action label text', () => {
      const onAction = vi.fn();
      render(<EmptyState {...defaultProps} actionLabel="Create New" onAction={onAction} />);
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });
  });

  describe('different icons', () => {
    it('accepts different icon components', () => {
      const CustomIcon = ({ className }: { className?: string }) => (
        <svg data-testid="custom-icon" className={className} />
      );

      render(<EmptyState {...defaultProps} icon={CustomIcon} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has semantic heading for title', () => {
      render(<EmptyState {...defaultProps} />);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('No Items');
    });

    it('has accessible paragraph for description', () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      const paragraph = container.querySelector('p');
      expect(paragraph?.tagName).toBe('P');
      expect(paragraph?.textContent).toBe('No items to display');
    });
  });
});
