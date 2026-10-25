import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'maintenance-citations',
    title: 'Gestion — Le Jour de Lampe',
    loadComponent: () =>
      import('./features/maintenance/maintenance').then((module) => module.Maintenance),
  },
  {
    path: '',
    title: 'Le Jour de Lampe — 2027',
    loadComponent: () => import('./features/ai-home/ai-home').then((module) => module.AiHome),
  },
  { path: '**', redirectTo: '' },
];
