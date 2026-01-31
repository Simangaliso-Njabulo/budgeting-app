// src/components/common/ConfirmDialog.tsx
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const iconClasses = {
    danger: styles.confirmDialogIconDanger,
    warning: styles.confirmDialogIconWarning,
    info: styles.confirmDialogIconInfo,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={styles.confirmDialogContent}>
        <div className={`${styles.confirmDialogIcon} ${iconClasses[variant]}`}>
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className={styles.confirmDialogMessage}>{message}</p>
        <div className={styles.confirmDialogActions}>
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button className={`btn btn-${variant}`} onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
