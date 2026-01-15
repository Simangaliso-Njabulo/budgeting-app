// src/components/common/Toast.tsx
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

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
    success: <CheckCircle className="toast-icon" />,
    error: <XCircle className="toast-icon" />,
    warning: <AlertCircle className="toast-icon" />,
    info: <Info className="toast-icon" />,
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      {icons[type]}
      <span className="toast-message">{message}</span>
      {action && (
        <button className="toast-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      <button className="toast-close" onClick={() => { setIsExiting(true); setTimeout(onClose, 300); }}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
