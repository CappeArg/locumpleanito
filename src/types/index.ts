export interface Sala {
  id: string;
  nombre: string;
  colegio?: string;
  disponible?: string; // Atributo para soft delete manual en Firebase (vacío = disponible)
  creadoEn: number;
}

export type EstadoParticipante = 'notificado' | 'confirmado';

export interface Participante {
  id: string;
  cumpleId: string;
  nombreFamilia: string;
  estado: EstadoParticipante;
  disponible?: string; // Atributo para soft delete manual en Firebase (vacío = disponible)
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
  estado: 'activo' | 'cerrado';
  disponible?: string; // Atributo para soft delete manual en Firebase (vacío = disponible)
  creadoEn: number;
  compradorNombre?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}
