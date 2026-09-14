import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Calendar, Cake, ArrowRight, CheckCircle2, Clock, School } from 'lucide-react';
import { api } from '../services/api';
import type { Sala, Cumpleanios } from '../types';
import { Navbar } from '../components/Navbar';

export const SalaView: React.FC = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const navigate = useNavigate();

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
        <p style={{ color: 'var(--notion-text-muted)', fontSize: '0.95rem' }}>
          Cargando sala... 🎈
        </p>
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="app-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <Navbar title="LoCumpleanito" showBack backTo="/" />
        <div className="card-zamba" style={{ marginTop: '2rem' }}>
          <h2>Sala no encontrada 🎒</h2>
          <p style={{ margin: '0.85rem 0', color: 'var(--notion-text-muted)' }}>
            No pudimos encontrar la sala que buscás.
          </p>
          <button onClick={() => navigate('/')} className="notion-btn btn-secondary">
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

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
      
      if (diffDays === 0) return { texto: '¡Hoy es el festejo! 🥳', variant: 'tag-yellow' };
      if (diffDays === 1) return { texto: '¡Mañana es el cumple! 🎈', variant: 'tag-yellow' };
      if (diffDays > 1) return { texto: `Faltan ${diffDays} días`, variant: 'tag-blue' };
      return { texto: 'Festejo realizado', variant: 'tag-green' };
    } catch {
      return { texto: '', variant: 'tag-gray' };
    }
  };

  return (
    <div className="app-container">
      <Navbar
        title={sala.nombre}
        subtitle={sala.colegio || 'Sala Escolar'}
        showBack
        backTo="/"
        rightAction={
          <button
            onClick={() => navigate(`/sala/${sala.id}/nuevo`)}
            className="notion-btn btn-primary btn-sm"
          >
            <Plus size={14} />
            <span>Nuevo</span>
          </button>
        }
      />

      <main style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Page Title & Properties Header */}
        <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--notion-divider)' }}>
          <div style={{ fontSize: '2.2rem', lineHeight: 1, marginBottom: '0.5rem' }}>🏫</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.65rem' }}>{sala.nombre}</h1>
          
          {sala.colegio && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div className="notion-property-row" style={{ borderBottom: 'none', padding: '0.2rem 0' }}>
                <span className="notion-property-label">
                  <School size={14} />
                  <span>Institución</span>
                </span>
                <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{sala.colegio}</span>
              </div>
            </div>
          )}
        </div>

        {/* Banner de Acción Rápida */}
        <div
          className="notion-callout notion-callout-blue"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🎂</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                ¿Próximo cumpleaños en la sala?
              </div>
              <p style={{ fontSize: '0.82rem', margin: 0, opacity: 0.85 }}>
                Cualquier familia puede iniciar la colecta en segundos.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/sala/${sala.id}/nuevo`)}
            className="notion-btn btn-blue btn-sm"
          >
            <Plus size={14} />
            <span>Crear</span>
          </button>
        </div>

        {/* Sección de Cumpleaños Activos (Notion Database Board) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.45rem', margin: 0 }}>
              <Cake size={18} style={{ color: 'var(--notion-text-muted)' }} />
              <span>Cumpleaños en Colecta ({cumplesActivos.length})</span>
            </h2>
          </div>

          {cumplesActivos.length === 0 ? (
            <div
              className="notion-callout"
              style={{
                textAlign: 'center',
                padding: '2rem 1.25rem',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '2rem' }}>🎈</div>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>No hay colectas activas en este momento</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--notion-text-muted)', margin: 0 }}>
                ¿Cumple años algún compañero/a pronto? Podés iniciar la colecta ahora.
              </p>
              <button
                onClick={() => navigate(`/sala/${sala.id}/nuevo`)}
                className="notion-btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                <Plus size={14} />
                <span>Iniciar Primer Cumpleaños</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {cumplesActivos.map(c => {
                const diasInfo = getDiasFaltantes(c.fechaCumple);

                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/sala/${sala.id}/cumple/${c.id}`)}
                    className="card-zamba"
                    style={{
                      cursor: 'pointer',
                      padding: '1rem 1.15rem',
                      marginBottom: 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--notion-text)' }}>
                            {c.nombreAgasajado}
                          </span>
                          {diasInfo.texto && (
                            <span className={`notion-tag ${diasInfo.variant}`}>
                              <Clock size={11} />
                              <span>{diasInfo.texto}</span>
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--notion-text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} />
                          <span>Festejo: {formatFecha(c.fechaCumple)}</span>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--notion-text-subtle)', textTransform: 'uppercase' }}>
                          Por familia
                        </span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--notion-text)' }}>
                          ${c.montoPorPersona.toLocaleString('es-AR')}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'var(--notion-hover-bg)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.5rem 0.75rem',
                        border: '1px solid var(--notion-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.84rem'
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--notion-text-muted)' }}>Alias: </span>
                        <code>{c.alias}</code>
                      </div>
                      <span style={{ color: 'var(--btn-blue-bg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <span>Ver colecta</span>
                        <ArrowRight size={13} />
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
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '0.92rem', color: 'var(--notion-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={15} />
              <span>Finalizados ({cumplesCerrados.length})</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cumplesCerrados.map(c => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/sala/${sala.id}/cumple/${c.id}`)}
                  className="notion-list-item"
                  style={{ padding: '0.65rem 0.85rem' }}
                >
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{c.nombreAgasajado}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--notion-text-muted)' }}>
                      Festejado el {formatFecha(c.fechaCumple)}
                    </div>
                  </div>
                  <span className="notion-tag tag-green">
                    Completado
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
