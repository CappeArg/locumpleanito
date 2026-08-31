import React, { useState } from 'react';
import { Camera, Image as ImageIcon, Receipt, Plus, X, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useSala } from '../context/SalaContext';

interface GiftGalleryProps {
  cumpleId: string;
  fotosRegalo?: string[];
  fotosComprobantes?: string[];
  regaloDescripcion?: string;
  isClosed?: boolean;
}

export const GiftGallery: React.FC<GiftGalleryProps> = ({
  cumpleId,
  fotosRegalo = [],
  fotosComprobantes = [],
  regaloDescripcion
}) => {
  const { showToast } = useSala();
  const [activeTab, setActiveTab] = useState<'regalo' | 'tickets'>('regalo');
  const [modalOpen, setModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        if (activeTab === 'regalo') {
          await api.agregarFotoRegalo(cumpleId, base64);
        } else {
          await api.agregarComprobante(cumpleId, base64);
        }
        showToast('¡Foto agregada con éxito! 📸', 'success');
        setModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (activeTab === 'regalo') {
      await api.agregarFotoRegalo(cumpleId, urlInput.trim());
    } else {
      await api.agregarComprobante(cumpleId, urlInput.trim());
    }
    showToast('¡Foto agregada con éxito! 📸', 'success');
    setUrlInput('');
    setModalOpen(false);
  };

  const currentPhotos = activeTab === 'regalo' ? fotosRegalo : fotosComprobantes;

  return (
    <div className="card-zamba" style={{ background: '#FFFDF9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
          <GiftIcon size={20} />
          <span>Rendición y Fotos del Regalo</span>
        </h3>
        
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-zamba btn-sol btn-sm"
          style={{ gap: '0.25rem' }}
        >
          <Plus size={15} />
          <span>Subir foto</span>
        </button>
      </div>

      {regaloDescripcion && (
        <div
          style={{
            background: 'var(--z-sol-light)',
            border: '2px dashed var(--z-sol-dark)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.85rem',
            fontSize: '0.9rem'
          }}
        >
          <strong>🎁 Regalo elegido:</strong> {regaloDescripcion}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('regalo')}
          className={`btn-zamba btn-sm ${activeTab === 'regalo' ? 'btn-celeste' : 'btn-blanco'}`}
          style={{ flex: 1 }}
        >
          <ImageIcon size={15} />
          <span>Fotos del Regalo ({fotosRegalo.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`btn-zamba btn-sm ${activeTab === 'tickets' ? 'btn-celeste' : 'btn-blanco'}`}
          style={{ flex: 1 }}
        >
          <Receipt size={15} />
          <span>Tickets / Facturas ({fotosComprobantes.length})</span>
        </button>
      </div>

      {/* Grid de fotos */}
      {currentPhotos.length === 0 ? (
        <div
          style={{
            background: 'var(--z-papel)',
            border: '2px dashed var(--z-borde)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            color: 'var(--z-tinta-suave)',
            fontSize: '0.85rem'
          }}
        >
          <Camera size={28} style={{ opacity: 0.5, marginBottom: '0.35rem' }} />
          <p>
            {activeTab === 'regalo'
              ? 'Aún no se subieron fotos del regalo.'
              : 'Aún no se subieron fotos de los comprobantes/tickets.'}
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--z-celeste-dark)',
              fontWeight: 800,
              textDecoration: 'underline',
              cursor: 'pointer',
              marginTop: '0.35rem'
            }}
          >
            + Subir foto ahora
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '0.65rem'
          }}
        >
          {currentPhotos.map((url, idx) => (
            <div
              key={idx}
              onClick={() => setPreviewImage(url)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '2px solid var(--z-borde)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer'
              }}
            >
              <img
                src={url}
                alt="Foto"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.3)',
                  opacity: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
              >
                <Eye size={20} color="#fff" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Subir Foto */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                Subir foto de {activeTab === 'regalo' ? 'Regalo' : 'Comprobante / Ticket'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label
                className="btn-zamba btn-sol btn-block btn-lg"
                style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '0.75rem' }}
              >
                <Camera size={20} />
                <span>Sacar foto o Elegir archivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--z-tinta-suave)', fontSize: '0.85rem' }}>
                — o ingresá un enlace directo de imagen —
              </div>

              <form onSubmit={handleUrlSubmit}>
                <div className="input-group">
                  <input
                    type="url"
                    className="input-zamba"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-zamba btn-celeste btn-block">
                  Guardar enlace
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Grande */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '3px solid var(--z-borde)',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>
            <img
              src={previewImage}
              alt="Vista previa"
              style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block', objectFit: 'contain', background: '#000' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const GiftIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <span style={{ fontSize: `${size}px`, display: 'inline-block', lineHeight: 1 }}>🎁</span>
);
