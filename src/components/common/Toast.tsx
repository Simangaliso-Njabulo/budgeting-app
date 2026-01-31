// src/components/common/Toast.tsx
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast = ({ message, type, isVisible, onClose, duration = 4000, action }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isExiting) return null;

  const icons = {
    success: <CheckCircle className={styles.toastIcon} />,
    error: <XCircle className={styles.toastIcon} />,
    warning: <AlertCircle className={styles.toastIcon} />,
    info: <Info className={styles.toastIcon} />,
  };

  const typeClasses = {
    success: styles.toastSuccess,
    error: styles.toastError,
    warning: styles.toastWarning,
    info: styles.toastInfo,
  };

  return (
    <div className={`${styles.toast} ${typeClasses[type]} ${isExiting ? styles.toastExit : styles.toastEnter}`}>
      {icons[type]}
      <span className={styles.toastMessage}>{message}</span>
      {action && (
        <button className={styles.toastAction} onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button className={styles.toastClose} onClick={() => { setIsExiting(true); setTimeout(onClose, 300); }}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
