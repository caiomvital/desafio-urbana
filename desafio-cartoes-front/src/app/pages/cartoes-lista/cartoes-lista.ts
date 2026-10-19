import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensagemDeErro } from '../../core/erro-api';
import { Cartao } from '../../core/models/cartao.model';
import { CartaoService } from '../../core/services/cartao.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { CartoesTabela } from '../../shared/cartoes-tabela/cartoes-tabela';

@Component({
  selector: 'app-cartoes-lista',
  imports: [RouterLink, CartoesTabela],
  templateUrl: './cartoes-lista.html',
})
export class CartoesLista implements OnInit {
  private readonly cartaoService = inject(CartaoService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly cartoes = signal<Cartao[]>([]);
  protected readonly nomesUsuarios = signal<Record<number, string>>({});
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    forkJoin({ cartoes: this.cartaoService.listar(), usuarios: this.usuarioService.listar() }).subscribe({
      next: ({ cartoes, usuarios }) => {
        this.cartoes.set(cartoes);
        this.nomesUsuarios.set(Object.fromEntries(usuarios.map((u) => [u.id, u.nome])));
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }
}
