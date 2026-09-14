import React, { useState } from 'react';
import { Camera, Plus, X, Eye } from 'lucide-react';
import { api } from '../services/api';
import { useSala } from '../context/SalaContext';

interface GiftGalleryProps {
  cumpleId: string;
  fotosRegalo?: string[];
  regaloDescripcion?: string;
  isClosed?: boolean;
}

export const GiftGallery: React.FC<GiftGalleryProps> = ({
  cumpleId,
  fotosRegalo = [],
  regaloDescripcion
}) => {
  const { showToast } = useSala();
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
        await api.agregarFotoRegalo(cumpleId, base64);
        showToast('¡Foto del regalo agregada con éxito! 📸', 'success');
        setModalOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    await api.agregarFotoRegalo(cumpleId, urlInput.trim());
    showToast('¡Foto del regalo agregada con éxito! 📸', 'success');
    setUrlInput('');
    setModalOpen(false);
  };

  return (
    <div className="card-zamba" style={{ background: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h3 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
          <span>🎁</span>
          <span>Fotos del Regalo</span>
        </h3>
        
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="notion-btn btn-secondary btn-sm"
        >
          <Plus size={14} />
          <span>Subir foto</span>
        </button>
      </div>

      {regaloDescripcion && (
        <div
          className="notion-callout notion-callout-yellow"
          style={{
            padding: '0.75rem 0.85rem',
            marginBottom: '0.85rem',
            fontSize: '0.88rem'
          }}
        >
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
          <div>
            <strong>Regalo elegido:</strong> {regaloDescripcion}
          </div>
        </div>
      )}

      {/* Grid de fotos estilo Notion Gallery */}
      {fotosRegalo.length === 0 ? (
        <div
          style={{
            background: 'var(--callout-gray-bg)',
            border: '1px dashed var(--notion-border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            color: 'var(--notion-text-muted)',
            fontSize: '0.85rem'
          }}
        >
          <Camera size={24} style={{ opacity: 0.6, marginBottom: '0.35rem' }} />
          <p>Aún no se subieron fotos del regalo.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="notion-btn btn-ghost btn-sm"
            style={{ marginTop: '0.5rem', color: 'var(--btn-blue-bg)' }}
          >
            + Subir foto ahora
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
            gap: '0.65rem'
          }}
        >
          {fotosRegalo.map((url, idx) => (
            <div
              key={idx}
              onClick={() => setPreviewImage(url)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--notion-border)',
                boxShadow: 'var(--shadow-card)',
                cursor: 'pointer'
              }}
            >
              <img
                src={url}
                alt="Foto del regalo"
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
                <Eye size={18} color="#fff" />
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
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                Subir foto del Regalo
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="notion-btn btn-ghost btn-sm"
                style={{ padding: '0.25rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label
                className="notion-btn btn-secondary btn-block btn-lg"
                style={{ cursor: 'pointer', textAlign: 'center', marginBottom: '0.75rem' }}
              >
                <Camera size={18} />
                <span>Sacar foto o Elegir archivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <div style={{ textAlign: 'center', margin: '0.65rem 0', color: 'var(--notion-text-subtle)', fontSize: '0.82rem' }}>
                — o ingresá un enlace directo de imagen —
              </div>

              <form onSubmit={handleUrlSubmit}>
                <div className="input-group" style={{ marginBottom: '0.65rem' }}>
                  <input
                    type="url"
                    className="notion-input"
                    placeholder="https://ejemplo.com/foto-regalo.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="notion-btn btn-primary btn-block">
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
              boxShadow: 'var(--shadow-modal)'
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
              <X size={18} />
            </button>
            <img
              src={previewImage}
              alt="Vista previa del regalo"
              style={{ maxWidth: '100%', maxHeight: '85vh', display: 'block', objectFit: 'contain', background: '#191919' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
