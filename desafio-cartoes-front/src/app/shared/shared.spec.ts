import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { errosPorCampo, mensagemDeErro } from '../core/erro-api';
import { ConfirmService } from './confirm/confirm.service';
import { aplicarErrosDoServidor, campoInvalido, mensagemCampo, senhasIguais } from './forms';
import { Paginacao } from './paginacao/paginacao';
import { ToastService } from './toast/toast.service';

describe('forms', () => {
  it('só exibe erro depois da interação', () => {
    const controle = new FormControl('', Validators.required);
    expect(campoInvalido(controle)).toBe(false);
    controle.markAsTouched();
    expect(campoInvalido(controle)).toBe(true);
  });

  it('traduz erros de validação em mensagens', () => {
    expect(mensagemCampo(new FormControl('', Validators.required))).toBe('Campo obrigatório.');
    expect(mensagemCampo(new FormControl('x', Validators.email))).toBe('Informe um e-mail válido.');
    expect(mensagemCampo(new FormControl('ab', Validators.minLength(6)))).toBe('Informe ao menos 6 caracteres.');
    expect(mensagemCampo(new FormControl(0, Validators.min(1)))).toBe('O valor mínimo é 1.');
    expect(mensagemCampo(new FormControl('ok'))).toBe('');
  });

  it('valida confirmação de senha', () => {
    const form = new FormGroup(
      { senha: new FormControl('123456'), confirmacao: new FormControl('') },
      { validators: senhasIguais('senha', 'confirmacao') },
    );
    expect(form.controls['confirmacao'].errors).toEqual({ senhasDiferentes: true });
    form.controls['confirmacao'].setValue('123456');
    expect(form.controls['confirmacao'].errors).toBeNull();
  });

  it('aplica erros do servidor aos campos', () => {
    const form = new FormGroup({ email: new FormControl('') });
    const erro = new HttpErrorResponse({ status: 400, error: { erros: { email: 'E-mail inválido' } } });

    aplicarErrosDoServidor(form, erro);

    expect(mensagemCampo(form.controls['email'])).toBe('E-mail inválido');
  });
});

describe('erro-api', () => {
  it('prioriza o detalhe devolvido pela API', () => {
    const erro = new HttpErrorResponse({ status: 409, error: { detail: 'E-mail já cadastrado.' } });
    expect(mensagemDeErro(erro)).toBe('E-mail já cadastrado.');
  });

  it('trata servidor fora do ar, permissão negada e erros desconhecidos', () => {
    expect(mensagemDeErro(new HttpErrorResponse({ status: 0 }))).toContain('conectar');
    expect(mensagemDeErro(new HttpErrorResponse({ status: 403 }))).toContain('permissão');
    expect(mensagemDeErro(new Error('x'))).toBe('Ocorreu um erro inesperado.');
  });

  it('só extrai erros por campo de respostas 400', () => {
    expect(errosPorCampo(new HttpErrorResponse({ status: 500, error: { erros: { a: 'b' } } }))).toEqual({});
    expect(errosPorCampo(new HttpErrorResponse({ status: 400, error: { erros: { a: 'b' } } }))).toEqual({ a: 'b' });
  });
});

describe('ToastService', () => {
  afterEach(() => vi.useRealTimers());

  it('adiciona e remove avisos, inclusive por tempo', () => {
    vi.useFakeTimers();
    const toast = new ToastService();

    toast.sucesso('ok');
    toast.erro('falhou');
    expect(toast.toasts().map((t) => t.tipo)).toEqual(['success', 'danger']);

    toast.remover(toast.toasts()[0].id);
    expect(toast.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(5000);
    expect(toast.toasts()).toHaveLength(0);
  });
});

describe('ConfirmService', () => {
  it('resolve a promessa com a resposta do usuário', async () => {
    const service = new ConfirmService();

    const promessa = service.confirmar({ titulo: 'T', mensagem: 'M' });
    expect(service.pedido()?.titulo).toBe('T');
    service.responder(true);

    expect(await promessa).toBe(true);
    expect(service.pedido()).toBeNull();
  });
});

@Component({
  imports: [Paginacao],
  template: `<app-paginacao [total]="total()" [tamanho]="10" [(pagina)]="pagina" />`,
})
class PaginacaoHost {
  total = signal(35);
  pagina = signal(1);
}

describe('Paginacao', () => {
  it('não aparece quando cabe em uma página', async () => {
    const fixture = TestBed.createComponent(PaginacaoHost);
    fixture.componentInstance.total.set(5);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('navega entre as páginas', async () => {
    const fixture = TestBed.createComponent(PaginacaoHost);
    await fixture.whenStable();
    const botoes = () => Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'));

    expect(botoes().map((b) => b.textContent!.trim())).toEqual(['Anterior', '1', '2', '3', '4', 'Próxima']);

    botoes()[5].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.pagina()).toBe(2);

    botoes()[4].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.pagina()).toBe(4);
  });
});
