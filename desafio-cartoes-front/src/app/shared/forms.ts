import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { errosPorCampo } from '../core/erro-api';

/** Exibe o erro de um campo só depois que o usuário interagiu com ele. */
export function campoInvalido(controle: AbstractControl): boolean {
  return controle.invalid && (controle.touched || controle.dirty);
}

export function mensagemCampo(controle: AbstractControl): string {
  const erros = controle.errors;
  if (!erros) {
    return '';
  }
  if (erros['servidor']) {
    return erros['servidor'];
  }
  if (erros['required']) {
    return 'Campo obrigatório.';
  }
  if (erros['email']) {
    return 'Informe um e-mail válido.';
  }
  if (erros['minlength']) {
    return `Informe ao menos ${erros['minlength'].requiredLength} caracteres.`;
  }
  if (erros['min']) {
    return `O valor mínimo é ${erros['min'].min}.`;
  }
  if (erros['senhasDiferentes']) {
    return 'As senhas não coincidem.';
  }
  return 'Valor inválido.';
}

/** Valida que dois campos do grupo têm o mesmo valor. */
export function senhasIguais(campo: string, confirmacao: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const confirmar = grupo.get(confirmacao);
    if (!confirmar) {
      return null;
    }
    const diferentes = grupo.get(campo)?.value !== confirmar.value;
    const outros = { ...confirmar.errors };
    delete outros['senhasDiferentes'];
    if (diferentes) {
      confirmar.setErrors({ ...outros, senhasDiferentes: true });
    } else {
      confirmar.setErrors(Object.keys(outros).length ? outros : null);
    }
    return null;
  };
}

/** Copia os erros de validação do servidor para os campos correspondentes. */
export function aplicarErrosDoServidor(form: FormGroup, erro: unknown): void {
  for (const [campo, mensagem] of Object.entries(errosPorCampo(erro))) {
    const controle = form.get(campo);
    if (controle) {
      controle.setErrors({ servidor: mensagem });
      controle.markAsTouched();
    }
  }
}
