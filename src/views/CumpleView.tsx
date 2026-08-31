import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Share2, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Trash2, 
  Sparkles, 
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
import { UnlockModal } from '../components/UnlockModal';
import { triggerConfetti, triggerMegaConfetti } from '../utils/confetti';

export const CumpleView: React.FC = () => {
  const { salaId, cumpleId } = useParams<{ salaId: string; cumpleId: string }>();
  const navigate = useNavigate();
  const { isSalaUnlocked, showToast } = useSala();

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
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>
          Cargando colecta... 🎈
        </p>
      </div>
    );
  }

  if (!sala || !cumple) {
    return (
      <div className="app-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <Navbar title="LoCumpleanito" showBack backTo="/" />
        <div className="card-zamba card-zamba-rojo" style={{ marginTop: '2rem' }}>
          <h2>Cumpleaños no encontrado 🎂</h2>
          <p style={{ margin: '0.85rem 0' }}>No pudimos encontrar los datos de esta colecta.</p>
          <button onClick={() => navigate(salaId ? `/sala/${salaId}` : '/')} className="btn-zamba btn-blanco">
            Volver a la Sala
          </button>
        </div>
      </div>
    );
  }

  const unlocked = isSalaUnlocked(sala.id);

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
      showToast(`¡Pago de ${p.nombreFamilia} confirmado! ✅`, 'success');
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
        title={sala.nombre}
        subtitle="Colecta de Cumpleaños"
        showBack
        backTo={`/sala/${sala.id}`}
        rightAction={
          <button
            onClick={() => setModalWhatsApp(true)}
            className="btn-zamba btn-sol btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.4rem 0.75rem', gap: '0.35rem' }}
            title="Compartir en WhatsApp"
          >
            <Share2 size={16} />
            <span>Compartir</span>
          </button>
        }
      />

      {!unlocked && <UnlockModal sala={sala} />}

      <main style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Tarjeta Hero del Agasajado */}
        <div className="card-zamba card-zamba-sol" style={{ position: 'relative', textAlign: 'center', padding: '1.5rem 1.25rem 1.25rem' }}>
          <div className="tape-sticker" />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--z-celeste)', color: '#fff', padding: '0.25rem 0.85rem', borderRadius: 'var(--radius-full)', border: '2px solid var(--z-borde)', marginBottom: '0.65rem', boxShadow: 'var(--shadow-sm)' }}>
            <Sparkles size={14} color="#FFBC00" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>REGALO COMUNITARIO</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', color: 'var(--z-tinta)', lineHeight: 1.1, margin: '0.2rem 0' }}>
            {cumple.nombreAgasajado}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span className="badge-zamba badge-celeste" style={{ fontSize: '0.85rem' }}>
              <Calendar size={14} />
              Festejo: {formatFecha(cumple.fechaCumple)}
            </span>
            {cumple.fechaLimitePago && (
              <span className="badge-zamba badge-rojo" style={{ fontSize: '0.85rem' }}>
                <Clock size={14} />
                Límite pago: {formatFecha(cumple.fechaLimitePago)}
              </span>
            )}
          </div>

          {cumple.estado === 'cerrado' && (
            <div style={{ marginTop: '0.85rem', background: 'var(--z-verde)', color: '#fff', padding: '0.4rem', borderRadius: 'var(--radius-sm)', fontWeight: 800, border: '2px solid var(--z-borde)' }}>
              🎉 ¡Colecta finalizada y regalo entregado!
            </div>
          )}
        </div>

        {/* Tarjeta de Datos de Transferencia (1-Tap Copy) */}
        <div className="card-zamba" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed var(--z-papel-dark)', paddingBottom: '0.75rem', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--z-tinta-suave)', display: 'block' }}>
                MONTO POR FAMILIA
              </span>
              <span style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 900, color: 'var(--z-verde-dark)' }}>
                ${cumple.montoPorPersona.toLocaleString('es-AR')}
              </span>
            </div>
            
            <CopyButton
              textToCopy={cumple.montoPorPersona.toString()}
              label="Copiar Monto"
              successMessage="¡Monto copiado! 💵"
              variant="verde"
              size="md"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Alias */}
            <div style={{ background: 'var(--z-papel)', border: '2px solid var(--z-borde)', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--z-tinta-suave)', display: 'block' }}>
                  ALIAS DE TRANSFERENCIA
                </span>
                <span style={{ fontSize: '1.15rem', fontFamily: 'monospace', fontWeight: 900, color: 'var(--z-celeste-dark)', wordBreak: 'break-all' }}>
                  {cumple.alias}
                </span>
              </div>
              <CopyButton
                textToCopy={cumple.alias}
                label="Copiar Alias"
                successMessage="¡Alias copiado! 📋"
                variant="sol"
                size="md"
              />
            </div>

            {/* CBU / CVU */}
            {cumple.cbu && (
              <div style={{ background: 'var(--z-crema)', border: '1.5px solid var(--z-borde)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--z-tinta-suave)', display: 'block' }}>
                    CBU / CVU
                  </span>
                  <span style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    {cumple.cbu}
                  </span>
                </div>
                <CopyButton
                  textToCopy={cumple.cbu}
                  label="Copiar"
                  size="sm"
                  variant="blanco"
                />
              </div>
            )}

            {/* Titular y Banco */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.88rem', padding: '0.25rem 0.5rem', color: 'var(--z-tinta-suave)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} color="var(--z-tinta)" />
                <span>Titular: <strong>{cumple.titular}</strong></span>
              </div>
              {cumple.banco && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={15} color="var(--z-tinta)" />
                  <span>Banco / Billetera: <strong>{cumple.banco}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón Principal: ¡Me sumo y ya transferí! */}
        {cumple.estado === 'activo' && (
          <button
            onClick={() => setModalSumarse(true)}
            className="btn-zamba btn-verde btn-lg btn-block"
            style={{ fontSize: '1.25rem', padding: '1rem', boxShadow: 'var(--shadow-lg)' }}
          >
            <UserPlus size={24} />
            <span>¡Me sumo y ya transferí! 🚀</span>
          </button>
        )}

        {/* Termómetro de Recaudación y Progreso */}
        <div className="card-zamba card-zamba-celeste" style={{ padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCheck size={18} color="var(--z-verde-dark)" />
              <span>Progreso de la Colecta</span>
            </h3>
            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>
              {confirmados.length} {confirmados.length === 1 ? 'pago' : 'pagos'} ({totalAportantes} sumados)
            </span>
          </div>

          <div className="progress-bar-container" style={{ marginBottom: '0.65rem' }}>
            <div
              className="progress-bar-fill progress-bar-stripes"
              style={{ width: `${Math.min(100, Math.max(8, totalAportantes > 0 ? (confirmados.length / totalAportantes) * 100 : 0))}%` }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--z-tinta-suave)' }}>
            <span>Confirmado: <strong>${dineroRecaudado.toLocaleString('es-AR')}</strong></span>
            {dineroEnCamino > 0 && (
              <span style={{ color: 'var(--z-sol-dark)' }}>
                Por validar: <strong>${dineroEnCamino.toLocaleString('es-AR')}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Lista Transparente de Familias y Participantes */}
        <div className="card-zamba" style={{ background: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
              Familias que aportan ({participantes.length})
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--z-tinta-suave)' }}>
              Toca para validar
            </span>
          </div>

          {participantes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--z-tinta-suave)', background: 'var(--z-papel)', borderRadius: 'var(--radius-sm)', border: '2px dashed var(--z-borde)' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Aún no se registró ningún pago.</p>
              <p style={{ fontSize: '0.85rem', margin: '0.35rem 0 0' }}>
                ¡Sé el primero en transferir y sumarte a la lista!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {participantes.map(p => {
                const isConfirmed = p.estado === 'confirmado';

                return (
                  <div
                    key={p.id}
                    className="card-zamba"
                    style={{
                      padding: '0.75rem 0.9rem',
                      marginBottom: 0,
                      background: isConfirmed ? 'var(--z-verde-light)' : 'var(--z-sol-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                          {p.nombreFamilia}
                        </span>
                        {isConfirmed ? (
                          <span className="badge-zamba badge-verde" style={{ fontSize: '0.7rem' }}>
                            <CheckCircle2 size={11} /> Confirmado
                          </span>
                        ) : (
                          <span className="badge-zamba badge-sol" style={{ fontSize: '0.7rem' }}>
                            <Clock size={11} /> Avisó transferencia
                          </span>
                        )}
                      </div>
                      {p.nota && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--z-tinta-suave)', margin: '0.2rem 0 0', fontStyle: 'italic' }}>
                          "{p.nota}"
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {/* Botón para validar pago */}
                      <button
                        onClick={() => handleToggleValidacion(p)}
                        className={`btn-zamba btn-sm ${isConfirmed ? 'btn-blanco' : 'btn-verde'}`}
                        style={{ padding: '0.4rem 0.65rem' }}
                        title={isConfirmed ? 'Desmarcar confirmación' : 'Confirmar que llegó el dinero'}
                      >
                        {isConfirmed ? (
                          <>
                            <RotateCcw size={14} />
                            <span style={{ fontSize: '0.75rem' }}>Desmarcar</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} strokeWidth={3} />
                            <span style={{ fontSize: '0.75rem' }}>Confirmar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleEliminarParticipante(p)}
                        style={{ background: 'none', border: 'none', color: 'var(--z-tinta-suave)', cursor: 'pointer', padding: '4px' }}
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sección de Rendición de Cuentas y Fotos */}
        <GiftGallery
          cumpleId={cumple.id}
          fotosRegalo={cumple.fotosRegalo}
          fotosComprobantes={cumple.fotosComprobantes}
          regaloDescripcion={cumple.regaloDescripcion}
          isClosed={cumple.estado === 'cerrado'}
        />

        {/* Opciones de Finalización / Administración */}
        <div style={{ textAlign: 'center', padding: '0.5rem 0 1.5rem' }}>
          <button
            onClick={handleToggleCerrarCumple}
            className="btn-zamba btn-blanco btn-sm"
            style={{ color: cumple.estado === 'activo' ? 'var(--z-tinta-suave)' : 'var(--z-celeste-dark)' }}
          >
            {cumple.estado === 'activo' ? '🔒 Marcar Colecta como Finalizada' : '🔓 Reabrir Colecta'}
          </button>
        </div>
      </main>

      {/* Modal Registrar Transferencia */}
      {modalSumarse && (
        <div className="modal-overlay" onClick={() => setModalSumarse(false)}>
          <div className="modal-content card-zamba-sol" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>
              ¡Avisar mi Transferencia! 🎁
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--z-tinta-suave)', marginBottom: '1rem' }}>
              Transferiste <strong>${cumple.montoPorPersona.toLocaleString('es-AR')}</strong> al Alias <code>{cumple.alias}</code>.
            </p>

            <form onSubmit={handleAvisarPago}>
              <div className="input-group">
                <label className="input-label">¿A nombre de quién registramos el pago?:</label>
                <input
                  type="text"
                  className="input-zamba"
                  placeholder="Ej: Familia de Lucas / Mamá de Sofi"
                  value={nombreFamilia}
                  onChange={(e) => setNombreFamilia(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Mensaje o saludo para el cumpleañero (opcional):</label>
                <input
                  type="text"
                  className="input-zamba"
                  placeholder="Ej: ¡Feliz cumple Mateo!"
                  value={notaOpcional}
                  onChange={(e) => setNotaOpcional(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setModalSumarse(false)}
                  className="btn-zamba btn-blanco"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPago}
                  className="btn-zamba btn-verde"
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
