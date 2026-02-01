// tests/L1-UnitTests/utils/iconMap.test.ts
import { describe, it, expect } from 'vitest';
import { ICON_MAP } from '../../../src/utils/iconMap';

describe('ICON_MAP', () => {
  describe('exports', () => {
    it('is a non-empty object', () => {
      expect(ICON_MAP).toBeDefined();
      expect(Object.keys(ICON_MAP).length).toBeGreaterThan(0);
    });

    it('contains all expected icon keys', () => {
      const expectedKeys = [
        'home', 'shopping', 'car', 'food', 'entertainment',
        'work', 'health', 'gift', 'travel', 'tech', 'utilities', 'income',
      ];

      expectedKeys.forEach((key) => {
        expect(ICON_MAP).toHaveProperty(key);
      });
    });

    it('has exactly 12 icons', () => {
      expect(Object.keys(ICON_MAP)).toHaveLength(12);
    });
  });

  describe('icon values', () => {
    it('all values are valid React components', () => {
      Object.entries(ICON_MAP).forEach(([key, component]) => {
        // Lucide icons are ForwardRef objects, not plain functions
        expect(component).toBeTruthy();
        expect(typeof component === 'function' || typeof component === 'object').toBe(true);
      });
    });

    it('no values are undefined or null', () => {
      Object.entries(ICON_MAP).forEach(([key, component]) => {
        expect(component).toBeDefined();
        expect(component).not.toBeNull();
      });
    });
  });

  describe('lookup', () => {
    it('returns a component for valid key', () => {
      const Icon = ICON_MAP['home'];
      expect(Icon).toBeDefined();
      expect(typeof Icon === 'function' || typeof Icon === 'object').toBe(true);
    });

    it('returns undefined for invalid key', () => {
      expect(ICON_MAP['nonexistent']).toBeUndefined();
    });
  });
});
