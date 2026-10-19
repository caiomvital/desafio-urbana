import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Cartao } from '../../core/models/cartao.model';
import { CartaoService } from '../../core/services/cartao.service';
import { ConfirmService } from '../confirm/confirm.service';
import { ToastService } from '../toast/toast.service';
import { CartoesTabela } from './cartoes-tabela';

const cartoes: Cartao[] = [
  { id: 1, numeroCartao: 1001, nome: 'Casa-Trabalho', status: true, tipoCartao: 'TRABALHADOR', usuarioId: 1 },
  { id: 2, numeroCartao: 1002, nome: 'Faculdade', status: false, tipoCartao: 'ESTUDANTE', usuarioId: 1 },
  { id: 3, numeroCartao: 2003, nome: 'Passeio', status: true, tipoCartao: 'COMUM', usuarioId: 2 },
];

@Component({
  imports: [CartoesTabela],
  template: `<app-cartoes-tabela
    [cartoes]="cartoes()"
    [mostrarUsuario]="true"
    [nomesUsuarios]="nomes"
    [podeEditar]="true"
    (alterado)="alterado = alterado + 1"
  />`,
})
class Host {
  cartoes = signal<Cartao[]>(cartoes);
  nomes = { 1: 'Ana', 2: 'Bruno' };
  alterado = 0;
}

describe('CartoesTabela', () => {
  const cartaoService = { alterarStatus: vi.fn(), remover: vi.fn() };
  const confirmar = vi.fn();
  const toast = { sucesso: vi.fn(), erro: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: CartaoService, useValue: cartaoService },
        { provide: ConfirmService, useValue: { confirmar } },
        { provide: ToastService, useValue: toast },
      ],
    });
  });

  async function criar() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const linhas = () => el.querySelectorAll('tbody tr');
    return { fixture, el, linhas };
  }

  function digitar(el: HTMLElement, texto: string) {
    const input = el.querySelector<HTMLInputElement>('input[type=search]')!;
    input.value = texto;
    input.dispatchEvent(new Event('input'));
  }

  it('lista os cartões com o nome do usuário e a situação', async () => {
    const { el, linhas } = await criar();

    expect(linhas()).toHaveLength(3);
    expect(linhas()[0].textContent).toContain('Ana');
    expect(linhas()[0].textContent).toContain('Ativo');
    expect(linhas()[1].textContent).toContain('Inativo');
  });

  it('filtra por busca, por tipo e por situação', async () => {
    const { fixture, el, linhas } = await criar();

    digitar(el, 'bruno');
    await fixture.whenStable();
    expect(linhas()).toHaveLength(1);

    digitar(el, '100');
    await fixture.whenStable();
    expect(linhas()).toHaveLength(2);

    const [tipo, situacao] = Array.from(el.querySelectorAll<HTMLSelectElement>('select'));
    situacao.value = 'inativos';
    situacao.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(linhas()).toHaveLength(1);
    expect(linhas()[0].textContent).toContain('Faculdade');

    situacao.value = '';
    situacao.dispatchEvent(new Event('change'));
    tipo.value = 'ESTUDANTE';
    tipo.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(linhas()).toHaveLength(1);
  });

  it('informa quando o filtro não encontra nada', async () => {
    const { fixture, el } = await criar();

    digitar(el, 'zzz');
    await fixture.whenStable();

    expect(el.textContent).toContain('Nenhum cartão encontrado');
  });

  it('informa quando não há cartões', async () => {
    const { fixture, el } = await criar();

    fixture.componentInstance.cartoes.set([]);
    await fixture.whenStable();

    expect(el.textContent).toContain('Nenhum cartão cadastrado');
  });

  it('inativa um cartão ativo e avisa a página', async () => {
    cartaoService.alterarStatus.mockReturnValue(of(undefined));
    const { fixture, linhas } = await criar();

    linhas()[0].querySelector<HTMLButtonElement>('button')!.click();

    expect(cartaoService.alterarStatus).toHaveBeenCalledWith(1, 1, false);
    expect(toast.sucesso).toHaveBeenCalledWith('Cartão inativado.');
    expect(fixture.componentInstance.alterado).toBe(1);
  });

  it('só remove depois da confirmação', async () => {
    cartaoService.remover.mockReturnValue(of(undefined));
    const { fixture, linhas } = await criar();
    const botaoRemover = () => linhas()[2].querySelector<HTMLButtonElement>('button.btn-outline-danger')!;

    confirmar.mockResolvedValueOnce(false);
    botaoRemover().click();
    await fixture.whenStable();
    expect(cartaoService.remover).not.toHaveBeenCalled();

    confirmar.mockResolvedValueOnce(true);
    botaoRemover().click();
    await fixture.whenStable();
    expect(cartaoService.remover).toHaveBeenCalledWith(2, 3);
    expect(fixture.componentInstance.alterado).toBe(1);
  });
});
