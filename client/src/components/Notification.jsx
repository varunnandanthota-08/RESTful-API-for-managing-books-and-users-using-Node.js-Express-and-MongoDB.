import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Notification = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const icons = {
    success: <CheckCircle2 size={18} color="var(--color-success)" />,
    error: <AlertCircle size={18} color="var(--color-danger)" />,
    info: <Info size={18} color="var(--color-primary)" />
  };

  return (
    <div className={`toast toast-${type}`}>
      {icons[type] || icons.info}
      <span style={{ fontSize: '0.9rem', fontWeight: 600, flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ color: 'var(--color-text-light)', display: 'flex' }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;

