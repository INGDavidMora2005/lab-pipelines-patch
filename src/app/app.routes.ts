import { Routes } from '@angular/router';
import { Contacto } from './pages/contacto/contacto';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  // Rutas de las vistas: agregar cada ruta aquí, ANTES del comodín.
  { path: 'contacto', component: Contacto },
  { path: '**', redirectTo: 'inicio' },
];