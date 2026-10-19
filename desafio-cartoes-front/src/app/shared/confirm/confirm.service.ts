import { Injectable, signal } from '@angular/core';

export interface ConfirmacaoOpcoes {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  perigo?: boolean;
}

export interface PedidoConfirmacao extends ConfirmacaoOpcoes {
  resolver: (confirmado: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _pedido = signal<PedidoConfirmacao | null>(null);

  readonly pedido = this._pedido.asReadonly();

  confirmar(opcoes: ConfirmacaoOpcoes): Promise<boolean> {
    return new Promise((resolver) => this._pedido.set({ ...opcoes, resolver }));
  }

  responder(confirmado: boolean): void {
    const pedido = this._pedido();
    this._pedido.set(null);
    pedido?.resolver(confirmado);
  }
}
