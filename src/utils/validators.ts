// src/utils/validators.ts

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Returns an object with validation details
 */
export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4 (weak to very strong)
  errors: string[];
  suggestions: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters');
  } else {
    score += 0.5;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters');
  } else {
    score += 0.5;
  }

  // Number check
  if (!/\d/.test(password)) {
    suggestions.push('Add numbers');
  } else {
    score += 0.5;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    suggestions.push('Add special characters');
  } else {
    score += 0.5;
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(4, Math.floor(score)),
    errors,
    suggestions,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return labels[Math.min(score, 4)];
}

/**
 * Validate a positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate a non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validate required string (not empty after trimming)
 */
export function isRequiredString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate max length
 */
export function isWithinMaxLength(value: string, maxLength: number): boolean {
  return typeof value === 'string' && value.length <= maxLength;
}

/**
 * Validate a date is not in the future
 */
export function isNotFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return d <= now;
}

/**
 * Validate a date is within a range
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  return d >= start && d <= end;
}

/**
 * Validate transaction data
 */
export interface TransactionValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateTransaction(data: {
  description?: string;
  amount?: number;
  type?: string;
  categoryId?: string;
  date?: Date | string;
}): TransactionValidation {
  const errors: Record<string, string> = {};

  if (!data.description || !isRequiredString(data.description)) {
    errors.description = 'Description is required';
  } else if (!isWithinMaxLength(data.description, 255)) {
    errors.description = 'Description must be 255 characters or less';
  }

  if (data.amount === undefined || !isPositiveNumber(data.amount)) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!data.type || !['income', 'expense'].includes(data.type)) {
    errors.type = 'Type must be income or expense';
  }

  if (!data.categoryId || !isRequiredString(data.categoryId)) {
    errors.categoryId = 'Category is required';
  }

  if (!data.date) {
    errors.date = 'Date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate bucket data
 */
export function validateBucket(data: {
  name?: string;
  allocated?: number;
  categoryId?: string;
}): TransactionValidation {
  const errors: Record<string, string> = {};

  if (!data.name || !isRequiredString(data.name)) {
    errors.name = 'Bucket name is required';
  } else if (!isWithinMaxLength(data.name, 100)) {
    errors.name = 'Bucket name must be 100 characters or less';
  }

  if (data.allocated === undefined || !isPositiveNumber(data.allocated)) {
    errors.allocated = 'Allocated amount must be a positive number';
  }

  if (!data.categoryId || !isRequiredString(data.categoryId)) {
    errors.categoryId = 'Category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate category data
 */
export function validateCategory(data: {
  name?: string;
  color?: string;
  type?: string;
}): TransactionValidation {
  const errors: Record<string, string> = {};

  if (!data.name || !isRequiredString(data.name)) {
    errors.name = 'Category name is required';
  } else if (!isWithinMaxLength(data.name, 100)) {
    errors.name = 'Category name must be 100 characters or less';
  }

  if (!data.color || !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    errors.color = 'Color must be a valid hex color (e.g., #8b5cf6)';
  }

  if (!data.type || !['income', 'expense', 'both'].includes(data.type)) {
    errors.type = 'Type must be income, expense, or both';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
