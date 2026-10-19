import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemDeErro } from '../../core/erro-api';
import { TipoCartao, TIPOS_CARTAO } from '../../core/models/cartao.model';
import { Usuario } from '../../core/models/usuario.model';
import { CartaoService } from '../../core/services/cartao.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { aplicarErrosDoServidor, campoInvalido, mensagemCampo } from '../../shared/forms';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * Formulário de cartão. O modo vem de `data.modo` na rota:
 * - proprio: novo cartão do usuário logado;
 * - usuario: novo cartão de um usuário (rota com :id), pelo admin;
 * - global: novo cartão escolhendo o usuário, pelo admin;
 * - editar: edição de nome e tipo (rota com :id do cartão), pelo admin.
 */
@Component({
  selector: 'app-cartao-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cartao-form.html',
})
export class CartaoForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly cartaoService = inject(CartaoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly toast = inject(ToastService);

  private readonly idDaRota = Number(this.route.snapshot.paramMap.get('id'));
  protected readonly modo = this.route.snapshot.data['modo'] as 'proprio' | 'usuario' | 'global' | 'editar';
  protected readonly editando = this.modo === 'editar';

  private readonly usuarioDoCartao =
    this.modo === 'proprio' ? this.auth.sessao()!.usuarioId : this.idDaRota;

  protected readonly voltar =
    this.modo === 'proprio'
      ? '/meus-cartoes'
      : this.modo === 'usuario'
        ? `/admin/usuarios/${this.idDaRota}/cartoes`
        : '/admin/cartoes';

  protected readonly tipos = TIPOS_CARTAO;
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly form = this.fb.group({
    usuarioId: this.fb.control<number | null>(null, Validators.required),
    numeroCartao: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    nome: this.fb.nonNullable.control('', Validators.required),
    tipoCartao: this.fb.nonNullable.control<TipoCartao>('COMUM', Validators.required),
  });

  protected readonly invalido = campoInvalido;
  protected readonly mensagem = mensagemCampo;

  ngOnInit(): void {
    if (this.modo !== 'global') {
      this.form.controls.usuarioId.disable();
    }
    if (this.editando) {
      this.form.controls.numeroCartao.disable();
      this.cartaoService.localizar(this.idDaRota).subscribe({
        next: (c) => this.form.patchValue({ nome: c.nome, tipoCartao: c.tipoCartao }),
        error: (e) => this.erro.set(mensagemDeErro(e)),
      });
    }
    if (this.modo === 'global') {
      this.usuarioService.listar().subscribe({
        next: (lista) => this.usuarios.set(lista),
        error: (e) => this.erro.set(mensagemDeErro(e)),
      });
    }
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { usuarioId, numeroCartao, nome, tipoCartao } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.cartaoService.atualizar(this.idDaRota, { nome, tipoCartao })
      : this.cartaoService.adicionar(this.modo === 'global' ? usuarioId! : this.usuarioDoCartao, {
          numeroCartao: numeroCartao!,
          nome,
          tipoCartao,
        });

    requisicao.subscribe({
      next: () => {
        this.toast.sucesso(this.editando ? 'Cartão atualizado.' : 'Cartão adicionado.');
        this.router.navigateByUrl(this.voltar);
      },
      error: (e) => {
        aplicarErrosDoServidor(this.form, e);
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
