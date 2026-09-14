import React from 'react';
import { useSala } from '../context/SalaContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSala();

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '0', right: '0', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="notion-toast"
          style={{
            pointerEvents: 'auto',
            background: toast.type === 'error' ? '#2f1a1b' : toast.type === 'success' ? '#142a1e' : '#252525',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={16} style={{ color: '#4ade80' }} />}
          {toast.type === 'error' && <AlertCircle size={16} style={{ color: '#f87171' }} />}
          {toast.type === 'info' && <Info size={16} style={{ color: '#60a5fa' }} />}
          <span style={{ fontSize: '0.88rem' }}>{toast.text}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', padding: '2px', marginLeft: '4px' }}
            aria-label="Cerrar notificación"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
