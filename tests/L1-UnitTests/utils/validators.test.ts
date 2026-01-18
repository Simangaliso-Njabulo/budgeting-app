// tests/L1-UnitTests/utils/validators.test.ts
import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  validatePassword,
  getPasswordStrengthLabel,
  isPositiveNumber,
  isNonNegativeNumber,
  isRequiredString,
  isWithinMaxLength,
  isNotFutureDate,
  isDateInRange,
  validateTransaction,
  validateBucket,
  validateCategory,
} from '../../../src/utils/validators';

describe('isValidEmail', () => {
  describe('valid emails', () => {
    it('accepts standard email format', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('accepts email with subdomain', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true);
    });

    it('accepts email with plus sign', () => {
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('accepts email with dots in local part', () => {
      expect(isValidEmail('first.last@example.com')).toBe(true);
    });

    it('accepts email with numbers', () => {
      expect(isValidEmail('user123@example123.com')).toBe(true);
    });
  });

  describe('invalid emails', () => {
    it('rejects email without @', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
    });

    it('rejects email without domain', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    it('rejects email without local part', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('rejects email with spaces', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
    });

    it('rejects empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });
});

describe('validatePassword', () => {
  describe('password validation', () => {
    it('rejects passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('accepts valid 8+ character passwords', () => {
      const result = validatePassword('ValidPass1!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('password scoring', () => {
    it('gives higher score for longer passwords', () => {
      const short = validatePassword('Pass12!@');
      const long = validatePassword('LongerPassword12!@');
      expect(long.score).toBeGreaterThanOrEqual(short.score);
    });

    it('gives higher score for mixed case', () => {
      const lower = validatePassword('password12!@');
      const mixed = validatePassword('Password12!@');
      expect(mixed.score).toBeGreaterThan(lower.score);
    });

    it('gives higher score for special characters', () => {
      const noSpecial = validatePassword('Password12');
      const withSpecial = validatePassword('Password12!');
      expect(withSpecial.score).toBeGreaterThan(noSpecial.score);
    });

    it('score is capped at 4', () => {
      const result = validatePassword('VeryStrongP@ssw0rd123!@#');
      expect(result.score).toBeLessThanOrEqual(4);
    });
  });

  describe('suggestions', () => {
    it('suggests uppercase when missing', () => {
      const result = validatePassword('lowercase12!');
      expect(result.suggestions).toContain('Add uppercase letters');
    });

    it('suggests lowercase when missing', () => {
      const result = validatePassword('UPPERCASE12!');
      expect(result.suggestions).toContain('Add lowercase letters');
    });

    it('suggests numbers when missing', () => {
      const result = validatePassword('Password!@');
      expect(result.suggestions).toContain('Add numbers');
    });

    it('suggests special characters when missing', () => {
      const result = validatePassword('Password12');
      expect(result.suggestions).toContain('Add special characters');
    });
  });
});

describe('getPasswordStrengthLabel', () => {
  it('returns correct labels for each score', () => {
    expect(getPasswordStrengthLabel(0)).toBe('Very Weak');
    expect(getPasswordStrengthLabel(1)).toBe('Weak');
    expect(getPasswordStrengthLabel(2)).toBe('Fair');
    expect(getPasswordStrengthLabel(3)).toBe('Strong');
    expect(getPasswordStrengthLabel(4)).toBe('Very Strong');
  });

  it('caps at Very Strong for scores above 4', () => {
    expect(getPasswordStrengthLabel(5)).toBe('Very Strong');
    expect(getPasswordStrengthLabel(10)).toBe('Very Strong');
  });
});

describe('isPositiveNumber', () => {
  it('returns true for positive numbers', () => {
    expect(isPositiveNumber(1)).toBe(true);
    expect(isPositiveNumber(0.01)).toBe(true);
    expect(isPositiveNumber(1000000)).toBe(true);
  });

  it('returns false for zero', () => {
    expect(isPositiveNumber(0)).toBe(false);
  });

  it('returns false for negative numbers', () => {
    expect(isPositiveNumber(-1)).toBe(false);
    expect(isPositiveNumber(-0.01)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isPositiveNumber(NaN)).toBe(false);
  });
});

describe('isNonNegativeNumber', () => {
  it('returns true for positive numbers', () => {
    expect(isNonNegativeNumber(1)).toBe(true);
    expect(isNonNegativeNumber(100)).toBe(true);
  });

  it('returns true for zero', () => {
    expect(isNonNegativeNumber(0)).toBe(true);
  });

  it('returns false for negative numbers', () => {
    expect(isNonNegativeNumber(-1)).toBe(false);
    expect(isNonNegativeNumber(-0.01)).toBe(false);
  });

  it('returns false for NaN', () => {
    expect(isNonNegativeNumber(NaN)).toBe(false);
  });
});

describe('isRequiredString', () => {
  it('returns true for non-empty strings', () => {
    expect(isRequiredString('hello')).toBe(true);
    expect(isRequiredString('a')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isRequiredString('')).toBe(false);
  });

  it('returns false for whitespace-only strings', () => {
    expect(isRequiredString('   ')).toBe(false);
    expect(isRequiredString('\t\n')).toBe(false);
  });
});

describe('isWithinMaxLength', () => {
  it('returns true when within limit', () => {
    expect(isWithinMaxLength('hello', 10)).toBe(true);
    expect(isWithinMaxLength('hello', 5)).toBe(true);
  });

  it('returns false when exceeding limit', () => {
    expect(isWithinMaxLength('hello world', 5)).toBe(false);
  });

  it('handles empty string', () => {
    expect(isWithinMaxLength('', 0)).toBe(true);
  });
});

describe('isNotFutureDate', () => {
  it('returns true for past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isNotFutureDate(yesterday)).toBe(true);
  });

  it('returns true for today', () => {
    expect(isNotFutureDate(new Date())).toBe(true);
  });

  it('returns false for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isNotFutureDate(tomorrow)).toBe(false);
  });

  it('accepts string dates', () => {
    expect(isNotFutureDate('2020-01-01')).toBe(true);
    expect(isNotFutureDate('2099-01-01')).toBe(false);
  });
});

describe('isDateInRange', () => {
  const start = new Date('2026-01-01');
  const end = new Date('2026-12-31');

  it('returns true for date within range', () => {
    expect(isDateInRange(new Date('2026-06-15'), start, end)).toBe(true);
  });

  it('returns true for date at start of range', () => {
    expect(isDateInRange(start, start, end)).toBe(true);
  });

  it('returns true for date at end of range', () => {
    expect(isDateInRange(end, start, end)).toBe(true);
  });

  it('returns false for date before range', () => {
    expect(isDateInRange(new Date('2025-12-31'), start, end)).toBe(false);
  });

  it('returns false for date after range', () => {
    expect(isDateInRange(new Date('2027-01-01'), start, end)).toBe(false);
  });
});

describe('validateTransaction', () => {
  const validTransaction = {
    description: 'Coffee',
    amount: 4.50,
    type: 'expense',
    categoryId: '1',
    date: new Date(),
  };

  it('validates a complete transaction', () => {
    const result = validateTransaction(validTransaction);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  describe('description validation', () => {
    it('requires description', () => {
      const result = validateTransaction({ ...validTransaction, description: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('Description is required');
    });

    it('rejects description over 255 characters', () => {
      const result = validateTransaction({
        ...validTransaction,
        description: 'a'.repeat(256),
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toBe('Description must be 255 characters or less');
    });
  });

  describe('amount validation', () => {
    it('requires positive amount', () => {
      const result = validateTransaction({ ...validTransaction, amount: 0 });
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBe('Amount must be a positive number');
    });

    it('rejects negative amount', () => {
      const result = validateTransaction({ ...validTransaction, amount: -10 });
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBeDefined();
    });
  });

  describe('type validation', () => {
    it('accepts income type', () => {
      const result = validateTransaction({ ...validTransaction, type: 'income' });
      expect(result.isValid).toBe(true);
    });

    it('accepts expense type', () => {
      const result = validateTransaction({ ...validTransaction, type: 'expense' });
      expect(result.isValid).toBe(true);
    });

    it('rejects invalid type', () => {
      const result = validateTransaction({ ...validTransaction, type: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBe('Type must be income or expense');
    });
  });

  describe('categoryId validation', () => {
    it('requires categoryId', () => {
      const result = validateTransaction({ ...validTransaction, categoryId: '' });
      expect(result.isValid).toBe(false);
      expect(result.errors.categoryId).toBe('Category is required');
    });
  });

  describe('date validation', () => {
    it('requires date', () => {
      const result = validateTransaction({ ...validTransaction, date: undefined });
      expect(result.isValid).toBe(false);
      expect(result.errors.date).toBe('Date is required');
    });
  });
});

describe('validateBucket', () => {
  const validBucket = {
    name: 'Groceries',
    allocated: 500,
    categoryId: '1',
  };

  it('validates a complete bucket', () => {
    const result = validateBucket(validBucket);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('requires bucket name', () => {
    const result = validateBucket({ ...validBucket, name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Bucket name is required');
  });

  it('rejects name over 100 characters', () => {
    const result = validateBucket({ ...validBucket, name: 'a'.repeat(101) });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Bucket name must be 100 characters or less');
  });

  it('requires positive allocated amount', () => {
    const result = validateBucket({ ...validBucket, allocated: 0 });
    expect(result.isValid).toBe(false);
    expect(result.errors.allocated).toBeDefined();
  });

  it('requires categoryId', () => {
    const result = validateBucket({ ...validBucket, categoryId: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.categoryId).toBe('Category is required');
  });
});

describe('validateCategory', () => {
  const validCategory = {
    name: 'Living Expenses',
    color: '#8b5cf6',
    type: 'expense',
  };

  it('validates a complete category', () => {
    const result = validateCategory(validCategory);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('requires category name', () => {
    const result = validateCategory({ ...validCategory, name: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBe('Category name is required');
  });

  describe('color validation', () => {
    it('accepts valid hex colors', () => {
      expect(validateCategory({ ...validCategory, color: '#000000' }).isValid).toBe(true);
      expect(validateCategory({ ...validCategory, color: '#FFFFFF' }).isValid).toBe(true);
      expect(validateCategory({ ...validCategory, color: '#8b5cf6' }).isValid).toBe(true);
    });

    it('rejects invalid hex colors', () => {
      expect(validateCategory({ ...validCategory, color: 'red' }).errors.color).toBeDefined();
      expect(validateCategory({ ...validCategory, color: '#fff' }).errors.color).toBeDefined();
      expect(validateCategory({ ...validCategory, color: '8b5cf6' }).errors.color).toBeDefined();
    });
  });

  describe('type validation', () => {
    it('accepts valid types', () => {
      expect(validateCategory({ ...validCategory, type: 'income' }).isValid).toBe(true);
      expect(validateCategory({ ...validCategory, type: 'expense' }).isValid).toBe(true);
      expect(validateCategory({ ...validCategory, type: 'both' }).isValid).toBe(true);
    });

    it('rejects invalid type', () => {
      const result = validateCategory({ ...validCategory, type: 'invalid' });
      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBe('Type must be income, expense, or both');
    });
  });
});
