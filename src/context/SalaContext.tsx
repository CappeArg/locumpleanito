import React, { createContext, useContext, useState } from 'react';
import type { ToastMessage } from '../types';

interface SalaContextType {
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  isSalaUnlocked?: (salaId: string) => boolean;
}

const SalaContext = createContext<SalaContextType | undefined>(undefined);

export const SalaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <SalaContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        isSalaUnlocked: () => true
      }}
    >
      {children}
    </SalaContext.Provider>
  );
};

export const useSala = () => {
  const context = useContext(SalaContext);
  if (!context) {
    throw new Error('useSala debe ser usado dentro de un SalaProvider');
  }
  return context;
};
