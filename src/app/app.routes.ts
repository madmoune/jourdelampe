import { Route, Routes } from '@angular/router';
import { EVENT } from './core/config/event.config';
import { AiPortalState } from './features/ai-home/ai-portal-state';
import {
  ARCADE_ID,
  FOURCHETTE_ID,
  MANCHETTES_ID,
  MATCHMAKER_ID,
  META_ID,
  PIGPEN_ID,
  RIDDLE_LIST_PATH,
  RIDDLE_PAGES,
  SENS_DESSUS_DESSOUS_ID,
  SUDOKU_ID,
  ZEBRA_ID,
} from './features/riddles/riddle-pages';
import { requireRiddleRelease, RIDDLE_PREVIEW } from './features/riddles/riddle-release';

function puzzleRoute(id: keyof typeof RIDDLE_PAGES, loadComponent: Route['loadComponent']): Route {
  const page = RIDDLE_PAGES[id];
  return { path: page.path.slice(1), title: `${page.title} — Le Jour de l’AI`, loadComponent };
}

const riddleRoutes: Routes = [
  puzzleRoute(ZEBRA_ID, () =>
    import('./features/zebra/zebra-page').then((module) => module.ZebraPage),
  ),
  puzzleRoute(FOURCHETTE_ID, () =>
    import('./features/fourchette/fourchette-page').then((module) => module.FourchettePage),
  ),
  puzzleRoute(MATCHMAKER_ID, () =>
    import('./features/matchmaker/matchmaker-page').then((module) => module.MatchmakerPage),
  ),
  puzzleRoute(PIGPEN_ID, () =>
    import('./features/pigpen/pigpen-page').then((module) => module.PigpenPage),
  ),
  puzzleRoute(SUDOKU_ID, () =>
    import('./features/sudoku/sudoku-page').then((module) => module.SudokuPage),
  ),
  puzzleRoute(MANCHETTES_ID, () =>
    import('./features/manchettes/manchettes-page').then((module) => module.ManchettesPage),
  ),
  puzzleRoute(ARCADE_ID, () =>
    import('./features/arcade/arcade-page').then((module) => module.ArcadePage),
  ),
  puzzleRoute(SENS_DESSUS_DESSOUS_ID, () =>
    import('./features/sens-dessus-dessous/sens-dessus-dessous-page').then(
      (module) => module.SensDessusDessousPage,
    ),
  ),
  puzzleRoute(META_ID, () => import('./features/meta/meta-page').then((module) => module.MetaPage)),
  {
    path: RIDDLE_LIST_PATH.slice(1),
    title: 'Les énigmes — Le Jour de l’AI',
    loadComponent: () => import('./features/riddles/riddle-hub').then((module) => module.RiddleHub),
  },
];

export const routes: Routes = [
  {
    path: 'apercu-ia',
    providers: [{ provide: RIDDLE_PREVIEW, useValue: true }, AiPortalState],
    children: [
      ...riddleRoutes,
      {
        path: '',
        title: 'Le Jour de l’AI — Votre party est en sursis',
        loadComponent: () => import('./features/ai-home/ai-home').then((module) => module.AiHome),
      },
    ],
  },
  ...riddleRoutes.map((route) => ({ ...route, canMatch: [requireRiddleRelease] })),
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
    path: 'cheatsheet',
    title: `Cheatsheet — ${EVENT.name}`,
    loadComponent: () =>
      import('./features/cheatsheet/cheatsheet').then((module) => module.Cheatsheet),
  },
  { path: 'cheetsheet', redirectTo: 'cheatsheet', pathMatch: 'full' },
  {
    path: '',
    title: `${EVENT.name} — ${EVENT.edition}`,
    loadComponent: () => import('./features/ai-home/ai-home').then((module) => module.AiHome),
  },
  { path: '**', redirectTo: '' },
];
