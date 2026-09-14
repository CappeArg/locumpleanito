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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
            <Share2 size={18} style={{ color: 'var(--notion-text-muted)' }} />
            <span>Compartir Colecta</span>
          </h2>
          <button
            onClick={onClose}
            className="notion-btn btn-ghost btn-sm"
            style={{ padding: '0.3rem', borderRadius: 'var(--radius-sm)' }}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--notion-text-muted)', marginBottom: '0.75rem' }}>
          Texto preformateado para enviar al grupo de WhatsApp de la sala:
        </p>

        <div
          style={{
            background: 'var(--callout-gray-bg)',
            border: '1px solid var(--notion-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            whiteSpace: 'pre-wrap',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '1.25rem',
            lineHeight: '1.5',
            color: 'var(--notion-text)'
          }}
        >
          {mensajeWhatsApp}
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={handleCopy}
            className="notion-btn btn-secondary"
            style={{ flex: 1 }}
          >
            <Copy size={16} />
            <span>Copiar texto</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="notion-btn btn-primary"
            style={{ flex: 1.2 }}
          >
            <MessageCircle size={16} />
            <span>Abrir WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
