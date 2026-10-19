import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cartao, rotuloTipo, TIPOS_CARTAO } from '../../core/models/cartao.model';
import { mensagemDeErro } from '../../core/erro-api';
import { CartaoService } from '../../core/services/cartao.service';
import { ConfirmService } from '../confirm/confirm.service';
import { Paginacao } from '../paginacao/paginacao';
import { ToastService } from '../toast/toast.service';

const TAMANHO_PAGINA = 10;

/** Tabela de cartões com busca, filtros, paginação e ações (ativar/inativar, remover). */
@Component({
  selector: 'app-cartoes-tabela',
  imports: [RouterLink, Paginacao],
  templateUrl: './cartoes-tabela.html',
})
export class CartoesTabela {
  private readonly cartaoService = inject(CartaoService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly cartoes = input.required<Cartao[]>();
  /** Exibe a coluna com o nome do dono do cartão. */
  readonly mostrarUsuario = input(false);
  readonly nomesUsuarios = input<Record<number, string>>({});
  /** Exibe o botão de edição (somente administradores). */
  readonly podeEditar = input(false);
  /** Emitido após uma alteração bem-sucedida, para a página recarregar os dados. */
  readonly alterado = output<void>();

  protected readonly tipos = TIPOS_CARTAO;
  protected readonly tamanhoPagina = TAMANHO_PAGINA;
  protected readonly rotuloTipo = rotuloTipo;

  protected readonly busca = signal('');
  protected readonly tipo = signal('');
  protected readonly situacao = signal('');
  protected readonly pagina = signal(1);

  protected readonly filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const nomes = this.nomesUsuarios();
    return this.cartoes().filter((c) => {
      const dono = (nomes[c.usuarioId] ?? '').toLowerCase();
      const combina =
        !termo ||
        c.nome.toLowerCase().includes(termo) ||
        String(c.numeroCartao).includes(termo) ||
        dono.includes(termo);
      const tipoOk = !this.tipo() || c.tipoCartao === this.tipo();
      const situacaoOk =
        !this.situacao() || (this.situacao() === 'ativos' ? c.status : !c.status);
      return combina && tipoOk && situacaoOk;
    });
  });

  protected readonly visiveis = computed(() => {
    const inicio = (this.pagina() - 1) * TAMANHO_PAGINA;
    return this.filtrados().slice(inicio, inicio + TAMANHO_PAGINA);
  });

  protected filtrar(campo: 'busca' | 'tipo' | 'situacao', valor: string): void {
    this[campo].set(valor);
    this.pagina.set(1);
  }

  protected alternar(cartao: Cartao): void {
    const ativar = !cartao.status;
    this.cartaoService.alterarStatus(cartao.usuarioId, cartao.id, ativar).subscribe({
      next: () => {
        this.toast.sucesso(ativar ? 'Cartão ativado.' : 'Cartão inativado.');
        this.alterado.emit();
      },
      error: (e) => this.toast.erro(mensagemDeErro(e)),
    });
  }

  protected async remover(cartao: Cartao): Promise<void> {
    const confirmado = await this.confirmService.confirmar({
      titulo: 'Remover cartão',
      mensagem: `Deseja remover o cartão "${cartao.nome}" (nº ${cartao.numeroCartao})?`,
      textoConfirmar: 'Remover',
      perigo: true,
    });
    if (!confirmado) {
      return;
    }
    this.cartaoService.remover(cartao.usuarioId, cartao.id).subscribe({
      next: () => {
        this.toast.sucesso('Cartão removido.');
        this.alterado.emit();
      },
      error: (e) => this.toast.erro(mensagemDeErro(e)),
    });
  }
}
