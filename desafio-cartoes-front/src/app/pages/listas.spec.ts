import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { Cartao } from '../core/models/cartao.model';
import { Usuario } from '../core/models/usuario.model';
import { CartaoService } from '../core/services/cartao.service';
import { UsuarioService } from '../core/services/usuario.service';
import { ConfirmService } from '../shared/confirm/confirm.service';
import { ToastService } from '../shared/toast/toast.service';
import { CartoesLista } from './cartoes-lista/cartoes-lista';
import { CartoesUsuario } from './cartoes-usuario/cartoes-usuario';
import { Inicio } from './inicio/inicio';
import { UsuariosLista } from './usuarios-lista/usuarios-lista';

const usuarios: Usuario[] = [
  { id: 1, nome: 'Admin', email: 'admin@desafio.com', perfil: 'ADMIN' },
  { id: 2, nome: 'Bruno', email: 'bruno@b.com', perfil: 'USER' },
];
const cartoes: Cartao[] = [
  { id: 1, numeroCartao: 100, nome: 'A', status: true, tipoCartao: 'COMUM', usuarioId: 2 },
  { id: 2, numeroCartao: 200, nome: 'B', status: false, tipoCartao: 'ESTUDANTE', usuarioId: 2 },
];

describe('páginas de listagem', () => {
  const usuarioService = { listar: vi.fn(), localizar: vi.fn(), remover: vi.fn() };
  const cartaoService = { listar: vi.fn(), listarPorUsuario: vi.fn() };
  const confirmar = vi.fn();
  const toast = { sucesso: vi.fn(), erro: vi.fn() };
  const sessao = { usuarioId: 1, nome: 'Admin' };
  let admin = true;

  beforeEach(() => {
    vi.resetAllMocks();
    admin = true;
    usuarioService.listar.mockReturnValue(of(usuarios));
    cartaoService.listar.mockReturnValue(of(cartoes));
    cartaoService.listarPorUsuario.mockReturnValue(of(cartoes));
  });

  function configurar(params: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: usuarioService },
        { provide: CartaoService, useValue: cartaoService },
        { provide: ConfirmService, useValue: { confirmar } },
        { provide: ToastService, useValue: toast },
        { provide: AuthService, useValue: { sessao: () => sessao, admin: () => admin } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(params), data: {} } } },
      ],
    });
  }

  it('Inicio mostra o resumo do administrador', async () => {
    configurar();
    const fixture = TestBed.createComponent(Inicio);
    await fixture.whenStable();

    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Usuários');
    expect(texto).toContain('Cartões ativos');
    expect(cartaoService.listar).toHaveBeenCalled();
  });

  it('Inicio mostra apenas os cartões do usuário comum', async () => {
    admin = false;
    configurar();
    const fixture = TestBed.createComponent(Inicio);
    await fixture.whenStable();

    expect(cartaoService.listarPorUsuario).toHaveBeenCalledWith(1);
    expect(cartaoService.listar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Meus cartões');
  });

  it('UsuariosLista filtra, e impede remover a si mesmo', async () => {
    configurar();
    const fixture = TestBed.createComponent(UsuariosLista);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    const linhas = () => el.querySelectorAll('tbody tr');

    expect(linhas()).toHaveLength(2);
    expect(linhas()[0].querySelector<HTMLButtonElement>('button')!.disabled).toBe(true);
    expect(linhas()[1].querySelector<HTMLButtonElement>('button')!.disabled).toBe(false);

    const busca = el.querySelector<HTMLInputElement>('input[type=search]')!;
    busca.value = 'bruno';
    busca.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(linhas()).toHaveLength(1);
  });

  it('UsuariosLista remove após confirmar e recarrega', async () => {
    configurar();
    usuarioService.remover.mockReturnValue(of(undefined));
    confirmar.mockResolvedValue(true);
    const fixture = TestBed.createComponent(UsuariosLista);
    await fixture.whenStable();

    fixture.nativeElement.querySelectorAll('tbody tr')[1].querySelector('button').click();
    await fixture.whenStable();

    expect(usuarioService.remover).toHaveBeenCalledWith(2);
    expect(toast.sucesso).toHaveBeenCalledWith('Usuário removido.');
    expect(usuarioService.listar).toHaveBeenCalledTimes(2);
  });

  it('CartoesUsuario sem id mostra "Meus cartões" do usuário logado', async () => {
    configurar();
    const fixture = TestBed.createComponent(CartoesUsuario);
    await fixture.whenStable();

    expect(cartaoService.listarPorUsuario).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Meus cartões');
  });

  it('CartoesUsuario com id mostra os cartões de outro usuário', async () => {
    configurar({ id: '2' });
    usuarioService.localizar.mockReturnValue(of(usuarios[1]));
    const fixture = TestBed.createComponent(CartoesUsuario);
    await fixture.whenStable();

    expect(cartaoService.listarPorUsuario).toHaveBeenCalledWith(2);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Cartões de Bruno');
  });

  it('CartoesLista mostra o nome do dono de cada cartão', async () => {
    configurar();
    const fixture = TestBed.createComponent(CartoesLista);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Bruno');
  });
});
