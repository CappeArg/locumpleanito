import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cake, Sparkles, CreditCard, Gift } from 'lucide-react';
import { api } from '../services/api';
import { useSala } from '../context/SalaContext';
import type { Sala } from '../types';
import { Navbar } from '../components/Navbar';
import { UnlockModal } from '../components/UnlockModal';
import { triggerConfetti } from '../utils/confetti';

export const NuevoCumpleView: React.FC = () => {
  const { salaId } = useParams<{ salaId: string }>();
  const navigate = useNavigate();
  const { isSalaUnlocked, showToast } = useSala();

  const [sala, setSala] = useState<Sala | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Form State
  const [nombreAgasajado, setNombreAgasajado] = useState('');
  const [fechaCumple, setFechaCumple] = useState('');
  const [fechaLimitePago, setFechaLimitePago] = useState('');
  const [montoPorPersona, setMontoPorPersona] = useState<number | ''>(3500);
  const [alias, setAlias] = useState('');
  const [cbu, setCbu] = useState('');
  const [titular, setTitular] = useState('');
  const [banco, setBanco] = useState('');
  const [regaloDescripcion, setRegaloDescripcion] = useState('');

  useEffect(() => {
    if (!salaId) return;
    const loadSala = async () => {
      setLoading(true);
      const s = await api.getSala(salaId);
      setSala(s);
      setLoading(false);
    };
    loadSala();
  }, [salaId]);

  if (loading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem' }}>
          Cargando formulario... 🎈
        </p>
      </div>
    );
  }

  if (!sala) {
    return (
      <div className="app-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <Navbar title="LoCumpleanito" showBack backTo="/" />
        <div className="card-zamba card-zamba-rojo" style={{ marginTop: '2rem' }}>
          <h2>Sala no encontrada</h2>
          <button onClick={() => navigate('/')} className="btn-zamba btn-blanco" style={{ marginTop: '1rem' }}>
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  const unlocked = isSalaUnlocked(sala.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreAgasajado.trim() || !fechaCumple || !montoPorPersona || !alias.trim() || !titular.trim()) {
      showToast('Por favor completá los campos obligatorios (*)', 'error');
      return;
    }

    setGuardando(true);
    try {
      const nuevo = await api.createCumple({
        salaId: sala.id,
        nombreAgasajado: nombreAgasajado.trim(),
        fechaCumple,
        fechaLimitePago: fechaLimitePago || undefined,
        montoPorPersona: Number(montoPorPersona),
        alias: alias.trim().toLowerCase(),
        cbu: cbu.trim() || undefined,
        titular: titular.trim(),
        banco: banco.trim() || undefined,
        regaloDescripcion: regaloDescripcion.trim() || undefined
      });

      triggerConfetti();
      showToast(`¡Colecta de ${nuevo.nombreAgasajado} creada! 🎉`, 'success');
      navigate(`/sala/${sala.id}/cumple/${nuevo.id}`);
    } catch (err) {
      console.error(err);
      showToast('Error al crear la colecta', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        title={sala.nombre}
        subtitle="Nuevo Cumpleaños"
        showBack
        backTo={`/sala/${sala.id}`}
      />

      {!unlocked && <UnlockModal sala={sala} />}

      <main style={{ padding: '1.25rem', flex: 1 }}>
        <div className="card-zamba card-zamba-sol" style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <div className="tape-sticker" />
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.25rem 0' }}>
            <Cake size={22} color="var(--z-celeste-dark)" />
            <span>Armar Colecta de Cumpleaños</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--z-tinta-suave)', margin: 0 }}>
            Completá los datos bancarios para que los demás padres te transfieran el dinero del regalo.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Datos del Agasajado */}
          <div className="card-zamba" style={{ background: '#fff', marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={16} color="var(--z-sol-dark)" />
              <span>¿Quién cumple años?</span>
            </h3>

            <div className="input-group">
              <label className="input-label">Nombre del niño/a agasajado *</label>
              <input
                type="text"
                className="input-zamba"
                placeholder="Ej: Mateo / Valentina"
                value={nombreAgasajado}
                onChange={(e) => setNombreAgasajado(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Fecha festejo *</label>
                <input
                  type="date"
                  className="input-zamba"
                  value={fechaCumple}
                  onChange={(e) => setFechaCumple(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Fecha límite pago</label>
                <input
                  type="date"
                  className="input-zamba"
                  value={fechaLimitePago}
                  onChange={(e) => setFechaLimitePago(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Datos de Transferencia */}
          <div className="card-zamba" style={{ background: '#fff', marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CreditCard size={16} color="var(--z-verde-dark)" />
              <span>Datos para la Transferencia</span>
            </h3>

            <div className="input-group">
              <label className="input-label">Monto por familia ($ ARS) *</label>
              <input
                type="number"
                className="input-zamba"
                placeholder="3500"
                value={montoPorPersona}
                onChange={(e) => setMontoPorPersona(e.target.value === '' ? '' : Number(e.target.value))}
                min="100"
                step="50"
                required
              />
              <small style={{ color: 'var(--z-tinta-suave)', fontSize: '0.75rem' }}>
                Todos los que participen pagarán esta misma cantidad.
              </small>
            </div>

            <div className="input-group">
              <label className="input-label">Alias de transferencia *</label>
              <input
                type="text"
                className="input-zamba"
                placeholder="Ej: regalo.mateo.mp"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Titular de la cuenta *</label>
              <input
                type="text"
                className="input-zamba"
                placeholder="Ej: María Clara Pérez (Mamá de Sofi)"
                value={titular}
                onChange={(e) => setTitular(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Banco o Billetera</label>
                <input
                  type="text"
                  className="input-zamba"
                  placeholder="Ej: Mercado Pago"
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">CBU / CVU (opcional)</label>
                <input
                  type="text"
                  className="input-zamba"
                  placeholder="22 dígitos"
                  value={cbu}
                  onChange={(e) => setCbu(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Regalo Planeado */}
          <div className="card-zamba" style={{ background: '#fff', marginBottom: 0 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Gift size={16} color="var(--z-rojo)" />
              <span>Idea de Regalo (opcional)</span>
            </h3>

            <div className="input-group">
              <textarea
                className="input-zamba"
                placeholder="Ej: Juego de mesa y libro de cuentos. (Podrás subir fotos del regalo más adelante)."
                value={regaloDescripcion}
                onChange={(e) => setRegaloDescripcion(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={() => navigate(`/sala/${sala.id}`)}
              className="btn-zamba btn-blanco"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="btn-zamba btn-verde btn-lg"
              style={{ flex: 2 }}
            >
              {guardando ? 'Creando Colecta...' : '¡Publicar Colecta! 🎈'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
