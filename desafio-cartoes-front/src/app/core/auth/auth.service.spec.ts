import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api.config';
import { LoginResponse } from '../models/auth.model';
import { AuthService } from './auth.service';

const resposta: LoginResponse = {
  token: 'jwt-token',
  tipo: 'Bearer',
  expiraEmSegundos: 3600,
  usuarioId: 1,
  nome: 'Admin',
  perfil: 'ADMIN',
};

describe('AuthService', () => {
  let http: HttpTestingController;

  function criar(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  }

  beforeEach(() => localStorage.clear());

  it('deve iniciar sem sessão', () => {
    const service = criar();
    expect(service.autenticado()).toBe(false);
    expect(service.token()).toBeNull();
  });

  it('deve autenticar e persistir a sessão no login', () => {
    const service = criar();

    service.login({ email: 'a@a.com', senha: '123' }).subscribe();
    const req = http.expectOne(`${TestBed.inject(API_URL)}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(resposta);

    expect(service.autenticado()).toBe(true);
    expect(service.admin()).toBe(true);
    expect(service.token()).toBe('jwt-token');
    expect(localStorage.getItem('desafio-cartoes.sessao')).toContain('jwt-token');
  });

  it('deve limpar a sessão no logout', () => {
    const service = criar();
    service.login({ email: 'a@a.com', senha: '123' }).subscribe();
    http.expectOne(() => true).flush(resposta);

    service.logout();

    expect(service.autenticado()).toBe(false);
    expect(localStorage.getItem('desafio-cartoes.sessao')).toBeNull();
  });

  it('deve restaurar uma sessão válida do armazenamento', () => {
    localStorage.setItem(
      'desafio-cartoes.sessao',
      JSON.stringify({ token: 't', usuarioId: 2, nome: 'Ana', perfil: 'USER', expiraEm: Date.now() + 60000 }),
    );
    const service = criar();

    expect(service.autenticado()).toBe(true);
    expect(service.admin()).toBe(false);
  });

  it('deve descartar uma sessão expirada', () => {
    localStorage.setItem(
      'desafio-cartoes.sessao',
      JSON.stringify({ token: 't', usuarioId: 2, nome: 'Ana', perfil: 'USER', expiraEm: Date.now() - 1 }),
    );
    const service = criar();

    expect(service.autenticado()).toBe(false);
    expect(service.token()).toBeNull();
  });
});
