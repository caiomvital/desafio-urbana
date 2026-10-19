import { HttpErrorResponse } from '@angular/common/http';

/** Extrai uma mensagem amigável de um erro (ProblemDetail) da API. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof HttpErrorResponse) {
    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor. Tente novamente.';
    }
    if (erro.status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }
    const detalhe = erro.error?.detail;
    if (typeof detalhe === 'string' && detalhe) {
      return detalhe;
    }
  }
  return 'Ocorreu um erro inesperado.';
}

/** Erros de validação por campo devolvidos pela API (propriedade "erros"). */
export function errosPorCampo(erro: unknown): Record<string, string> {
  if (erro instanceof HttpErrorResponse && erro.status === 400) {
    const erros = erro.error?.erros;
    if (erros && typeof erros === 'object') {
      return erros as Record<string, string>;
    }
  }
  return {};
}
