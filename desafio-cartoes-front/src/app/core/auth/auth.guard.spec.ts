import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard, authGuard, visitanteGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('guards de autenticação', () => {
  const autenticado = signal(false);
  const admin = signal(false);

  beforeEach(() => {
    autenticado.set(false);
    admin.set(false);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { autenticado, admin } }],
    });
  });

  const executar = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  const url = (r: unknown) => TestBed.inject(Router).serializeUrl(r as UrlTree);

  it('authGuard redireciona anônimos para /login', () => {
    expect(url(executar(authGuard))).toBe('/login');
  });

  it('authGuard libera autenticados', () => {
    autenticado.set(true);
    expect(executar(authGuard)).toBe(true);
  });

  it('adminGuard redireciona usuários comuns para /inicio', () => {
    autenticado.set(true);
    expect(url(executar(adminGuard))).toBe('/inicio');
  });

  it('adminGuard libera administradores', () => {
    autenticado.set(true);
    admin.set(true);
    expect(executar(adminGuard)).toBe(true);
  });

  it('visitanteGuard redireciona autenticados para /inicio', () => {
    autenticado.set(true);
    expect(url(executar(visitanteGuard))).toBe('/inicio');
  });
});
