import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import type { Sala, Cumpleanios, Participante } from '../types';

// ==========================================
// MOCK / LOCAL STORAGE SERVICE (Fallback)
// ==========================================
const LOCAL_STORAGE_KEY_SALAS = 'locumpleanito_salas';
const LOCAL_STORAGE_KEY_CUMPLES = 'locumpleanito_cumples';
const LOCAL_STORAGE_KEY_PARTS = 'locumpleanito_participantes';
const EVENT_NAME = 'locumpleanito_data_change';

const notifyDataChange = () => {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
};

// Datos iniciales de demostración estilo Zamba
const initialSalas: Sala[] = [
  {
    id: 'sala-arcoiris',
    nombre: 'Sala Arcoiris 🌈 (Jardín Belgrano)',
    clave: 'arcoiris',
    colegio: 'Escuela N° 9',
    creadoEn: Date.now() - 86400000 * 10
  }
];

const initialCumples: Cumpleanios[] = [
  {
    id: 'cumple-mateo-1',
    salaId: 'sala-arcoiris',
    nombreAgasajado: 'Mateo',
    fechaCumple: '2026-09-12',
    fechaLimitePago: '2026-09-08',
    montoPorPersona: 3500,
    alias: 'regalo.mateo.mp',
    cbu: '0000003100012345678901',
    titular: 'María Clara Pérez (Mamá de Sofi)',
    banco: 'Mercado Pago',
    compradorNombre: 'María Clara',
    regaloDescripcion: 'Juego de mesa educativo y pelota de fútbol número 4.',
    fotosRegalo: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80'
    ],
    fotosComprobantes: [],
    estado: 'activo',
    creadoEn: Date.now() - 86400000 * 3
  },
  {
    id: 'cumple-valen-2',
    salaId: 'sala-arcoiris',
    nombreAgasajado: 'Valentina',
    fechaCumple: '2026-09-24',
    fechaLimitePago: '2026-09-20',
    montoPorPersona: 3500,
    alias: 'cumple.valen.bna',
    titular: 'Gonzalo Fernández (Papá de Benja)',
    banco: 'Banco Nación',
    compradorNombre: 'Gonzalo Fernández',
    regaloDescripcion: 'Set de arte y mochila de exploradora.',
    fotosRegalo: [],
    fotosComprobantes: [],
    estado: 'activo',
    creadoEn: Date.now() - 86400000 * 1
  }
];

const initialParticipantes: Participante[] = [
  {
    id: 'p-1',
    cumpleId: 'cumple-mateo-1',
    nombreFamilia: 'Familia González (Lucas)',
    estado: 'confirmado',
    notificadoEn: Date.now() - 86400000 * 2,
    confirmadoEn: Date.now() - 86400000 * 1
  },
  {
    id: 'p-2',
    cumpleId: 'cumple-mateo-1',
    nombreFamilia: 'Sofi y mamá Clara',
    estado: 'confirmado',
    notificadoEn: Date.now() - 86400000 * 2,
    confirmadoEn: Date.now() - 86400000 * 2
  },
  {
    id: 'p-3',
    cumpleId: 'cumple-mateo-1',
    nombreFamilia: 'Familia Rossi (Emma)',
    estado: 'notificado',
    notificadoEn: Date.now() - 3600000 * 4
  },
  {
    id: 'p-4',
    cumpleId: 'cumple-mateo-1',
    nombreFamilia: 'Joaquín y papá Roberto',
    estado: 'notificado',
    notificadoEn: Date.now() - 3600000 * 2
  },
  {
    id: 'p-5',
    cumpleId: 'cumple-valen-2',
    nombreFamilia: 'Familia Benja Fernández',
    estado: 'confirmado',
    notificadoEn: Date.now() - 3600000 * 5,
    confirmadoEn: Date.now() - 3600000 * 4
  }
];

// Helper LocalStorage
function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
  notifyDataChange();
}

// Inicializar datos demo si no existen
if (!localStorage.getItem(LOCAL_STORAGE_KEY_SALAS)) {
  setLocal(LOCAL_STORAGE_KEY_SALAS, initialSalas);
}
if (!localStorage.getItem(LOCAL_STORAGE_KEY_CUMPLES)) {
  setLocal(LOCAL_STORAGE_KEY_CUMPLES, initialCumples);
}
if (!localStorage.getItem(LOCAL_STORAGE_KEY_PARTS)) {
  setLocal(LOCAL_STORAGE_KEY_PARTS, initialParticipantes);
}

