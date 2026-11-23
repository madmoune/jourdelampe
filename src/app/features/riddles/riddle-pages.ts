/** Les pages sont intégrées à la main, indépendamment du catalogue de suivi Firebase. */
export const ZEBRA_ID = 'zebra-01';
export const ZEBRA_TITLE = 'Zebra Pretzel';
export const FOURCHETTE_ID = 'fourchette-01';
export const MATCHMAKER_ID = 'matchmaker-01';
export const PIGPEN_ID = 'pigpen-01';
export const SUDOKU_ID = 'sudoku-01';
export const MANCHETTES_ID = 'manchettes-01';
export const ARCADE_ID = 'arcade-01';
export const SENS_DESSUS_DESSOUS_ID = 'sens-dessus-dessous-01';
export const RIDDLE_LIST_PATH = '/enigmes';
export const META_ID = 'meta';
export const RIDDLE_COUNT = 8;
export const RIDDLE_PAGES = {
  [ZEBRA_ID]: { path: '/enigmes/zebra-pretzel', title: ZEBRA_TITLE },
  [FOURCHETTE_ID]: { path: '/enigmes/la-fourchette', title: 'La Fourchette' },
  [MATCHMAKER_ID]: { path: '/enigmes/le-debut-de-la-fin', title: 'Le début de la fin' },
  [PIGPEN_ID]: { path: '/enigmes/la-porcherie', title: 'La porcherie' },
  [SUDOKU_ID]: { path: '/enigmes/sudoquoi', title: 'Sudoquoi?' },
  [MANCHETTES_ID]: {
    path: '/enigmes/crossword-demineur',
    title: 'Crossword Démineur (ne jamais oublier le word)',
  },
  [ARCADE_ID]: { path: '/enigmes/arcade', title: 'Arcade' },
  [SENS_DESSUS_DESSOUS_ID]: {
    path: '/enigmes/sens-dessus-dessous',
    title: 'Sens Dessus Dessous (in english!)',
  },
  [META_ID]: { path: '/enigmes/hommage-a-mon-pere', title: 'Hommage à mon père (méta)' },
} as const;

export function riddlePage(
  id: string,
): { readonly path: string; readonly title: string } | undefined {
  return Object.hasOwn(RIDDLE_PAGES, id)
    ? RIDDLE_PAGES[id as keyof typeof RIDDLE_PAGES]
    : undefined;
}

export function isRiddlePath(path: string): boolean {
  return (
    path === RIDDLE_LIST_PATH || Object.values(RIDDLE_PAGES).some((page) => page.path === path)
  );
}
