import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '../api.config';
import { CartaoService } from './cartao.service';
import { UsuarioService } from './usuario.service';

describe('serviços de API', () => {
  let http: HttpTestingController;
  let api: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    api = TestBed.inject(API_URL);
  });

  afterEach(() => http.verify());

  describe('UsuarioService', () => {
    it('lista, cadastra, atualiza e remove usuários', () => {
      const service = TestBed.inject(UsuarioService);

      service.listar().subscribe();
      expect(http.expectOne(`${api}/usuarios`).request.method).toBe('GET');

      service.cadastrar({ nome: 'Ana', email: 'a@a.com', senha: '123456' }).subscribe();
      const post = http.expectOne(`${api}/usuarios`);
      expect(post.request.method).toBe('POST');
      expect(post.request.body).toEqual({ nome: 'Ana', email: 'a@a.com', senha: '123456' });

      service.atualizar(3, { nome: 'Ana', email: 'a@a.com' }).subscribe();
      expect(http.expectOne(`${api}/usuarios/3`).request.method).toBe('PUT');

      service.remover(3).subscribe();
      expect(http.expectOne(`${api}/usuarios/3`).request.method).toBe('DELETE');
    });
  });

  describe('CartaoService', () => {
    it('usa os endpoints do usuário para listar, adicionar e remover', () => {
      const service = TestBed.inject(CartaoService);

      service.listarPorUsuario(2).subscribe();
      expect(http.expectOne(`${api}/usuarios/2/cartoes`).request.method).toBe('GET');

      service.adicionar(2, { numeroCartao: 10, nome: 'Meu', tipoCartao: 'COMUM' }).subscribe();
      expect(http.expectOne(`${api}/usuarios/2/cartoes`).request.method).toBe('POST');

      service.remover(2, 7).subscribe();
      expect(http.expectOne(`${api}/usuarios/2/cartoes/7`).request.method).toBe('DELETE');
    });

    it('ativa e desativa pelo endpoint PATCH', () => {
      const service = TestBed.inject(CartaoService);

      service.alterarStatus(2, 7, true).subscribe();
      const ativar = http.expectOne(`${api}/usuarios/2/cartoes/7/ativar`);
      expect(ativar.request.method).toBe('PATCH');

      service.alterarStatus(2, 7, false).subscribe();
      http.expectOne(`${api}/usuarios/2/cartoes/7/desativar`);
    });

    it('usa os endpoints administrativos para listar, localizar e atualizar', () => {
      const service = TestBed.inject(CartaoService);

      service.listar().subscribe();
      http.expectOne(`${api}/cartoes`);

      service.localizar(5).subscribe();
      http.expectOne(`${api}/cartoes/5`);

      service.atualizar(5, { nome: 'Novo', tipoCartao: 'ESTUDANTE' }).subscribe();
      const put = http.expectOne(`${api}/cartoes/5`);
      expect(put.request.method).toBe('PUT');
      expect(put.request.body).toEqual({ nome: 'Novo', tipoCartao: 'ESTUDANTE' });
    });
  });
});
