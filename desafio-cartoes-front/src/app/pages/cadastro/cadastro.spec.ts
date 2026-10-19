import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UsuarioService } from '../../core/services/usuario.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Cadastro } from './cadastro';

describe('Cadastro', () => {
  const cadastrar = vi.fn();
  const toast = { sucesso: vi.fn() };

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      imports: [Cadastro],
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: { cadastrar } },
        { provide: ToastService, useValue: toast },
      ],
    });
  });

  function preencher(el: HTMLElement, valores: Record<string, string>) {
    for (const [id, valor] of Object.entries(valores)) {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    }
  }

  const valido = { nome: 'Ana', email: 'ana@a.com', senha: '123456', confirmacao: '123456' };

  it('não envia com dados inválidos', async () => {
    const fixture = TestBed.createComponent(Cadastro);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(cadastrar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.is-invalid').length).toBe(4);
  });

  it('exige que a confirmação seja igual à senha', async () => {
    const fixture = TestBed.createComponent(Cadastro);
    await fixture.whenStable();

    preencher(fixture.nativeElement, { ...valido, confirmacao: 'outra-senha' });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(cadastrar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('As senhas não coincidem.');
  });

  it('cadastra e leva ao login', async () => {
    cadastrar.mockReturnValue(of({}));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Cadastro);
    await fixture.whenStable();

    preencher(fixture.nativeElement, valido);
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(cadastrar).toHaveBeenCalledWith({ nome: 'Ana', email: 'ana@a.com', senha: '123456' });
    expect(toast.sucesso).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('mostra o conflito devolvido pela API', async () => {
    cadastrar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { detail: 'E-mail já cadastrado.' } })),
    );
    const fixture = TestBed.createComponent(Cadastro);
    await fixture.whenStable();

    preencher(fixture.nativeElement, valido);
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.alert-danger').textContent).toContain('E-mail já cadastrado.');
  });
});
