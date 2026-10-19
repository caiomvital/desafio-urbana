import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensagemDeErro } from '../../core/erro-api';
import { UsuarioService } from '../../core/services/usuario.service';
import { aplicarErrosDoServidor, campoInvalido, mensagemCampo } from '../../shared/forms';
import { ToastService } from '../../shared/toast/toast.service';

/**
 * Formulário de usuário. Três usos, conforme a rota:
 * - /admin/usuarios/novo: o admin cria um usuário;
 * - /admin/usuarios/:id/editar: o admin edita um usuário;
 * - /perfil (data.proprio): o usuário edita o próprio cadastro.
 */
@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-form.html',
})
export class UsuarioForm implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly toast = inject(ToastService);

  protected readonly proprio = this.route.snapshot.data['proprio'] === true;
  private readonly idDaRota = this.route.snapshot.paramMap.get('id');
  protected readonly usuarioId = this.proprio ? this.auth.sessao()!.usuarioId : Number(this.idDaRota);
  protected readonly editando = this.proprio || this.idDaRota !== null;
  protected readonly voltar = this.proprio ? '/inicio' : '/admin/usuarios';

  protected readonly form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly invalido = campoInvalido;
  protected readonly mensagem = mensagemCampo;

  ngOnInit(): void {
    if (!this.editando) {
      return;
    }
    // A API não altera a senha na edição.
    this.form.controls.senha.disable();
    this.usuarioService.localizar(this.usuarioId).subscribe({
      next: (u) => this.form.patchValue({ nome: u.nome, email: u.email }),
      error: (e) => this.erro.set(mensagemDeErro(e)),
    });
  }

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nome, email, senha } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set(null);

    const requisicao = this.editando
      ? this.usuarioService.atualizar(this.usuarioId, { nome, email })
      : this.usuarioService.cadastrar({ nome, email, senha });

    requisicao.subscribe({
      next: (usuario) => {
        if (this.proprio) {
          this.auth.atualizarNome(usuario.nome);
        }
        this.toast.sucesso(this.editando ? 'Dados atualizados.' : 'Usuário cadastrado.');
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
