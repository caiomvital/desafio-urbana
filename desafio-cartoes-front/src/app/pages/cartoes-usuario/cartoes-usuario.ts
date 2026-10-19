import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemDeErro } from '../../core/erro-api';
import { Cartao } from '../../core/models/cartao.model';
import { CartaoService } from '../../core/services/cartao.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { CartoesTabela } from '../../shared/cartoes-tabela/cartoes-tabela';

/**
 * Cartões de um usuário. Sem o parâmetro "id" na rota, mostra os do usuário logado
 * ("Meus cartões"); com ele, o administrador vê os de outro usuário.
 */
@Component({
  selector: 'app-cartoes-usuario',
  imports: [RouterLink, CartoesTabela],
  templateUrl: './cartoes-usuario.html',
})
export class CartoesUsuario implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly cartaoService = inject(CartaoService);
  private readonly usuarioService = inject(UsuarioService);

  private readonly idDaRota = this.route.snapshot.paramMap.get('id');

  protected readonly proprio = this.idDaRota === null;
  protected readonly usuarioId = this.proprio ? this.auth.sessao()!.usuarioId : Number(this.idDaRota);
  protected readonly linkNovo = this.proprio
    ? '/meus-cartoes/novo'
    : `/admin/usuarios/${this.usuarioId}/cartoes/novo`;

  protected readonly cartoes = signal<Cartao[]>([]);
  protected readonly nomeUsuario = signal('');
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.proprio) {
      this.usuarioService.localizar(this.usuarioId).subscribe({
        next: (u) => this.nomeUsuario.set(u.nome),
        error: (e) => this.erro.set(mensagemDeErro(e)),
      });
    }
    this.carregar();
  }

  protected carregar(): void {
    this.cartaoService.listarPorUsuario(this.usuarioId).subscribe({
      next: (lista) => {
        this.cartoes.set(lista);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }
}
