import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemDeErro } from '../../core/erro-api';
import { Usuario } from '../../core/models/usuario.model';
import { UsuarioService } from '../../core/services/usuario.service';
import { ConfirmService } from '../../shared/confirm/confirm.service';
import { Paginacao } from '../../shared/paginacao/paginacao';
import { ToastService } from '../../shared/toast/toast.service';

const TAMANHO_PAGINA = 10;

@Component({
  selector: 'app-usuarios-lista',
  imports: [RouterLink, Paginacao],
  templateUrl: './usuarios-lista.html',
})
export class UsuariosLista implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);

  protected readonly tamanhoPagina = TAMANHO_PAGINA;
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly busca = signal('');
  protected readonly pagina = signal(1);

  protected readonly filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    return this.usuarios().filter(
      (u) => !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo),
    );
  });

  protected readonly visiveis = computed(() => {
    const inicio = (this.pagina() - 1) * TAMANHO_PAGINA;
    return this.filtrados().slice(inicio, inicio + TAMANHO_PAGINA);
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected filtrar(valor: string): void {
    this.busca.set(valor);
    this.pagina.set(1);
  }

  protected carregar(): void {
    this.usuarioService.listar().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  protected async remover(usuario: Usuario): Promise<void> {
    const confirmado = await this.confirmService.confirmar({
      titulo: 'Remover usuário',
      mensagem: `Deseja remover "${usuario.nome}"? Usuários com cartões associados não podem ser removidos.`,
      textoConfirmar: 'Remover',
      perigo: true,
    });
    if (!confirmado) {
      return;
    }
    this.usuarioService.remover(usuario.id).subscribe({
      next: () => {
        this.toast.sucesso('Usuário removido.');
        this.carregar();
      },
      error: (e) => this.toast.erro(mensagemDeErro(e)),
    });
  }
}
