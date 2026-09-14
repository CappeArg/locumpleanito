import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Share2, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Trash2, 
  Building2, 
  User, 
  Check, 
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useSala } from '../context/SalaContext';
import type { Sala, Cumpleanios, Participante } from '../types';
import { Navbar } from '../components/Navbar';
import { CopyButton } from '../components/CopyButton';
import { WhatsAppModal } from '../components/WhatsAppModal';
import { GiftGallery } from '../components/GiftGallery';
import { triggerConfetti, triggerMegaConfetti } from '../utils/confetti';

export const CumpleView: React.FC = () => {
  const { salaId, cumpleId } = useParams<{ salaId: string; cumpleId: string }>();
  const navigate = useNavigate();
  const { showToast } = useSala();

  const [sala, setSala] = useState<Sala | null>(null);
  const [cumple, setCumple] = useState<Cumpleanios | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [modalSumarse, setModalSumarse] = useState(false);
  const [modalWhatsApp, setModalWhatsApp] = useState(false);
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [notaOpcional, setNotaOpcional] = useState('');
  const [guardandoPago, setGuardandoPago] = useState(false);

  useEffect(() => {
    if (!salaId || !cumpleId) return;

    let unsubCumple = () => {};
    let unsubParts = () => {};

    const loadData = async () => {
      setLoading(true);
      const s = await api.getSala(salaId);
      setSala(s);

      unsubCumple = api.subscribeToCumple(cumpleId, (c) => {
        setCumple(c);
      });

      unsubParts = api.subscribeToParticipantes(cumpleId, (parts) => {
        setParticipantes(parts);
      });

      setLoading(false);
    };

    loadData();

    return () => {
      unsubCumple();
      unsubParts();
    };
  }, [salaId, cumpleId]);

  if (loading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--notion-text-muted)', fontSize: '0.95rem' }}>
          Cargando colecta... 🎈
        </p>
      </div>
    );
  }

  if (!sala || !cumple) {
    return (
      <div className="app-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <Navbar title="LoCumpleanito" showBack backTo="/" />
        <div className="card-zamba" style={{ marginTop: '2rem' }}>
          <h2>Cumpleaños no encontrado 🎂</h2>
          <p style={{ margin: '0.85rem 0', color: 'var(--notion-text-muted)' }}>
            No pudimos encontrar los datos de esta colecta.
          </p>
          <button onClick={() => navigate(salaId ? `/sala/${salaId}` : '/')} className="notion-btn btn-secondary">
            Volver a la Sala
          </button>
        </div>
      </div>
    );
  }


  // Cálculos
  const confirmados = participantes.filter(p => p.estado === 'confirmado');
  const notificados = participantes.filter(p => p.estado === 'notificado');
  const totalAportantes = participantes.length;
  const dineroRecaudado = confirmados.length * cumple.montoPorPersona;
  const dineroEnCamino = notificados.length * cumple.montoPorPersona;

  const formatFecha = (iso: string) => {
    try {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return iso;
    }
  };

  // Registrar aviso de transferencia
  const handleAvisarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreFamilia.trim()) {
      showToast('Ingresá el nombre de tu hijo/a o familia', 'error');
      return;
    }

    setGuardandoPago(true);
    try {
      await api.sumarParticipante(cumple.id, nombreFamilia, notaOpcional);
      triggerConfetti();
      showToast(`¡Gracias ${nombreFamilia}! Registramos tu transferencia 🎈`, 'success');
      setNombreFamilia('');
      setNotaOpcional('');
      setModalSumarse(false);
    } catch (err) {
      console.error(err);
      showToast('Error al registrar la transferencia', 'error');
    } finally {
      setGuardandoPago(false);
    }
  };

  // Validación rápida por el comprador
  const handleToggleValidacion = async (p: Participante) => {
    const nuevoEstado = p.estado === 'confirmado' ? 'notificado' : 'confirmado';
    await api.toggleEstadoParticipante(p.id, nuevoEstado);
    
    if (nuevoEstado === 'confirmado') {
      triggerConfetti();
      showToast(`¡Pago de ${p.nombreFamilia} verificado! ✅`, 'success');
    } else {
      showToast(`Pago marcado como pendiente`, 'info');
    }
  };

  const handleEliminarParticipante = async (p: Participante) => {
    if (window.confirm(`¿Querés eliminar el registro de ${p.nombreFamilia}?`)) {
      await api.eliminarParticipante(p.id);
      showToast('Registro eliminado', 'info');
    }
  };

  const handleToggleCerrarCumple = async () => {
    const nuevoEstado = cumple.estado === 'activo' ? 'cerrado' : 'activo';
    const confirmMsg = nuevoEstado === 'cerrado' 
      ? '¿Finalizar esta colecta? (Ya se compró el regalo)' 
      : '¿Reabrir esta colecta?';

    if (window.confirm(confirmMsg)) {
      await api.updateCumple(cumple.id, { estado: nuevoEstado });
      if (nuevoEstado === 'cerrado') {
        triggerMegaConfetti();
        showToast('🎉 ¡Colecta finalizada con éxito!', 'success');
      } else {
        showToast('Colecta reabierta', 'info');
      }
    }
  };

  return (
    <div className="app-container">
      <Navbar
        title={cumple.nombreAgasajado}
        subtitle={sala.nombre}
        showBack
        backTo={`/sala/${sala.id}`}
        rightAction={
          <button
            onClick={() => setModalWhatsApp(true)}
            className="notion-btn btn-secondary btn-sm"
            title="Compartir en WhatsApp"
          >
            <Share2 size={14} />
            <span>Compartir</span>
          </button>
        }
      />


      <main style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Page Header Notion */}
        <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--notion-divider)' }}>
          <div style={{ fontSize: '2.4rem', lineHeight: 1, marginBottom: '0.5rem' }}>🎂</div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>
            Cumpleaños de {cumple.nombreAgasajado}
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div className="notion-property-row" style={{ borderBottom: 'none', padding: '0.2rem 0' }}>
              <span className="notion-property-label">
                <Calendar size={14} />
                <span>Fecha festejo</span>
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{formatFecha(cumple.fechaCumple)}</span>
            </div>

            {cumple.fechaLimitePago && (
              <div className="notion-property-row" style={{ borderBottom: 'none', padding: '0.2rem 0' }}>
                <span className="notion-property-label">
                  <Clock size={14} />
                  <span>Límite para aportar</span>
                </span>
                <span className="notion-tag tag-red" style={{ fontSize: '0.78rem' }}>
                  {formatFecha(cumple.fechaLimitePago)}
                </span>
              </div>
            )}

            <div className="notion-property-row" style={{ borderBottom: 'none', padding: '0.2rem 0' }}>
              <span className="notion-property-label">
                <span>Estado</span>
              </span>
              <span className={`notion-tag ${cumple.estado === 'activo' ? 'tag-green' : 'tag-gray'}`}>
                {cumple.estado === 'activo' ? 'Colecta Abierta' : 'Finalizada'}
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Datos de Transferencia (1-Tap Copy) */}
        <div className="card-zamba" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--notion-divider)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--notion-text-subtle)', textTransform: 'uppercase' }}>
                Monto por familia
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--notion-text)' }}>
                ${cumple.montoPorPersona.toLocaleString('es-AR')}
              </div>
            </div>
            
            <CopyButton
              textToCopy={cumple.montoPorPersona.toString()}
              label="Copiar Monto"
              successMessage="Monto copiado 💵"
              size="sm"
              variant="secondary"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Alias */}
            <div style={{ background: 'var(--notion-hover-bg)', border: '1px solid var(--notion-border)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--notion-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Alias de transferencia
                </span>
                <span style={{ fontSize: '1.05rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--btn-blue-bg)', wordBreak: 'break-all' }}>
                  {cumple.alias}
                </span>
              </div>
              <CopyButton
                textToCopy={cumple.alias}
                label="Copiar"
                successMessage="Alias copiado 📋"
                size="sm"
                variant="primary"
              />
            </div>

            {/* CBU / CVU */}
            {cumple.cbu && (
              <div style={{ background: 'var(--notion-card-bg)', border: '1px solid var(--notion-border)', borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--notion-text-muted)', display: 'block' }}>
                    CBU / CVU
                  </span>
                  <span style={{ fontSize: '0.86rem', fontFamily: 'var(--font-mono)' }}>
                    {cumple.cbu}
                  </span>
                </div>
                <CopyButton
                  textToCopy={cumple.cbu}
                  label="Copiar"
                  size="sm"
                  variant="secondary"
                />
              </div>
            )}

            {/* Titular y Banco */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem', color: 'var(--notion-text-muted)', paddingTop: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} style={{ color: 'var(--notion-text-subtle)' }} />
                <span>Titular: <strong style={{ color: 'var(--notion-text)' }}>{cumple.titular}</strong></span>
              </div>
              {cumple.banco && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={14} style={{ color: 'var(--notion-text-subtle)' }} />
                  <span>Banco/Billetera: <strong style={{ color: 'var(--notion-text)' }}>{cumple.banco}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón Principal: ¡Me sumo y ya transferí! */}
        {cumple.estado === 'activo' && (
          <button
            onClick={() => setModalSumarse(true)}
            className="notion-btn btn-primary btn-block btn-lg"
          >
            <UserPlus size={18} />
            <span>¡Me sumo y ya transferí! 🚀</span>
          </button>
        )}

        {/* Termómetro de Progreso Notion */}
        <div className="card-zamba" style={{ padding: '1.15rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCheck size={16} style={{ color: '#0f7b6c' }} />
              <span>Progreso de la Colecta</span>
            </h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {confirmados.length} {confirmados.length === 1 ? 'confirmado' : 'confirmados'} ({totalAportantes} sumados)
            </span>
          </div>

          <div className="progress-bar-container" style={{ marginBottom: '0.65rem' }}>
            <div
              className="progress-bar-fill progress-bar-green"
              style={{ width: `${Math.min(100, Math.max(5, totalAportantes > 0 ? (confirmados.length / totalAportantes) * 100 : 0))}%` }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--notion-text-muted)' }}>
            <span>Recaudado confirmado: <strong style={{ color: 'var(--notion-text)' }}>${dineroRecaudado.toLocaleString('es-AR')}</strong></span>
            {dineroEnCamino > 0 && (
              <span className="notion-tag tag-yellow">
                Por validar: ${dineroEnCamino.toLocaleString('es-AR')}
              </span>
            )}
          </div>
        </div>

        {/* Lista de Familias (Notion Table / List) */}
        <div className="card-zamba" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
              Familias que aportan ({participantes.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--notion-text-subtle)' }}>
              Toca para validar
            </span>
          </div>

          {participantes.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem',
                color: 'var(--notion-text-muted)',
                background: 'var(--callout-gray-bg)',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--notion-border-strong)'
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>Aún no se registró ningún aporte.</p>
              <p style={{ fontSize: '0.82rem', margin: '0.35rem 0 0' }}>
                ¡Hacé tu transferencia y sé el primero en sumarte a la lista!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {participantes.map(p => {
                const isConfirmed = p.estado === 'confirmado';

                return (
                  <div
                    key={p.id}
                    className="notion-list-item"
                    style={{
                      padding: '0.65rem 0.85rem',
                      cursor: 'default',
                      background: isConfirmed ? '#fafcfb' : '#fffdfa'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--notion-text)' }}>
                          {p.nombreFamilia}
                        </span>
                        {isConfirmed ? (
                          <span className="notion-tag tag-green" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={11} /> Confirmado
                          </span>
                        ) : (
                          <span className="notion-tag tag-yellow" style={{ fontSize: '0.7rem' }}>
                            <Clock size={11} /> Avisó transferencia
                          </span>
                        )}
                      </div>
                      {p.nota && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--notion-text-muted)', margin: '0.15rem 0 0', fontStyle: 'italic' }}>
                          "{p.nota}"
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* Botón para validar pago */}
                      <button
                        onClick={() => handleToggleValidacion(p)}
                        className={`notion-btn btn-sm ${isConfirmed ? 'btn-secondary' : 'btn-verde'}`}
                        style={{ padding: '0.3rem 0.55rem' }}
                        title={isConfirmed ? 'Marcar como pendiente' : 'Confirmar acreditación del dinero'}
                      >
                        {isConfirmed ? (
                          <>
                            <RotateCcw size={12} />
                            <span style={{ fontSize: '0.72rem' }}>Pendiente</span>
                          </>
                        ) : (
                          <>
                            <Check size={12} />
                            <span style={{ fontSize: '0.72rem' }}>Acreditar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleEliminarParticipante(p)}
                        className="notion-btn btn-ghost btn-sm"
                        style={{ padding: '0.3rem', color: 'var(--notion-text-subtle)' }}
                        title="Eliminar registro"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sección de Fotos del Regalo */}
        <GiftGallery
          cumpleId={cumple.id}
          fotosRegalo={cumple.fotosRegalo}
          regaloDescripcion={cumple.regaloDescripcion}
          isClosed={cumple.estado === 'cerrado'}
        />

        {/* Opciones de Finalización / Administración */}
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
          <button
            onClick={handleToggleCerrarCumple}
            className="notion-btn btn-ghost btn-sm"
            style={{ color: 'var(--notion-text-muted)' }}
          >
            {cumple.estado === 'activo' ? '🔒 Marcar colecta como finalizada' : '🔓 Reabrir colecta'}
          </button>
        </div>
      </main>

      {/* Modal Registrar Transferencia */}
      {modalSumarse && (
        <div className="modal-overlay" onClick={() => setModalSumarse(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🎁</span>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                Avisar mi Transferencia
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--notion-text-muted)', marginBottom: '1rem' }}>
              Transferiste <strong>${cumple.montoPorPersona.toLocaleString('es-AR')}</strong> al Alias <code>{cumple.alias}</code>.
            </p>

            <form onSubmit={handleAvisarPago}>
              <div className="input-group">
                <label className="input-label">¿A nombre de quién registramos el pago? *</label>
                <input
                  type="text"
                  className="notion-input"
                  placeholder="Ej: Familia de Sofi / Mamá de Lucas"
                  value={nombreFamilia}
                  onChange={(e) => setNombreFamilia(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Mensaje o saludo para el cumpleañero (opcional)</label>
                <input
                  type="text"
                  className="notion-input"
                  placeholder="Ej: ¡Muy feliz cumple Mateo!"
                  value={notaOpcional}
                  onChange={(e) => setNotaOpcional(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setModalSumarse(false)}
                  className="notion-btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPago}
                  className="notion-btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  {guardandoPago ? 'Guardando...' : '¡Listo, ya transferí! 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal WhatsApp */}
      {modalWhatsApp && (
        <WhatsAppModal
          cumple={cumple}
          participantes={participantes}
          salaNombre={sala.nombre}
          onClose={() => setModalWhatsApp(false)}
        />
      )}
    </div>
  );
};
