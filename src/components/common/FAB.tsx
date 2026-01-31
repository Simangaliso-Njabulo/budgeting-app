// src/components/common/FAB.tsx
import { Plus } from 'lucide-react';
import styles from './FAB.module.css';

interface FABProps {
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
}

const FAB = ({ onClick, icon: Icon = Plus, label }: FABProps) => {
  return (
    <button className={styles.fab} onClick={onClick} aria-label={label || 'Add new'}>
      <Icon className={styles.fabIcon} />
      {label && <span className={styles.fabLabel}>{label}</span>}
    </button>
  );
};

export default FAB;
