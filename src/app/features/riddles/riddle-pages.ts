/** Les pages sont intégrées à la main, indépendamment du catalogue de suivi Firebase. */
export const ZEBRA_ID = 'zebra-01';
export const ZEBRA_TITLE = 'Zebra Pretzel';
export const FOURCHETTE_ID = 'fourchette-01';
export const MATCHMAKER_ID = 'matchmaker-01';
export const PIGPEN_ID = 'pigpen-01';
export const SUDOKU_ID = 'sudoku-01';
export const MANCHETTES_ID = 'manchettes-01';
export const ARCADE_ID = 'arcade-01';
export const RIDDLE_LIST_PATH = '/enigmes';
export const META_ID = 'meta';
export const RIDDLE_COUNT = 8;
export const RIDDLE_PAGES: Readonly<Record<string, string>> = {
  [ZEBRA_ID]: '/enigmes/zebra',
  [FOURCHETTE_ID]: '/enigmes/la-fourchette',
  [MATCHMAKER_ID]: '/enigmes/le-debut-de-la-fin',
  [PIGPEN_ID]: '/enigmes/la-porcherie',
  [SUDOKU_ID]: '/enigmes/la-vigie',
  [MANCHETTES_ID]: '/enigmes/en-manchettes',
  [ARCADE_ID]: '/enigmes/salle-arcade',
};
