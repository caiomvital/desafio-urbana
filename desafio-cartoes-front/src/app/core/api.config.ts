import { InjectionToken } from '@angular/core';

/** URL base da API Spring Boot. */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8080',
});
