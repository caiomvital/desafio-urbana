import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemDeErro } from '../../core/erro-api';
import { Cartao } from '../../core/models/cartao.model';
import { CartaoService } from '../../core/services/cartao.service';
import { UsuarioService } from '../../core/services/usuario.service';

interface Indicador {
  rotulo: string;
  valor: number;
  icone: string;
  link: string;
}

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly cartaoService = inject(CartaoService);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly indicadores = signal<Indicador[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    const indicadores$ = this.auth.admin() ? this.indicadoresAdmin() : this.indicadoresUsuario();
    indicadores$.subscribe({
      next: (lista) => {
        this.indicadores.set(lista);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemDeErro(e));
        this.carregando.set(false);
      },
    });
  }

  private indicadoresUsuario(): Observable<Indicador[]> {
    return this.cartaoService.listarPorUsuario(this.auth.sessao()!.usuarioId).pipe(
      map((cartoes) => [
        { rotulo: 'Meus cartões', valor: cartoes.length, icone: 'bi-credit-card', link: '/meus-cartoes' },
        { rotulo: 'Ativos', valor: this.contar(cartoes, true), icone: 'bi-check-circle', link: '/meus-cartoes' },
        { rotulo: 'Inativos', valor: this.contar(cartoes, false), icone: 'bi-slash-circle', link: '/meus-cartoes' },
      ]),
    );
  }

  private indicadoresAdmin(): Observable<Indicador[]> {
    return forkJoin({ usuarios: this.usuarioService.listar(), cartoes: this.cartaoService.listar() }).pipe(
      map(({ usuarios, cartoes }) => [
        { rotulo: 'Usuários', valor: usuarios.length, icone: 'bi-people', link: '/admin/usuarios' },
        { rotulo: 'Cartões', valor: cartoes.length, icone: 'bi-credit-card', link: '/admin/cartoes' },
        { rotulo: 'Cartões ativos', valor: this.contar(cartoes, true), icone: 'bi-check-circle', link: '/admin/cartoes' },
        { rotulo: 'Cartões inativos', valor: this.contar(cartoes, false), icone: 'bi-slash-circle', link: '/admin/cartoes' },
      ]),
    );
  }

  private contar(cartoes: Cartao[], ativo: boolean): number {
    return cartoes.filter((c) => c.status === ativo).length;
  }
}
