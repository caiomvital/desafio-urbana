import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { API_URL } from '../api.config';
import { LoginRequest, LoginResponse, Sessao } from '../models/auth.model';

const CHAVE_SESSAO = 'desafio-cartoes.sessao';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly navegador = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _sessao = signal<Sessao | null>(this.restaurar());

  readonly sessao = this._sessao.asReadonly();
  readonly autenticado = computed(() => this.sessaoValida(this._sessao()));
  readonly admin = computed(() => this.autenticado() && this._sessao()?.perfil === 'ADMIN');

  login(credenciais: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credenciais).pipe(
      tap((resposta) =>
        this.salvar({
          token: resposta.token,
          usuarioId: resposta.usuarioId,
          nome: resposta.nome,
          perfil: resposta.perfil,
          expiraEm: Date.now() + resposta.expiraEmSegundos * 1000,
        }),
      ),
    );
  }

  logout(): void {
    this._sessao.set(null);
    if (this.navegador) {
      localStorage.removeItem(CHAVE_SESSAO);
    }
  }

  /** Reflete na sessão o nome alterado no perfil. */
  atualizarNome(nome: string): void {
    const sessao = this._sessao();
    if (sessao) {
      this.salvar({ ...sessao, nome });
    }
  }

  /** Token somente se a sessão ainda for válida. */
  token(): string | null {
    const sessao = this._sessao();
    return this.sessaoValida(sessao) ? sessao!.token : null;
  }

  private salvar(sessao: Sessao): void {
    this._sessao.set(sessao);
    if (this.navegador) {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    }
  }

  private restaurar(): Sessao | null {
    if (!this.navegador) {
      return null;
    }
    try {
      const bruto = localStorage.getItem(CHAVE_SESSAO);
      const sessao = bruto ? (JSON.parse(bruto) as Sessao) : null;
      return this.sessaoValida(sessao) ? sessao : null;
    } catch {
      return null;
    }
  }

  private sessaoValida(sessao: Sessao | null): boolean {
    return !!sessao && sessao.expiraEm > Date.now();
  }
}
