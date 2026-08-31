import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useSala } from '../context/SalaContext';

interface CopyButtonProps {
  textToCopy: string;
  label?: string;
  successMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'celeste' | 'sol' | 'verde' | 'blanco' | 'rojo';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  label = 'Copiar',
  successMessage = '¡Copiado al portapapeles! 📋',
  className = '',
  size = 'sm',
  variant = 'sol'
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useSala();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback para navegadores antiguos o http
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
      className={`btn-zamba btn-${variant} btn-${size} ${className}`}
      title="Copiar al portapapeles"
    >
      {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
      <span>{copied ? '¡Copiado!' : label}</span>
    </button>
  );
};
