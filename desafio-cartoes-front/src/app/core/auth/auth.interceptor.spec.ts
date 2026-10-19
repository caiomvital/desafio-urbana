import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ToastService } from '../../shared/toast/toast.service';
import { API_URL } from '../api.config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  const auth = { token: vi.fn(), logout: vi.fn() };
  const toast = { erro: vi.fn() };
  let http: HttpClient;
  let controller: HttpTestingController;
  let api: string;

  beforeEach(() => {
    vi.resetAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: ToastService, useValue: toast },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    api = TestBed.inject(API_URL);
  });

  it('anexa o token nas chamadas da API', () => {
    auth.token.mockReturnValue('abc');
    http.get(`${api}/usuarios`).subscribe();
    const req = controller.expectOne(`${api}/usuarios`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('não anexa o token em outras URLs', () => {
    auth.token.mockReturnValue('abc');
    http.get('https://outro.com/dados').subscribe();
    expect(controller.expectOne('https://outro.com/dados').request.headers.has('Authorization')).toBe(false);
  });

  it('encerra a sessão e redireciona ao receber 401', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http.get(`${api}/usuarios`).subscribe({ error: () => undefined });
    controller.expectOne(`${api}/usuarios`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('não encerra a sessão quando o 401 vem do próprio login', () => {
    http.post(`${api}/auth/login`, {}).subscribe({ error: () => undefined });
    controller.expectOne(`${api}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('avisa o usuário ao receber 403', () => {
    http.get(`${api}/cartoes`).subscribe({ error: () => undefined });
    controller.expectOne(`${api}/cartoes`).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(toast.erro).toHaveBeenCalledWith('Você não tem permissão para realizar esta ação.');
  });
});
