import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { Cartao, CartaoRequest, CartaoUpdate } from '../models/cartao.model';

@Injectable({ providedIn: 'root' })
export class CartaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  /** Todos os cartões (somente ADMIN). */
  listar(): Observable<Cartao[]> {
    return this.http.get<Cartao[]>(`${this.apiUrl}/cartoes`);
  }

  /** Um cartão (somente ADMIN). */
  localizar(id: number): Observable<Cartao> {
    return this.http.get<Cartao>(`${this.apiUrl}/cartoes/${id}`);
  }

  /** Edita nome e tipo (somente ADMIN). */
  atualizar(id: number, dto: CartaoUpdate): Observable<Cartao> {
    return this.http.put<Cartao>(`${this.apiUrl}/cartoes/${id}`, dto);
  }

  listarPorUsuario(usuarioId: number): Observable<Cartao[]> {
    return this.http.get<Cartao[]>(this.urlDoUsuario(usuarioId));
  }

  adicionar(usuarioId: number, dto: CartaoRequest): Observable<Cartao> {
    return this.http.post<Cartao>(this.urlDoUsuario(usuarioId), dto);
  }

  remover(usuarioId: number, cartaoId: number): Observable<void> {
    return this.http.delete<void>(`${this.urlDoUsuario(usuarioId)}/${cartaoId}`);
  }

  alterarStatus(usuarioId: number, cartaoId: number, ativo: boolean): Observable<void> {
    const acao = ativo ? 'ativar' : 'desativar';
    return this.http.patch<void>(`${this.urlDoUsuario(usuarioId)}/${cartaoId}/${acao}`, null);
  }

  private urlDoUsuario(usuarioId: number): string {
    return `${this.apiUrl}/usuarios/${usuarioId}/cartoes`;
  }
}
