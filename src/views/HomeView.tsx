import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowRight, School, HeartHandshake } from 'lucide-react';
import { api } from '../services/api';
import { useSala } from '../context/SalaContext';
import type { Sala } from '../types';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useSala();

  const [modalCrear, setModalCrear] = useState(false);
  const [nombreSala, setNombreSala] = useState('');
  const [colegioSala, setColegioSala] = useState('');
  const [loadingCrear, setLoadingCrear] = useState(false);

  // Salas disponibles en tiempo real
  const [salasDisponibles, setSalasDisponibles] = useState<Sala[]>([]);

  useEffect(() => {
    const unsubscribe = api.subscribeToSalas((salas) => {
      setSalasDisponibles(salas);
    });
    return () => unsubscribe();
  }, []);

  const handleCrearSala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreSala.trim()) {
      showToast('Por favor completá el nombre de la sala', 'error');
      return;
    }

    setLoadingCrear(true);
    try {
      const nueva = await api.createSala(nombreSala, colegioSala);
      showToast(`¡Sala "${nueva.nombre}" creada con éxito! 🎉`, 'success');
      navigate(`/sala/${nueva.id}`);
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al crear la sala', 'error');
    } finally {
      setLoadingCrear(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Page Header Notion */}
      <header style={{ padding: '2.5rem 1.5rem 1.25rem', borderBottom: '1px solid var(--notion-divider)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🎈</div>

          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem', letterSpacing: '-0.025em' }}>
              LoCumpleanito
            </h1>
            <p style={{ color: 'var(--notion-text-muted)', fontSize: '0.98rem' }}>
              Colectas ordenadas y sencillas para los regalos del grado o jardín.
            </p>
          </div>
        </div>
      </header>

      <main style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Notion Callout de Bienvenida */}
        <div className="notion-callout notion-callout-yellow">
          <span className="notion-callout-icon">💡</span>
          <div className="notion-callout-body">
            <div style={{ fontWeight: 600, marginBottom: '0.2rem', color: 'var(--callout-yellow-text)' }}>
              ¿Cómo funciona la colecta?
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--callout-yellow-text)', lineHeight: 1.5, margin: 0 }}>
              Cada familia aporta un monto fijo mediante transferencia directa al Alias de quien compra el regalo. Avisa la transferencia y luego quién junta el dinero confirma haberlo recibido!
            </p>
            <div style={{ marginTop: '0.85rem' }}>
              <button
                onClick={() => setModalCrear(true)}
                className="notion-btn btn-primary btn-block btn-lg"
              >
                <PlusCircle size={18} />
                <span>Crear Sala para mi Grado o Jardín</span>
              </button>
            </div>
          </div>
        </div>

        {/* Salas (Notion Database List) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--notion-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <School size={15} />
              <span>Salas Disponibles</span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--notion-text-subtle)' }}>
              {salasDisponibles.length} {salasDisponibles.length === 1 ? 'sala' : 'salas'}
            </span>
          </div>

          {salasDisponibles.length === 0 ? (
            <div
              className="notion-callout"
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '2rem' }}>🏫</div>
              <p style={{ margin: 0, fontWeight: 500 }}>Aún no hay salas creadas.</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--notion-text-muted)', margin: 0 }}>
                ¡Sé el primero en crear una sala para tu grado o jardín!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {salasDisponibles.map(sala => (
                <div
                  key={sala.id}
                  onClick={() => navigate(`/sala/${sala.id}`)}
                  className="notion-list-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>🏫</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--notion-text)' }}>
                        {sala.nombre}
                      </div>
                      {sala.colegio && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--notion-text-muted)', marginTop: '0.15rem' }}>
                          {sala.colegio}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ color: 'var(--notion-text-subtle)', display: 'flex', alignItems: 'center' }}>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Notion */}
        <div style={{ marginTop: 'auto', textAlign: 'center', padding: '1.5rem 0 0.5rem', borderTop: '1px solid var(--notion-divider)', color: 'var(--notion-text-muted)', fontSize: '0.82rem' }}>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <HeartHandshake size={14} style={{ color: 'var(--tag-red-text)' }} />
            <span>Hecho con amor para las familias de la sala.</span>
          </p>
        </div>
      </main>

      {/* Modal Crear Sala */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🏫</span>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                Crear Nueva Sala
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--notion-text-muted)', marginBottom: '1.25rem' }}>
              Completá los datos para tu grado o sala escolar:
            </p>

            <form onSubmit={handleCrearSala}>
              <div className="input-group">
                <label className="input-label">Nombre de la Sala o Grado *</label>
                <input
                  type="text"
                  className="notion-input"
                  placeholder="Ej: Sala Amarilla (Turno Tarde)"
                  value={nombreSala}
                  onChange={(e) => setNombreSala(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Colegio o Jardín (opcional)</label>
                <input
                  type="text"
                  className="notion-input"
                  placeholder="Ej: Escuela N° 12"
                  value={colegioSala}
                  onChange={(e) => setColegioSala(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="notion-btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCrear}
                  className="notion-btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  {loadingCrear ? 'Creando...' : 'Crear Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
