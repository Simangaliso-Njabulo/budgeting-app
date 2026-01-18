// tests/L1-UnitTests/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  formatPercentage,
  formatNumber,
  truncateText,
  capitalize,
  formatDuration,
} from '../../../src/utils/formatters';

describe('formatCurrency', () => {
  describe('USD formatting', () => {
    it('formats positive amounts correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('formats negative amounts correctly', () => {
      expect(formatCurrency(-500, 'USD')).toBe('-$500.00');
    });

    it('formats large numbers with thousand separators', () => {
      expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
    });

    it('formats small decimals correctly', () => {
      expect(formatCurrency(0.99, 'USD')).toBe('$0.99');
    });
  });

  describe('ZAR formatting', () => {
    it('formats ZAR with R symbol', () => {
      expect(formatCurrency(1234.56, 'ZAR')).toMatch(/R.*1.*234.*56/);
    });
  });

  describe('options', () => {
    it('hides symbol when showSymbol is false', () => {
      const result = formatCurrency(1234.56, 'USD', { showSymbol: false });
      expect(result).toBe('1,234.56');
      expect(result).not.toContain('$');
    });

    it('respects custom decimal places', () => {
      expect(formatCurrency(1234.567, 'USD', { decimals: 0 })).toBe('$1,235');
      expect(formatCurrency(1234.567, 'USD', { decimals: 3 })).toBe('$1,234.567');
    });
  });

  describe('fallback behavior', () => {
    it('falls back to USD for unknown currency', () => {
      expect(formatCurrency(100, 'XXX')).toBe('$100.00');
    });

    it('uses USD as default when no currency specified', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });
  });
});

describe('formatDate', () => {
  const testDate = new Date('2026-01-15T12:00:00');

  describe('format options', () => {
    it('formats short dates correctly', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toMatch(/1\/15|15\/1/); // handles different locales
    });

    it('formats medium dates correctly', () => {
      const result = formatDate(testDate, 'medium');
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2026');
    });

    it('formats long dates correctly', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2026');
    });

    it('uses medium format by default', () => {
      const result = formatDate(testDate);
      expect(result).toContain('Jan');
    });
  });

  describe('input handling', () => {
    it('accepts string dates', () => {
      const result = formatDate('2026-01-15', 'medium');
      expect(result).toContain('Jan');
    });

    it('returns "Invalid date" for invalid dates', () => {
      expect(formatDate('not-a-date')).toBe('Invalid date');
      expect(formatDate(new Date('invalid'))).toBe('Invalid date');
    });
  });

  describe('relative format', () => {
    it('delegates to formatRelativeDate', () => {
      const today = new Date();
      expect(formatDate(today, 'relative')).toBe('Today');
    });
  });
});

describe('formatRelativeDate', () => {
  it('returns "Today" for today\'s date', () => {
    const today = new Date();
    expect(formatRelativeDate(today)).toBe('Today');
  });

  it('returns "Yesterday" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('returns "Tomorrow" for tomorrow', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatRelativeDate(tomorrow)).toBe('Tomorrow');
  });

  it('returns "X days ago" for recent dates', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
  });

  it('returns "1 week ago" for 7-13 days ago', () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    expect(formatRelativeDate(weekAgo)).toBe('1 week ago');
  });

  it('returns "X weeks ago" for 14-29 days ago', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(formatRelativeDate(twoWeeksAgo)).toBe('2 weeks ago');
  });

  it('returns "1 month ago" for 30-59 days ago', () => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    expect(formatRelativeDate(monthAgo)).toBe('1 month ago');
  });

  it('returns formatted date for very old dates', () => {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 2);
    const result = formatRelativeDate(yearAgo);
    expect(result).not.toContain('ago');
  });
});

describe('formatPercentage', () => {
  it('calculates and formats percentage correctly', () => {
    expect(formatPercentage(25, 100)).toBe('25.0%');
    expect(formatPercentage(1, 3)).toBe('33.3%');
    expect(formatPercentage(0, 100)).toBe('0.0%');
  });

  it('handles zero total', () => {
    expect(formatPercentage(50, 0)).toBe('0%');
  });

  it('respects custom decimal places', () => {
    expect(formatPercentage(1, 3, 0)).toBe('33%');
    expect(formatPercentage(1, 3, 2)).toBe('33.33%');
  });

  it('handles percentages over 100%', () => {
    expect(formatPercentage(150, 100)).toBe('150.0%');
  });
});

describe('formatNumber', () => {
  it('formats numbers with thousand separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('respects decimal places', () => {
    expect(formatNumber(1234.567, 2)).toBe('1,234.57');
    expect(formatNumber(1234, 2)).toBe('1,234.00');
  });

  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('truncateText', () => {
  it('returns original text if shorter than max length', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates and adds ellipsis for long text', () => {
    expect(truncateText('Hello World', 8)).toBe('Hello...');
  });

  it('handles exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('lowercases rest of string', () => {
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration(5000)).toBe('5s');
    expect(formatDuration(45000)).toBe('45s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(65000)).toBe('1m 5s');
    expect(formatDuration(125000)).toBe('2m 5s');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3665000)).toBe('1h 1m');
    expect(formatDuration(7325000)).toBe('2h 2m');
  });

  it('formats days and hours', () => {
    expect(formatDuration(90000000)).toBe('1d 1h');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});
