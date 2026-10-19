import { Perfil } from './auth.model';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface UsuarioUpdate {
  nome: string;
  email: string;
}
