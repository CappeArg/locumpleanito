import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ToastMessage } from '../types';

interface SalaContextType {
  unlockedSalas: Record<string, boolean>;
  unlockSala: (salaId: string, claveIngresada: string, claveReal: string) => boolean;
  isSalaUnlocked: (salaId: string) => boolean;
  lockSala: (salaId: string) => void;
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const SalaContext = createContext<SalaContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_UNLOCKED = 'locumpleanito_unlocked_salas';

export const SalaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlockedSalas, setUnlockedSalas] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_UNLOCKED);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_UNLOCKED, JSON.stringify(unlockedSalas));
  }, [unlockedSalas]);

  const unlockSala = (salaId: string, claveIngresada: string, claveReal: string): boolean => {
    const normalizadaIngresada = claveIngresada.trim().toLowerCase();
    const normalizadaReal = claveReal.trim().toLowerCase();

    if (normalizadaIngresada === normalizadaReal) {
      setUnlockedSalas(prev => ({ ...prev, [salaId.toLowerCase()]: true }));
      showToast('¡Bienvenido/a a la sala! 🎉', 'success');
      return true;
    } else {
      showToast('Clave incorrecta. Preguntale a algún padre de la sala 🤫', 'error');
      return false;
    }
  };

  const isSalaUnlocked = (salaId: string): boolean => {
    return Boolean(unlockedSalas[salaId.toLowerCase()]);
  };

  const lockSala = (salaId: string) => {
    setUnlockedSalas(prev => {
      const next = { ...prev };
      delete next[salaId.toLowerCase()];
      return next;
    });
  };

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
        unlockedSalas,
        unlockSala,
        isSalaUnlocked,
        lockSala,
        toasts,
        showToast,
        removeToast
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
