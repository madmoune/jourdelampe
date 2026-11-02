/** Les pages sont intégrées à la main, indépendamment du catalogue de suivi Firebase. */
export const ZEBRA_ID = 'zebra-01';
export const FOURCHETTE_ID = 'fourchette-01';
export const RIDDLE_PAGES: Readonly<Record<string, string>> = {
  [ZEBRA_ID]: '/enigmes/zebra',
  [FOURCHETTE_ID]: '/enigmes/la-fourchette',
};
