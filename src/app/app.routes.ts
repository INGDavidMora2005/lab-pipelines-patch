import { Routes } from '@angular/router';
import { Contacto } from './pages/contacto/contacto';
import { Inicio } from './pages/inicio/inicio';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  // Rutas de las vistas: agregar cada ruta aquí, ANTES del comodín.
  { path: 'inicio', component: Inicio, title: 'Inicio' },
  {
    path: 'proyectos',
    loadComponent: () => import('./pages/proyectos/proyectos').then((m) => m.Proyectos),
    title: 'Proyectos',
  },
  { path: 'contacto', component: Contacto, title: 'Contacto' },
  { path: '**', redirectTo: 'inicio' },
];
