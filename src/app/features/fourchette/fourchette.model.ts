/** Transcription de la grille fournie, avec distinction entre la lettre O et le chiffre 0. */
export const FOURCHETTE_GRID_VERSION = 'fourchette-large';
export const FOURCHETTE_GRID = [
  'AYD0O2AHAAEM0ECN8CIPVR',
  'R0RNNIVRXL0GHL0MTOIEKE',
  'KPTN0AZPLLUIGTERANHOIK',
  'AEAEOEETUILOEAABSTANEA',
  'SGPLCSRSOIDESNEKMOSLRF',
] as const;

export const FOURCHETTE_WORD_COLUMNS = [
  ['ALTIVO', 'EPONA', 'GESTIONBONFIRE', 'GALLOPRACER2000', 'PONYTA'],
  ['CHESSMASTER8000', 'KRAMNIK', 'KASPAROV', 'LUZHIN', 'ALEXANDRELESIEGE'],
] as const;
export const FOURCHETTE_WORDS: readonly string[] = FOURCHETTE_WORD_COLUMNS.flat();
export const FOURCHETTE_CELL_COUNT = FOURCHETTE_GRID.length * FOURCHETTE_GRID[0].length;

export interface FourchetteProgress {
  readonly selection: string;
  readonly found: readonly string[];
}

export function validFourchetteSelection(value: unknown): value is string {
  return typeof value === 'string' && /^[01]{110}$/u.test(value);
}

export function emptyFourchetteProgress(): FourchetteProgress {
  return { selection: '0'.repeat(FOURCHETTE_CELL_COUNT), found: [] };
}

export function parseFourchetteProgress(value: unknown): FourchetteProgress | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const progress = value as Record<string, unknown>;
  if (!validFourchetteSelection(progress['selection']) || !Array.isArray(progress['found']))
    return null;
  return {
    selection: progress['selection'],
    found: [
      ...new Set(
        progress['found'].filter(
          (word): word is string => typeof word === 'string' && FOURCHETTE_WORDS.includes(word),
        ),
      ),
    ],
  };
}
