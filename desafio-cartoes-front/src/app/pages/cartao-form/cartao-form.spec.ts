import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CartaoService } from '../../core/services/cartao.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CartaoForm } from './cartao-form';

describe('CartaoForm', () => {
  const cartaoService = { adicionar: vi.fn(), atualizar: vi.fn(), localizar: vi.fn() };
  const usuarioService = { listar: vi.fn() };
  const auth = { sessao: () => ({ usuarioId: 9 }) };
  const toast = { sucesso: vi.fn() };

  function configurar(params: Record<string, string>, modo: string) {
    TestBed.configureTestingModule({
      imports: [CartaoForm],
      providers: [
        provideRouter([]),
        { provide: CartaoService, useValue: cartaoService },
        { provide: UsuarioService, useValue: usuarioService },
        { provide: AuthService, useValue: auth },
        { provide: ToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(params), data: { modo } } } },
      ],
    });
  }

  function preencher(el: HTMLElement, valores: Record<string, string>) {
    for (const [id, valor] of Object.entries(valores)) {
      const campo = el.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
      campo.value = valor;
      campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input'));
    }
  }

  beforeEach(() => vi.resetAllMocks());

  it('adiciona um cartão ao usuário logado', async () => {
    configurar({}, 'proprio');
    cartaoService.adicionar.mockReturnValue(of({}));
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CartaoForm);
    await fixture.whenStable();

    preencher(fixture.nativeElement, { numeroCartao: '123', nome: 'Meu cartão', tipoCartao: 'ESTUDANTE' });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(cartaoService.adicionar).toHaveBeenCalledWith(9, {
      numeroCartao: 123,
      nome: 'Meu cartão',
      tipoCartao: 'ESTUDANTE',
    });
    expect(navigateByUrl).toHaveBeenCalledWith('/meus-cartoes');
  });

  it('não envia sem número e nome', async () => {
    configurar({}, 'proprio');
    const fixture = TestBed.createComponent(CartaoForm);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(cartaoService.adicionar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.is-invalid').length).toBe(2);
  });

  it('o admin escolhe o usuário dono no modo global', async () => {
    configurar({}, 'global');
    usuarioService.listar.mockReturnValue(of([{ id: 5, nome: 'Carla', email: 'c@c.com', perfil: 'USER' }]));
    cartaoService.adicionar.mockReturnValue(of({}));
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CartaoForm);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    const select = el.querySelector<HTMLSelectElement>('#usuarioId')!;
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change'));
    preencher(el, { numeroCartao: '77', nome: 'Extra' });
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(cartaoService.adicionar).toHaveBeenCalledWith(5, { numeroCartao: 77, nome: 'Extra', tipoCartao: 'COMUM' });
  });

  it('edita nome e tipo, sem permitir trocar o número', async () => {
    configurar({ id: '3' }, 'editar');
    cartaoService.localizar.mockReturnValue(
      of({ id: 3, numeroCartao: 55, nome: 'Antigo', status: true, tipoCartao: 'COMUM', usuarioId: 1 }),
    );
    cartaoService.atualizar.mockReturnValue(of({}));
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CartaoForm);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector<HTMLInputElement>('#numeroCartao')!.disabled).toBe(true);
    expect(el.querySelector<HTMLInputElement>('#nome')!.value).toBe('Antigo');

    preencher(el, { nome: 'Atualizado' });
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(cartaoService.atualizar).toHaveBeenCalledWith(3, { nome: 'Atualizado', tipoCartao: 'COMUM' });
  });
});
