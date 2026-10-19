import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Login } from './login';

describe('Login', () => {
  const login = vi.fn();

  beforeEach(async () => {
    login.mockReset();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login } }],
    }).compileComponents();
  });

  function preencher(el: HTMLElement, email: string, senha: string) {
    const set = (id: string, valor: string) => {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    };
    set('email', email);
    set('senha', senha);
  }

  it('não envia com formulário inválido', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.is-invalid').length).toBe(2);
  });

  it('autentica e navega para /inicio', () => {
    login.mockReturnValue(of({}));
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    preencher(fixture.nativeElement, 'a@a.com', '123');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(login).toHaveBeenCalledWith({ email: 'a@a.com', senha: '123' });
    expect(navigate).toHaveBeenCalledWith(['/inicio']);
  });

  it('exibe a mensagem da API quando o login falha', () => {
    login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { detail: 'Credenciais inválidas.' } })),
    );
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();

    preencher(fixture.nativeElement, 'a@a.com', 'errada');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.alert-danger').textContent).toContain('Credenciais inválidas.');
  });
});
