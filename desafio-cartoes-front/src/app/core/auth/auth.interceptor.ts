import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api.config';
import { mensagemDeErro } from '../erro-api';
import { ToastService } from '../../shared/toast/toast.service';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const apiUrl = inject(API_URL);
  const toast = inject(ToastService);

  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  const token = auth.token();
  const requisicao = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      const eLogin = req.url.endsWith('/auth/login');
      if (erro instanceof HttpErrorResponse && erro.status === 401 && !eLogin) {
        auth.logout();
        router.navigate(['/login']);
      } else if (erro instanceof HttpErrorResponse && erro.status === 403) {
        toast.erro(mensagemDeErro(erro));
      }
      return throwError(() => erro);
    }),
  );
};