// ==========================================
// UNIFIED EXPORTED API
// ==========================================

export const api = {
  // SALAS
  async getSala(salaId: string): Promise<Sala | null> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'salas', salaId));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Sala) : null;
      } catch (err) {
        console.error('Error fetching sala from firestore:', err);
      }
    }
    const salas = getLocal<Sala[]>(LOCAL_STORAGE_KEY_SALAS, initialSalas);
    return salas.find(s => s.id.toLowerCase() === salaId.toLowerCase()) || null;
  },

  async createSala(nombre: string, clave: string, colegio?: string): Promise<Sala> {
    const slug = nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'sala';
    const id = `${slug}-${Math.floor(100 + Math.random() * 900)}`;

    const newSala: Sala = {
      id,
      nombre,
      clave: clave.trim().toLowerCase(),
      colegio: colegio || '',
      creadoEn: Date.now()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'salas', id), newSala);
      } catch (err) {
        console.error('Error saving sala in firestore:', err);
      }
    }

    const salas = getLocal<Sala[]>(LOCAL_STORAGE_KEY_SALAS, initialSalas);
    salas.push(newSala);
    setLocal(LOCAL_STORAGE_KEY_SALAS, salas);

    return newSala;
  },

  // CUMPLEAÑOS
  subscribeToCumples(salaId: string, callback: (cumples: Cumpleanios[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'cumpleanios'), 
          where('salaId', '==', salaId),
          orderBy('creadoEn', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Cumpleanios));
          callback(list);
        });
      } catch (err) {
        console.warn('Fallback to local subscribe for cumples:', err);
      }
    }

    const loadLocal = () => {
      const all = getLocal<Cumpleanios[]>(LOCAL_STORAGE_KEY_CUMPLES, initialCumples);
      const filtered = all
        .filter(c => c.salaId.toLowerCase() === salaId.toLowerCase())
        .sort((a, b) => b.creadoEn - a.creadoEn);
      callback(filtered);
    };

    loadLocal();
    window.addEventListener(EVENT_NAME, loadLocal);
    return () => window.removeEventListener(EVENT_NAME, loadLocal);
  },

  async getCumple(cumpleId: string): Promise<Cumpleanios | null> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'cumpleanios', cumpleId));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Cumpleanios) : null;
      } catch (err) {
        console.error('Error fetching cumple from firestore:', err);
      }
    }
    const cumples = getLocal<Cumpleanios[]>(LOCAL_STORAGE_KEY_CUMPLES, initialCumples);
    return cumples.find(c => c.id === cumpleId) || null;
  },

  subscribeToCumple(cumpleId: string, callback: (cumple: Cumpleanios | null) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        return onSnapshot(doc(db, 'cumpleanios', cumpleId), (snapshot) => {
          if (snapshot.exists()) {
            callback({ id: snapshot.id, ...snapshot.data() } as Cumpleanios);
          } else {
            callback(null);
          }
        });
      } catch (err) {
        console.warn('Fallback to local subscribe for single cumple:', err);
      }
    }

    const loadLocal = () => {
      const all = getLocal<Cumpleanios[]>(LOCAL_STORAGE_KEY_CUMPLES, initialCumples);
      const item = all.find(c => c.id === cumpleId) || null;
      callback(item);
    };

    loadLocal();
    window.addEventListener(EVENT_NAME, loadLocal);
    return () => window.removeEventListener(EVENT_NAME, loadLocal);
  },

  async createCumple(data: Omit<Cumpleanios, 'id' | 'creadoEn' | 'estado'>): Promise<Cumpleanios> {
    const slug = data.nombreAgasajado
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'cumple';
    const id = `${slug}-${Date.now().toString().slice(-4)}`;

    const newCumple: Cumpleanios = {
      ...data,
      id,
      estado: 'activo',
      fotosRegalo: data.fotosRegalo || [],
      fotosComprobantes: data.fotosComprobantes || [],
      creadoEn: Date.now()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'cumpleanios', id), newCumple);
      } catch (err) {
        console.error('Error saving cumple in firestore:', err);
      }
    }

    const cumples = getLocal<Cumpleanios[]>(LOCAL_STORAGE_KEY_CUMPLES, initialCumples);
    cumples.unshift(newCumple);
    setLocal(LOCAL_STORAGE_KEY_CUMPLES, cumples);

    return newCumple;
  },

  async updateCumple(cumpleId: string, updates: Partial<Cumpleanios>): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'cumpleanios', cumpleId), updates);
      } catch (err) {
        console.error('Error updating firestore cumple:', err);
      }
    }

    const cumples = getLocal<Cumpleanios[]>(LOCAL_STORAGE_KEY_CUMPLES, initialCumples);
    const index = cumples.findIndex(c => c.id === cumpleId);
    if (index !== -1) {
      cumples[index] = { ...cumples[index], ...updates };
      setLocal(LOCAL_STORAGE_KEY_CUMPLES, cumples);
    }
  },

  // PARTICIPANTES
  subscribeToParticipantes(cumpleId: string, callback: (parts: Participante[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'participantes'), where('cumpleId', '==', cumpleId));
        return onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Participante));
          list.sort((a, b) => b.notificadoEn - a.notificadoEn);
          callback(list);
        });
      } catch (err) {
        console.warn('Fallback to local subscribe for parts:', err);
      }
    }

    const loadLocal = () => {
      const all = getLocal<Participante[]>(LOCAL_STORAGE_KEY_PARTS, initialParticipantes);
      const filtered = all
        .filter(p => p.cumpleId === cumpleId)
        .sort((a, b) => b.notificadoEn - a.notificadoEn);
      callback(filtered);
    };

    loadLocal();
    window.addEventListener(EVENT_NAME, loadLocal);
    return () => window.removeEventListener(EVENT_NAME, loadLocal);
  },

  async sumarParticipante(cumpleId: string, nombreFamilia: string, nota?: string): Promise<Participante> {
    const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newPart: Participante = {
      id,
      cumpleId,
      nombreFamilia: nombreFamilia.trim(),
      estado: 'notificado',
      notificadoEn: Date.now(),
      nota: nota?.trim() || undefined
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'participantes', id), newPart);
      } catch (err) {
        console.error('Error saving part in firestore:', err);
      }
    }

    const parts = getLocal<Participante[]>(LOCAL_STORAGE_KEY_PARTS, initialParticipantes);
    parts.unshift(newPart);
    setLocal(LOCAL_STORAGE_KEY_PARTS, parts);

    return newPart;
  },

  async toggleEstadoParticipante(participanteId: string, nuevoEstado: 'notificado' | 'confirmado'): Promise<void> {
    const updates: Partial<Participante> = {
      estado: nuevoEstado,
      confirmadoEn: nuevoEstado === 'confirmado' ? Date.now() : undefined
    };

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'participantes', participanteId), updates);
      } catch (err) {
        console.error('Error updating part status in firestore:', err);
      }
    }

    const parts = getLocal<Participante[]>(LOCAL_STORAGE_KEY_PARTS, initialParticipantes);
    const index = parts.findIndex(p => p.id === participanteId);
    if (index !== -1) {
      parts[index] = { ...parts[index], ...updates };
      setLocal(LOCAL_STORAGE_KEY_PARTS, parts);
    }
  },

  async eliminarParticipante(participanteId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'participantes', participanteId));
      } catch (err) {
        console.error('Error deleting part from firestore:', err);
      }
    }

    const parts = getLocal<Participante[]>(LOCAL_STORAGE_KEY_PARTS, initialParticipantes);
    const filtered = parts.filter(p => p.id !== participanteId);
    setLocal(LOCAL_STORAGE_KEY_PARTS, filtered);
  },

  async agregarFotoRegalo(cumpleId: string, fotoUrl: string): Promise<void> {
    const cumple = await this.getCumple(cumpleId);
    if (!cumple) return;
    const fotos = cumple.fotosRegalo || [];
    await this.updateCumple(cumpleId, { fotosRegalo: [...fotos, fotoUrl] });
  },

  async agregarComprobante(cumpleId: string, fotoUrl: string): Promise<void> {
    const cumple = await this.getCumple(cumpleId);
    if (!cumple) return;
    const fotos = cumple.fotosComprobantes || [];
    await this.updateCumple(cumpleId, { fotosComprobantes: [...fotos, fotoUrl] });
  }
};
