import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ToastService } from '../../shared/toast/toast.service';
import { UsuarioForm } from './usuario-form';

describe('UsuarioForm', () => {
  const usuarioService = { localizar: vi.fn(), cadastrar: vi.fn(), atualizar: vi.fn() };
  const auth = { sessao: () => ({ usuarioId: 9 }), atualizarNome: vi.fn() };
  const toast = { sucesso: vi.fn() };

  function configurar(params: Record<string, string>, data: Record<string, unknown>) {
    TestBed.configureTestingModule({
      imports: [UsuarioForm],
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: usuarioService },
        { provide: AuthService, useValue: auth },
        { provide: ToastService, useValue: toast },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(params), data } } },
      ],
    });
  }

  function preencher(el: HTMLElement, valores: Record<string, string>) {
    for (const [id, valor] of Object.entries(valores)) {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    }
  }

  beforeEach(() => vi.resetAllMocks());

  it('cria um usuário pedindo a senha', async () => {
    configurar({}, {});
    usuarioService.cadastrar.mockReturnValue(of({ nome: 'Novo' }));
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(UsuarioForm);
    await fixture.whenStable();

    preencher(fixture.nativeElement, { nome: 'Novo', email: 'n@n.com', senha: '123456' });
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(usuarioService.cadastrar).toHaveBeenCalledWith({ nome: 'Novo', email: 'n@n.com', senha: '123456' });
    expect(navigateByUrl).toHaveBeenCalledWith('/admin/usuarios');
  });

  it('edita um usuário carregando os dados e sem campo de senha', async () => {
    configurar({ id: '4' }, {});
    usuarioService.localizar.mockReturnValue(of({ id: 4, nome: 'Bia', email: 'b@b.com', perfil: 'USER' }));
    usuarioService.atualizar.mockReturnValue(of({ nome: 'Bia' }));
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(UsuarioForm);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('#senha')).toBeNull();
    expect(el.querySelector<HTMLInputElement>('#nome')!.value).toBe('Bia');

    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(usuarioService.localizar).toHaveBeenCalledWith(4);
    expect(usuarioService.atualizar).toHaveBeenCalledWith(4, { nome: 'Bia', email: 'b@b.com' });
  });

  it('no perfil próprio atualiza o nome na sessão', async () => {
    configurar({}, { proprio: true });
    usuarioService.localizar.mockReturnValue(of({ id: 9, nome: 'Eu', email: 'e@e.com', perfil: 'USER' }));
    usuarioService.atualizar.mockReturnValue(of({ nome: 'Eu Mesmo' }));
    const navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(UsuarioForm);
    await fixture.whenStable();

    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    expect(usuarioService.atualizar).toHaveBeenCalledWith(9, { nome: 'Eu', email: 'e@e.com' });
    expect(auth.atualizarNome).toHaveBeenCalledWith('Eu Mesmo');
    expect(navigateByUrl).toHaveBeenCalledWith('/inicio');
  });
});
