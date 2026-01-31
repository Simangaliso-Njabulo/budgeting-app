// src/components/MonthSelector.tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Pencil, Wallet, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Modal } from './common';
import type { Income } from '../types';
import styles from './MonthSelector.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface MonthSelectorProps {
  year: number;
  month: number; // 1-12
  onChange: (year: number, month: number) => void;
  income?: Income;
  onUpdateIncome?: (income: Income) => void;
}

const MonthSelector = ({ year, month, onChange, income, onUpdateIncome }: MonthSelectorProps) => {
  const { formatCurrency } = useTheme();
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState('');

  const handlePrev = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  const handleToday = () => {
    onChange(now.getFullYear(), now.getMonth() + 1);
  };

  const openIncomeModal = () => {
    setIncomeAmount(income?.amount?.toString() || '0');
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncome = () => {
    if (onUpdateIncome) {
      onUpdateIncome({
        amount: parseFloat(incomeAmount) || 0,
      });
    }
    setIsIncomeModalOpen(false);
  };

  return (
    <>
      <div className={styles.monthSelector}>
        <button className={styles.monthSelectorBtn} onClick={handlePrev} title="Previous month">
          <ChevronLeft size={18} />
        </button>

        <div className={styles.monthSelectorLabel}>
          <CalendarDays size={16} />
          <span>{MONTH_NAMES[month - 1]} {year}</span>
        </div>

        <button className={styles.monthSelectorBtn} onClick={handleNext} title="Next month">
          <ChevronRight size={18} />
        </button>

        {!isCurrentMonth && (
          <button className={styles.monthSelectorToday} onClick={handleToday}>
            Today
          </button>
        )}

        {income && onUpdateIncome && (
          <>
            <div className={styles.monthSelectorDivider} />
            <button className={styles.monthSelectorIncome} onClick={openIncomeModal} title="Edit monthly income">
              <Wallet size={14} />
              <span>{formatCurrency(income.amount)}</span>
              <Pencil size={12} className={styles.monthSelectorEditIcon} />
            </button>
          </>
        )}
      </div>

      {/* Income Edit Modal */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title={`Income - ${MONTH_NAMES[month - 1]} ${year}`}
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="settings-form-group">
            <label className="settings-form-label">
              <Wallet className="settings-form-icon" />
              Monthly Income
            </label>
            <input
              type="number"
              className="settings-currency-input"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
              autoFocus
            />
          </div>

          <button className="settings-save-btn" onClick={handleSaveIncome}>
            <Check size={16} />
            Save
          </button>
        </div>
      </Modal>
    </>
  );
};

export default MonthSelector;
