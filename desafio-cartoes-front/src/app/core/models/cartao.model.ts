export type TipoCartao = 'COMUM' | 'ESTUDANTE' | 'TRABALHADOR';

export const TIPOS_CARTAO: { valor: TipoCartao; rotulo: string }[] = [
  { valor: 'COMUM', rotulo: 'Comum' },
  { valor: 'ESTUDANTE', rotulo: 'Estudante' },
  { valor: 'TRABALHADOR', rotulo: 'Trabalhador' },
];

export function rotuloTipo(tipo: TipoCartao): string {
  return TIPOS_CARTAO.find((t) => t.valor === tipo)?.rotulo ?? tipo;
}

export interface Cartao {
  id: number;
  numeroCartao: number;
  nome: string;
  status: boolean;
  tipoCartao: TipoCartao;
  usuarioId: number;
}

export interface CartaoRequest {
  numeroCartao: number;
  nome: string;
  tipoCartao: TipoCartao;
}

export interface CartaoUpdate {
  nome: string;
  tipoCartao: TipoCartao;
}
