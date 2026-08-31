import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, PlusCircle, ArrowRight, School, KeyRound, HeartHandshake } from 'lucide-react';
import { api } from '../services/api';
import { useSala } from '../context/SalaContext';
import type { Sala } from '../types';
import { BuntingBanner } from '../components/BuntingBanner';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { unlockSala, showToast } = useSala();

  const [modalCrear, setModalCrear] = useState(false);
  const [nombreSala, setNombreSala] = useState('');
  const [claveSala, setClaveSala] = useState('');
  const [colegioSala, setColegioSala] = useState('');
  const [loadingCrear, setLoadingCrear] = useState(false);

  // Salas guardadas o demo
  const [salasDisponibles, setSalasDisponibles] = useState<Sala[]>([]);
  const [buscarClave, setBuscarClave] = useState('');
  const [errorBuscar, setErrorBuscar] = useState(false);

  useEffect(() => {
    const fetchDemoSalas = async () => {
      const s = await api.getSala('sala-arcoiris');
      if (s) setSalasDisponibles([s]);
    };
    fetchDemoSalas();
  }, []);

  const handleCrearSala = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreSala.trim() || !claveSala.trim()) {
      showToast('Por favor completá el nombre y la palabra clave', 'error');
      return;
    }

    setLoadingCrear(true);
    try {
      const nueva = await api.createSala(nombreSala, claveSala, colegioSala);
      unlockSala(nueva.id, claveSala, claveSala);
      showToast(`¡Sala "${nueva.nombre}" creada con éxito! 🎉`, 'success');
      navigate(`/sala/${nueva.id}`);
    } catch (err) {
      console.error(err);
      showToast('Hubo un error al crear la sala', 'error');
    } finally {
      setLoadingCrear(false);
    }
  };

  const handleEntrarConClave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buscarClave.trim()) return;

    // Buscar si alguna sala coincide con la clave
    const demo = await api.getSala('sala-arcoiris');
    if (demo && demo.clave.toLowerCase() === buscarClave.trim().toLowerCase()) {
      unlockSala(demo.id, buscarClave, demo.clave);
      navigate(`/sala/${demo.id}`);
      return;
    }

    setErrorBuscar(true);
    showToast('No encontramos una sala con esa palabra clave', 'error');
  };

  return (
    <div className="app-container">
      {/* Hero Header Zamba */}
      <header className="header-zamba" style={{ padding: '1.5rem 1.25rem 1.25rem', flexDirection: 'column', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.75rem', borderRadius: 'var(--radius-full)', marginBottom: '0.5rem' }}>
          <Sparkles size={14} color="#FFBC00" />
          <span style={{ fontSize: '0.8rem', color: '#FFF', fontWeight: 800 }}>ORGANIZADOR DE SALA ESCOLAR</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', color: '#FFF', textShadow: '3px 3px 0px var(--z-borde)', lineHeight: 1.1 }}>
          LoCumpleanito 🎈
        </h1>
        
        <p style={{ color: 'var(--z-sol-light)', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.25rem' }}>
          Juntamos para los regalos de los chicos, fácil y transparente.
        </p>
      </header>
      <BuntingBanner />

      <main style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Tarjeta de Ilustración / Bienvenida */}
        <div className="card-zamba card-zamba-sol" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div className="tape-sticker" />
          
          <div style={{ fontSize: '3rem', margin: '0.5rem 0' }}>
            🎂 🎒 🎁
          </div>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
            ¡Bienvenidos a la colecta!
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--z-tinta-suave)', lineHeight: 1.4, marginBottom: '1rem' }}>
            Cada familia aporta lo mismo mediante transferencia al Alias de quien compra el regalo. ¡Sin líos de plata ni cuentas en el aire!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              onClick={() => setModalCrear(true)}
              className="btn-zamba btn-verde btn-lg btn-block"
              style={{ fontSize: '1.1rem' }}
            >
              <PlusCircle size={22} />
              <span>Crear Sala para mi Grado/Jardín</span>
            </button>
          </div>
        </div>

        {/* Acceso Rápido con Palabra Clave */}
        <div className="card-zamba">
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <KeyRound size={18} color="var(--z-celeste-dark)" />
            <span>Ingresar con la palabra clave</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--z-tinta-suave)', marginBottom: '0.85rem' }}>
            Si en el grupo de WhatsApp te pasaron una palabra clave (ej: <em>Arcoiris</em>):
          </p>

          <form onSubmit={handleEntrarConClave} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input-zamba"
              placeholder="Palabra clave..."
              value={buscarClave}
              onChange={(e) => {
                setBuscarClave(e.target.value);
                setErrorBuscar(false);
              }}
              style={{ flex: 1, borderColor: errorBuscar ? 'var(--z-rojo)' : 'var(--z-borde)' }}
            />
            <button type="submit" className="btn-zamba btn-celeste">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Salas sugeridas / de ejemplo */}
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--z-tinta-suave)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <School size={16} />
            <span>Salas activas de demostración</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {salasDisponibles.map(sala => (
              <div
                key={sala.id}
                onClick={() => navigate(`/sala/${sala.id}`)}
                className="card-zamba"
                style={{
                  padding: '0.9rem 1.1rem',
                  marginBottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: '#ffffff'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--z-celeste-dark)', margin: 0 }}>
                    {sala.nombre}
                  </h4>
                  {sala.colegio && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--z-tinta-suave)', margin: 0 }}>
                      {sala.colegio}
                    </p>
                  )}
                  <span className="badge-zamba badge-sol" style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}>
                    Clave demo: {sala.clave}
                  </span>
                </div>
                <div className="btn-zamba btn-sol btn-sm" style={{ padding: '0.4rem 0.6rem' }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info estilo escuela */}
        <div style={{ marginTop: 'auto', textAlign: 'center', padding: '1rem 0', color: 'var(--z-tinta-suave)', fontSize: '0.8rem' }}>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <HeartHandshake size={14} color="var(--z-rojo)" />
            <span>Hecho con amor para las familias de la sala.</span>
          </p>
        </div>
      </main>

      {/* Modal Crear Sala */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal-content card-zamba-sol" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>
              Crear Nueva Sala 🏫
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--z-tinta-suave)', marginBottom: '1rem' }}>
              Completá los datos para tu grado o sala. Solo lleva 10 segundos:
            </p>

            <form onSubmit={handleCrearSala}>
              <div className="input-group">
                <label className="input-label">Nombre de la Sala / Grado:</label>
                <input
                  type="text"
                  className="input-zamba"
                  placeholder="Ej: Sala Amarilla (Turno Tarde)"
                  value={nombreSala}
                  onChange={(e) => setNombreSala(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Colegio o Jardín (opcional):</label>
                <input
                  type="text"
                  className="input-zamba"
                  placeholder="Ej: Jardín de Infantes N° 901"
                  value={colegioSala}
                  onChange={(e) => setColegioSala(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Palabra clave de acceso:</label>
                <input
                  type="text"
                  className="input-zamba"
                  placeholder="Ej: Arcoiris (o el nombre de la seño)"
                  value={claveSala}
                  onChange={(e) => setClaveSala(e.target.value)}
                  required
                />
                <small style={{ color: 'var(--z-tinta-suave)', fontSize: '0.75rem' }}>
                  Esta palabra se la pasás a los otros padres para que puedan entrar.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  className="btn-zamba btn-blanco"
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingCrear}
                  className="btn-zamba btn-verde"
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
