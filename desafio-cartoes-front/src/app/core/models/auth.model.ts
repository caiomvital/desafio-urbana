export type Perfil = 'ADMIN' | 'USER';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  usuarioId: number;
  nome: string;
  perfil: Perfil;
}

export interface Sessao {
  token: string;
  usuarioId: number;
  nome: string;
  perfil: Perfil;
  expiraEm: number;
}
