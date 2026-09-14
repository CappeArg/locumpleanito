import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useSala } from '../context/SalaContext';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  successMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'celeste' | 'sol' | 'verde' | 'blanco' | 'rojo' | 'secondary' | 'primary';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copiar',
  successMessage = '¡Copiado al portapapeles! 📋',
  className = '',
  size = 'sm',
  variant = 'blanco'
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useSala();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      showToast(successMessage, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      showToast('No se pudo copiar automáticamente', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`notion-btn btn-${variant} btn-${size} ${className}`}
      title="Copiar al portapapeles"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        cursor: 'pointer'
      }}
    >
      {copied ? (
        <Check size={size === 'sm' ? 14 : 16} style={{ color: '#0f7b6c' }} />
      ) : (
        <Copy size={size === 'sm' ? 14 : 16} />
      )}
      <span>{copied ? 'Copiado' : label}</span>
    </button>
  );
};
