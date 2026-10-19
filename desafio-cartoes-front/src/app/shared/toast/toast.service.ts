import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'success' | 'danger';
  mensagem: string;
}

const DURACAO_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private proximoId = 0;
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  sucesso(mensagem: string): void {
    this.adicionar('success', mensagem);
  }

  erro(mensagem: string): void {
    this.adicionar('danger', mensagem);
  }

  remover(id: number): void {
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }

  private adicionar(tipo: Toast['tipo'], mensagem: string): void {
    const id = ++this.proximoId;
    this._toasts.update((lista) => [...lista, { id, tipo, mensagem }]);
    setTimeout(() => this.remover(id), DURACAO_MS);
  }
}
