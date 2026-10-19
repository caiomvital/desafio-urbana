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

/** Sessão persistida no navegador. */
export interface Sessao {
  token: string;
  usuarioId: number;
  nome: string;
  perfil: Perfil;
  /** Instante (epoch ms) em que o token expira. */
  expiraEm: number;
}
