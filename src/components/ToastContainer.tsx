import React from 'react';
import { useSala } from '../context/SalaContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSala();

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '0', right: '0', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast-zamba"
          style={{
            pointerEvents: 'auto',
            background: toast.type === 'error' ? 'var(--z-rojo)' : toast.type === 'success' ? 'var(--z-verde-dark)' : 'var(--z-borde)',
            border: '2.5px solid var(--z-crema)'
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} color="#FFBC00" />}
          {toast.type === 'error' && <AlertCircle size={18} color="#FFF" />}
          {toast.type === 'info' && <Info size={18} color="#3298DC" />}
          <span>{toast.text}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: '2px' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
