import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Calendar, Cake, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { useSala } from '../context/SalaContext';
import type { Sala, Cumpleanios } from '../types';
import { Navbar } from '../components/Navbar';
import { UnlockModal } from '../components/UnlockModal';

export const SalaView: React.FC = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const navigate = useNavigate();
  const { isSalaUnlocked } = useSala();

  const [sala, setSala] = useState<Sala | null>(null);
  const [cumples, setCumples] = useState<Cumpleanios[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salaId) return;

    let unsubscribeCumples = () => {};

    const loadData = async () => {
      setLoading(true);
      const s = await api.getSala(salaId);
      setSala(s);

      if (s) {
        unsubscribeCumples = api.subscribeToCumples(s.id, (list) => {
          setCumples(list);
        });
      }
      setLoading(false);
    };

    loadData();
    return () => unsubscribeCumples();
  }, [salaId]);

  if (loading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>
          Cargando la sala... 🎈
        </p>
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="app-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <Navbar title="LoCumpleanito" showBack backTo="/" />
        <div className="card-zamba card-zamba-rojo" style={{ marginTop: '2rem' }}>
          <h2>Sala no encontrada 🎒</h2>
          <p style={{ margin: '0.85rem 0' }}>No pudimos encontrar la sala que buscás.</p>
          <button onClick={() => navigate('/')} className="btn-zamba btn-blanco">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Si no está desbloqueada en este navegador, pedir palabra clave
  const unlocked = isSalaUnlocked(sala.id);

  const cumplesActivos = cumples.filter(c => c.estado === 'activo');
  const cumplesCerrados = cumples.filter(c => c.estado === 'cerrado');

  const formatFecha = (iso: string) => {
    try {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return iso;
    }
  };

  const getDiasFaltantes = (isoFecha: string) => {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const [y, m, d] = isoFecha.split('-').map(Number);
      const cumpleFecha = new Date(y, m - 1, d);
      const diffTime = cumpleFecha.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '¡Hoy es el festejo! 🥳';
      if (diffDays === 1) return '¡Mañana es el cumple! 🎈';
      if (diffDays > 1) return `Faltan ${diffDays} días ⏰`;
      return 'Festejo realizado 🎉';
    } catch {
      return '';
    }
  };

  return (
    <div className="app-container">
      <Navbar
        title={sala.nombre}
        subtitle={sala.colegio || 'Sala Escolar'}
        showBack
        backTo="/"
      />

      {!unlocked && <UnlockModal sala={sala} />}

      <main style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Banner de Acción Rápida: Nuevo Cumpleaños */}
        <div
          className="card-zamba card-zamba-sol"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.2rem',
            position: 'relative'
          }}
        >
          <div>
            <span className="badge-zamba badge-sol" style={{ marginBottom: '0.25rem' }}>
              COLECTA DE SALA
            </span>
            <h3 style={{ fontSize: '1.25rem', margin: '0.2rem 0 0' }}>
              ¿Se acerca un cumpleaños?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--z-tinta-suave)', margin: 0 }}>
              Cualquier padre puede armar la colecta del regalo.
            </p>
          </div>

          <button
            onClick={() => navigate(`/sala/${sala.id}/nuevo`)}
            className="btn-zamba btn-verde btn-lg"
            style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, flexShrink: 0 }}
            title="Crear Cumpleaños"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Sección de Cumpleaños Activos */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <Cake size={22} color="var(--z-celeste-dark)" />
              <span>Cumples en Colecta ({cumplesActivos.length})</span>
            </h2>
          </div>

          {cumplesActivos.length === 0 ? (
            <div
              className="card-zamba"
              style={{
                textAlign: 'center',
                padding: '2rem 1.25rem',
                background: '#ffffff',
                borderStyle: 'dashed'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎈</div>
              <h3>No hay colectas activas en este momento</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--z-tinta-suave)', margin: '0.5rem 0 1.25rem' }}>
                ¿Cumple años algún compañero pronto? Podés iniciar la colecta ahora mismo.
              </p>
              <button
                onClick={() => navigate(`/sala/${sala.id}/nuevo`)}
                className="btn-zamba btn-verde"
              >
                <Plus size={18} />
                <span>+ Crear Primer Cumpleaños</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cumplesActivos.map(c => {
                const diasTexto = getDiasFaltantes(c.fechaCumple);

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/sala/${sala.id}/cumple/${c.id}`)}
                    className="card-zamba card-zamba-celeste"
                    style={{ cursor: 'pointer', padding: '1.25rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="stamp-cumple" style={{ fontSize: '1.15rem' }}>
                            {c.nombreAgasajado}
                          </span>
                          <span className="badge-zamba badge-verde" style={{ fontSize: '0.75rem' }}>
                            <Clock size={12} />
                            {diasTexto}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--z-tinta-suave)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} />
                          <span>Festejo: {formatFecha(c.fechaCumple)}</span>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--z-tinta-suave)', display: 'block' }}>
                          POR FAMILIA
                        </span>
                        <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--z-tinta)' }}>
                          ${c.montoPorPersona.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(255,255,255,0.75)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.6rem 0.75rem',
                        border: '1.5px solid var(--z-borde)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        marginTop: '0.75rem'
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--z-tinta-suave)' }}>Alias: </span>
                        <strong>{c.alias}</strong>
                      </div>
                      <span style={{ color: 'var(--z-celeste-dark)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span>Ver colecta</span>
                        <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sección de Cumpleaños Pasados/Cerrados */}
        {cumplesCerrados.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--z-tinta-suave)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' }}>
              <CheckCircle size={16} />
              <span>Cumpleaños finalizados ({cumplesCerrados.length})</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {cumplesCerrados.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/sala/${sala.id}/cumple/${c.id}`)}
                  className="card-zamba"
                  style={{
                    padding: '0.75rem 1rem',
                    marginBottom: 0,
                    cursor: 'pointer',
                    background: '#f8f8f8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{c.nombreAgasajado}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--z-tinta-suave)' }}>
                      Festejado el {formatFecha(c.fechaCumple)}
                    </p>
                  </div>
                  <span className="badge-zamba badge-verde" style={{ fontSize: '0.75rem' }}>
                    Finalizado
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
