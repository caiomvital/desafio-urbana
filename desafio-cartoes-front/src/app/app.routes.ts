import { Routes } from '@angular/router';
import { adminGuard, authGuard, visitanteGuard } from './core/auth/auth.guard';
import { Layout } from './layout/layout';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [visitanteGuard] },
  {
    path: 'cadastro',
    canActivate: [visitanteGuard],
    loadComponent: () => import('./pages/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
      },
      {
        path: 'perfil',
        data: { proprio: true },
        loadComponent: () => import('./pages/usuario-form/usuario-form').then((m) => m.UsuarioForm),
      },
      {
        path: 'meus-cartoes',
        loadComponent: () => import('./pages/cartoes-usuario/cartoes-usuario').then((m) => m.CartoesUsuario),
      },
      {
        path: 'meus-cartoes/novo',
        data: { modo: 'proprio' },
        loadComponent: () => import('./pages/cartao-form/cartao-form').then((m) => m.CartaoForm),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: 'usuarios',
            loadComponent: () => import('./pages/usuarios-lista/usuarios-lista').then((m) => m.UsuariosLista),
          },
          {
            path: 'usuarios/novo',
            loadComponent: () => import('./pages/usuario-form/usuario-form').then((m) => m.UsuarioForm),
          },
          {
            path: 'usuarios/:id/editar',
            loadComponent: () => import('./pages/usuario-form/usuario-form').then((m) => m.UsuarioForm),
          },
          {
            path: 'usuarios/:id/cartoes',
            loadComponent: () => import('./pages/cartoes-usuario/cartoes-usuario').then((m) => m.CartoesUsuario),
          },
          {
            path: 'usuarios/:id/cartoes/novo',
            data: { modo: 'usuario' },
            loadComponent: () => import('./pages/cartao-form/cartao-form').then((m) => m.CartaoForm),
          },
          {
            path: 'cartoes',
            loadComponent: () => import('./pages/cartoes-lista/cartoes-lista').then((m) => m.CartoesLista),
          },
          {
            path: 'cartoes/novo',
            data: { modo: 'global' },
            loadComponent: () => import('./pages/cartao-form/cartao-form').then((m) => m.CartaoForm),
          },
          {
            path: 'cartoes/:id/editar',
            data: { modo: 'editar' },
            loadComponent: () => import('./pages/cartao-form/cartao-form').then((m) => m.CartaoForm),
          },
        ],
      },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/nao-encontrado/nao-encontrado').then((m) => m.NaoEncontrado),
  },
];
