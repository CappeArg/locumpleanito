export interface Sala {
  id: string;
  nombre: string;
  clave: string; // Palabra clave (ej: "Arcoiris")
  colegio?: string;
  creadoEn: number;
}

export type EstadoParticipante = 'notificado' | 'confirmado';

export interface Participante {
  id: string;
  cumpleId: string;
  nombreFamilia: string;
  estado: EstadoParticipante;
  notificadoEn: number;
  confirmadoEn?: number;
  nota?: string;
}

export interface Cumpleanios {
  id: string;
  salaId: string;
  nombreAgasajado: string;
  fechaCumple: string; // YYYY-MM-DD
  fechaLimitePago?: string;
  montoPorPersona: number;
  alias: string;
  cbu?: string;
  titular: string;
  banco?: string;
  regaloDescripcion?: string;
  fotosRegalo?: string[];
  fotosComprobantes?: string[];
  estado: 'activo' | 'cerrado';
  creadoEn: number;
  compradorNombre?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}
