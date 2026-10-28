import { Routes } from '@angular/router';
import { EVENT } from './core/config/event.config';
import { AiPortalState } from './features/ai-home/ai-portal-state';
import { requireRiddleRelease, RIDDLE_PREVIEW } from './features/riddles/riddle-release';

export const routes: Routes = [
  {
    path: 'apercu-ia',
    providers: [{ provide: RIDDLE_PREVIEW, useValue: true }, AiPortalState],
    children: [
      {
        path: 'enigmes/zebra',
        title: 'Zebra — Le Jour de l’AI',
        loadComponent: () =>
          import('./features/zebra/zebra-page').then((module) => module.ZebraPage),
      },
      {
        path: '',
        title: 'Le Jour de l’AI — Votre party est en sursis',
        loadComponent: () => import('./features/ai-home/ai-home').then((module) => module.AiHome),
      },
    ],
  },
  {
    path: 'enigmes/zebra',
    canMatch: [requireRiddleRelease],
    title: 'Zebra — Le Jour de l’AI',
    loadComponent: () => import('./features/zebra/zebra-page').then((module) => module.ZebraPage),
  },
  {
    path: 'gestion-enigmes',
    title: `Tableau de bord des énigmes — ${EVENT.name}`,
    loadComponent: () =>
      import('./features/game-dashboard/game-dashboard').then((module) => module.GameDashboard),
  },
  {
    path: 'maintenance-citations',
    title: `Gestion — ${EVENT.name}`,
    loadComponent: () =>
      import('./features/maintenance/maintenance').then((module) => module.Maintenance),
  },
  {
    path: '',
    title: `${EVENT.name} — ${EVENT.edition}`,
    loadComponent: () => import('./features/ai-home/ai-home').then((module) => module.AiHome),
  },
  { path: '**', redirectTo: '' },
];
