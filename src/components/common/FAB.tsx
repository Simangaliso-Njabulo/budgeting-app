// src/components/common/FAB.tsx
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
}

const FAB = ({ onClick, icon: Icon = Plus, label }: FABProps) => {
  return (
    <button className="fab" onClick={onClick} aria-label={label || 'Add new'}>
      <Icon className="fab-icon" />
      {label && <span className="fab-label">{label}</span>}
    </button>
  );
};

export default FAB;
