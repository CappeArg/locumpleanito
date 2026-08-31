import React from 'react';
import { Share2, X, MessageCircle, Copy } from 'lucide-react';
import type { Cumpleanios, Participante } from '../types';
import { useSala } from '../context/SalaContext';

interface WhatsAppModalProps {
  cumple: Cumpleanios;
  participantes: Participante[];
  salaNombre?: string;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  cumple,
  participantes,
  onClose
}) => {
  const { showToast } = useSala();

  const confirmados = participantes.filter(p => p.estado === 'confirmado').length;
  const avisaron = participantes.filter(p => p.estado === 'notificado').length;
  const total = participantes.length;

  const currentUrl = window.location.href;

  const formatFecha = (iso: string) => {
    try {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return iso;
    }
  };

  const mensajeWhatsApp = `🎈 *¡COLECTA DE CUMPLE: ${cumple.nombreAgasajado.toUpperCase()}!* 🎂

¡Hola familias! Ya estamos juntando para el regalo de *${cumple.nombreAgasajado}* (Festejo: ${formatFecha(cumple.fechaCumple)}).

💰 *Monto por familia:* $${cumple.montoPorPersona.toLocaleString('es-AR')}
👉 *Alias de transferencia:* *${cumple.alias}*
👤 *Titular:* ${cumple.titular}${cumple.banco ? ` (${cumple.banco})` : ''}

📊 *Estado:* ${confirmados} pagos confirmados ${avisaron > 0 ? `(+${avisaron} avisados)` : ''} (Total: ${total} familias sumadas).

📲 *Avisá tu transferencia y seguí la colecta acá:*
${currentUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mensajeWhatsApp);
      showToast('¡Texto copiado! Pegalo en el grupo de WhatsApp 📲', 'success');
    } catch (err) {
      console.error(err);
      showToast('No se pudo copiar automáticamente', 'error');
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(mensajeWhatsApp);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card-zamba-verde" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <Share2 size={20} color="var(--z-verde-dark)" />
            <span>Compartir en WhatsApp</span>
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--z-tinta-suave)', marginBottom: '0.75rem' }}>
          Copiá este mensaje para enviarlo al grupo de la sala:
        </p>

        <div
          style={{
            background: '#ffffff',
            border: '2px solid var(--z-borde)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            whiteSpace: 'pre-wrap',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}
        >
          {mensajeWhatsApp}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button
            onClick={handleOpenWhatsApp}
            className="btn-zamba btn-verde btn-block"
            style={{ gap: '0.5rem' }}
          >
            <MessageCircle size={18} />
            <span>Abrir WhatsApp directo</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn-zamba btn-sol btn-block"
            style={{ gap: '0.5rem' }}
          >
            <Copy size={18} />
            <span>Copiar mensaje</span>
          </button>
        </div>
      </div>
    </div>
  );
};
