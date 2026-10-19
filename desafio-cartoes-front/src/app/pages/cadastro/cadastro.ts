import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { mensagemDeErro } from '../../core/erro-api';
import { UsuarioService } from '../../core/services/usuario.service';
import { aplicarErrosDoServidor, campoInvalido, mensagemCampo, senhasIguais } from '../../shared/forms';
import { ToastService } from '../../shared/toast/toast.service';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly usuarios = inject(UsuarioService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly form = this.fb.group(
    {
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmacao: ['', Validators.required],
    },
    { validators: senhasIguais('senha', 'confirmacao') },
  );
  protected readonly enviando = signal(false);
  protected readonly erro = signal<string | null>(null);

  protected readonly invalido = campoInvalido;
  protected readonly mensagem = mensagemCampo;

  protected cadastrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nome, email, senha } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set(null);
    this.usuarios.cadastrar({ nome, email, senha }).subscribe({
      next: () => {
        this.toast.sucesso('Cadastro realizado! Faça login para continuar.');
        this.router.navigate(['/login']);
      },
      error: (e) => {
        aplicarErrosDoServidor(this.form, e);
        this.erro.set(mensagemDeErro(e));
        this.enviando.set(false);
      },
    });
  }
}
