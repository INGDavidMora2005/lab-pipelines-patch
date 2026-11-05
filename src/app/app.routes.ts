import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  // Rutas de las vistas: agregar cada ruta aquí, ANTES del comodín.
  { path: '**', redirectTo: 'inicio' },
];
