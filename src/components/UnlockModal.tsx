import React, { useState } from 'react';
import { KeyRound, ShieldCheck, HelpCircle } from 'lucide-react';
import { useSala } from '../context/SalaContext';
import type { Sala } from '../types';

interface UnlockModalProps {
  sala: Sala;
  onSuccess?: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ sala, onSuccess }) => {
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);
  const { unlockSala } = useSala();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clave.trim()) return;

    const ok = unlockSala(sala.id, clave, sala.clave);
    if (ok) {
      setError(false);
      onSuccess?.();
    } else {
      setError(true);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card-zamba-sol" style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            background: 'var(--z-celeste)',
            border: '3px solid var(--z-borde)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <KeyRound size={32} color="#FFF" />
        </div>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
          ¡Hola, familia! 🎒
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--z-tinta-suave)', marginBottom: '1.25rem' }}>
          Para ingresar a <strong>{sala.nombre}</strong>, ingresá la palabra clave de la sala:
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              className="input-zamba"
              placeholder="Ej: Arcoiris"
              value={clave}
              onChange={(e) => {
                setClave(e.target.value);
                setError(false);
              }}
              style={{
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 700,
                letterSpacing: '1px',
                borderColor: error ? 'var(--z-rojo)' : 'var(--z-borde)'
              }}
              autoFocus
            />
          </div>

          {error && (
            <p style={{ color: 'var(--z-rojo)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              ⚠️ Clave incorrecta. Preguntale a quien envió el link en el grupo de WhatsApp.
            </p>
          )}

          <button
            type="submit"
            className="btn-zamba btn-verde btn-lg btn-block"
            style={{ marginBottom: '1rem' }}
          >
            <ShieldCheck size={20} />
            <span>Ingresar a la Sala</span>
          </button>
        </form>

        <div
          style={{
            background: 'rgba(255,255,255,0.7)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px dashed var(--z-borde)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--z-tinta-suave)',
            textAlign: 'left'
          }}
        >
          <HelpCircle size={18} style={{ flexShrink: 0 }} />
          <span>
            Solo tenés que ingresarla una vez en tu teléfono.
          </span>
        </div>
      </div>
    </div>
  );
};
