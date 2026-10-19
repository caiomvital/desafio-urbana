import { RenderMode, ServerRoute } from '@angular/ssr';

// A sessão (JWT) vive no navegador, então só o login é pré-renderizado.
export const serverRoutes: ServerRoute[] = [
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
