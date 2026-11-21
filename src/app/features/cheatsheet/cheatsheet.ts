import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { inject } from '@angular/core';

type SemaphorePosition = 'up' | 'high' | 'out' | 'low' | 'down' | 'across-high' | 'across-low';
type SemaphoreSide = 'left' | 'right';

interface SemaphoreSignal {
  readonly letter: string;
  readonly left: SemaphorePosition;
  readonly right: SemaphorePosition;
}

interface CodeEntry {
  readonly letter: string;
  readonly value: string;
}

type PigpenShape =
  | 'corner-bottom-right'
  | 'tee-bottom'
  | 'corner-bottom-left'
  | 'tee-right'
  | 'box'
  | 'tee-left'
  | 'corner-top-right'
  | 'tee-top'
  | 'corner-top-left'
  | 'cross-top'
  | 'cross-left'
  | 'cross-right'
  | 'cross-bottom';

interface PigpenCode extends CodeEntry {
  readonly dotted: boolean;
  readonly shape: PigpenShape;
}

interface PigpenGrid {
  readonly label: string;
  readonly shape: 'square' | 'cross';
  readonly cells: readonly PigpenCode[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const NONOGRAM_EXAMPLE: readonly (readonly boolean[])[] = [
  [false, true, false, false, false],
  [true, true, true, false, false],
  [false, false, true, false, true],
  [false, true, true, true, false],
  [false, false, true, false, false],
];

export const NONOGRAM_ROW_CLUES = ['1', '3', '1 1', '3', '1'] as const;
export const NONOGRAM_COLUMN_CLUES = ['1', '2 1', '4', '1', '1'] as const;

type MinesweeperExampleCell = {
  readonly kind: 'number' | 'hidden' | 'flag';
  readonly value?: string;
};

export const MINESWEEPER_EXAMPLE: readonly MinesweeperExampleCell[] = [
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '2' },
  { kind: 'hidden' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
  { kind: 'flag' },
  { kind: 'number', value: '2' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '2' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '0' },
  { kind: 'number', value: '0' },
  { kind: 'number', value: '1' },
  { kind: 'flag' },
  { kind: 'number', value: '1' },
  { kind: 'hidden' },
  { kind: 'hidden' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
  { kind: 'number', value: '1' },
];

export const MORSE_CODES: readonly CodeEntry[] = [
  { letter: 'A', value: '.-' },
  { letter: 'B', value: '-...' },
  { letter: 'C', value: '-.-.' },
  { letter: 'D', value: '-..' },
  { letter: 'E', value: '.' },
  { letter: 'F', value: '..-.' },
  { letter: 'G', value: '--.' },
  { letter: 'H', value: '....' },
  { letter: 'I', value: '..' },
  { letter: 'J', value: '.---' },
  { letter: 'K', value: '-.-' },
  { letter: 'L', value: '.-..' },
  { letter: 'M', value: '--' },
  { letter: 'N', value: '-.' },
  { letter: 'O', value: '---' },
  { letter: 'P', value: '.--.' },
  { letter: 'Q', value: '--.-' },
  { letter: 'R', value: '.-.' },
  { letter: 'S', value: '...' },
  { letter: 'T', value: '-' },
  { letter: 'U', value: '..-' },
  { letter: 'V', value: '...-' },
  { letter: 'W', value: '.--' },
  { letter: 'X', value: '-..-' },
  { letter: 'Y', value: '-.--' },
  { letter: 'Z', value: '--..' },
];

export const BRAILLE_CODES: readonly CodeEntry[] = [
  { letter: 'A', value: '⠁' },
  { letter: 'B', value: '⠃' },
  { letter: 'C', value: '⠉' },
  { letter: 'D', value: '⠙' },
  { letter: 'E', value: '⠑' },
  { letter: 'F', value: '⠋' },
  { letter: 'G', value: '⠛' },
  { letter: 'H', value: '⠓' },
  { letter: 'I', value: '⠊' },
  { letter: 'J', value: '⠚' },
  { letter: 'K', value: '⠅' },
  { letter: 'L', value: '⠇' },
  { letter: 'M', value: '⠍' },
  { letter: 'N', value: '⠝' },
  { letter: 'O', value: '⠕' },
  { letter: 'P', value: '⠏' },
  { letter: 'Q', value: '⠟' },
  { letter: 'R', value: '⠗' },
  { letter: 'S', value: '⠎' },
  { letter: 'T', value: '⠞' },
  { letter: 'U', value: '⠥' },
  { letter: 'V', value: '⠧' },
  { letter: 'W', value: '⠺' },
  { letter: 'X', value: '⠭' },
  { letter: 'Y', value: '⠽' },
  { letter: 'Z', value: '⠵' },
];

const brailleDots = (value: string): readonly boolean[] => {
  const pattern = (value.codePointAt(0) ?? 0) - 0x2800;
  // CSS places these six elements row by row; reorder the Braille dot numbers
  // so the standard layout remains 1-2-3 on the left and 4-5-6 on the right.
  return [0, 3, 1, 4, 2, 5].map((index) => (pattern & (1 << index)) !== 0);
};

export const BRAILLE_VISUALS = BRAILLE_CODES.map((code) => ({
  ...code,
  dots: brailleDots(code.value),
}));

export const BINARY_CODES: readonly CodeEntry[] = [...ALPHABET].map((letter) => ({
  letter,
  value: letter.charCodeAt(0).toString(2).padStart(8, '0'),
}));

const CAESAR_SHIFT = 3;
const shiftLetter = (letter: string, shift: number): string =>
  ALPHABET[(ALPHABET.indexOf(letter) + shift + ALPHABET.length) % ALPHABET.length];

export const CAESAR_CODES: readonly CodeEntry[] = [...ALPHABET].map((letter) => ({
  letter,
  value: shiftLetter(letter, CAESAR_SHIFT),
}));

export const PIGPEN_CODES: readonly PigpenCode[] = [
  { letter: 'A', value: '┘', dotted: false, shape: 'corner-bottom-right' },
  { letter: 'B', value: '⊔', dotted: false, shape: 'tee-bottom' },
  { letter: 'C', value: '└', dotted: false, shape: 'corner-bottom-left' },
  { letter: 'D', value: '┤', dotted: false, shape: 'tee-right' },
  { letter: 'E', value: '□', dotted: false, shape: 'box' },
  { letter: 'F', value: '├', dotted: false, shape: 'tee-left' },
  { letter: 'G', value: '┐', dotted: false, shape: 'corner-top-right' },
  { letter: 'H', value: '⊓', dotted: false, shape: 'tee-top' },
  { letter: 'I', value: '┌', dotted: false, shape: 'corner-top-left' },
  { letter: 'J', value: '┘', dotted: true, shape: 'corner-bottom-right' },
  { letter: 'K', value: '⊔', dotted: true, shape: 'tee-bottom' },
  { letter: 'L', value: '└', dotted: true, shape: 'corner-bottom-left' },
  { letter: 'M', value: '┤', dotted: true, shape: 'tee-right' },
  { letter: 'N', value: '□', dotted: true, shape: 'box' },
  { letter: 'O', value: '├', dotted: true, shape: 'tee-left' },
  { letter: 'P', value: '┐', dotted: true, shape: 'corner-top-right' },
  { letter: 'Q', value: '⊓', dotted: true, shape: 'tee-top' },
  { letter: 'R', value: '┌', dotted: true, shape: 'corner-top-left' },
  { letter: 'S', value: '∨', dotted: false, shape: 'cross-top' },
  { letter: 'T', value: '>', dotted: false, shape: 'cross-left' },
  { letter: 'U', value: '<', dotted: false, shape: 'cross-right' },
  { letter: 'V', value: '∧', dotted: false, shape: 'cross-bottom' },
  { letter: 'W', value: '∨', dotted: true, shape: 'cross-top' },
  { letter: 'X', value: '>', dotted: true, shape: 'cross-left' },
  { letter: 'Y', value: '<', dotted: true, shape: 'cross-right' },
  { letter: 'Z', value: '∧', dotted: true, shape: 'cross-bottom' },
];

export const PIGPEN_GRIDS: readonly PigpenGrid[] = [
  { label: 'A–I', shape: 'square', cells: PIGPEN_CODES.slice(0, 9) },
  { label: 'J–R', shape: 'square', cells: PIGPEN_CODES.slice(9, 18) },
  { label: 'S–V', shape: 'cross', cells: PIGPEN_CODES.slice(18, 22) },
  { label: 'W–Z', shape: 'cross', cells: PIGPEN_CODES.slice(22) },
];

const POSITION_NAMES: Record<SemaphorePosition, string> = {
  up: 'haut',
  high: 'haut extérieur',
  out: 'horizontal extérieur',
  low: 'bas extérieur',
  down: 'bas',
  'across-high': 'haut intérieur',
  'across-low': 'bas intérieur',
};

const ARM_ANGLES: Record<SemaphoreSide, Record<SemaphorePosition, number>> = {
  left: {
    up: -90,
    high: -135,
    out: 180,
    low: 135,
    down: 90,
    'across-high': -45,
    'across-low': 45,
  },
  right: {
    up: -90,
    high: -45,
    out: 0,
    low: 45,
    down: 90,
    'across-high': -135,
    'across-low': 135,
  },
};

const RIDDLE_ROUTE = /^\/(?:apercu-ia\/)?enigmes(?:\/[^/]+)?$/u;
const FALLBACK_BACK_LINK = '/enigmes';

const signal = (
  letter: string,
  left: SemaphorePosition,
  right: SemaphorePosition,
): SemaphoreSignal => ({ letter, left, right });

export const SEMAPHORE_SIGNALS: readonly SemaphoreSignal[] = [
  signal('A', 'down', 'low'),
  signal('B', 'down', 'out'),
  signal('C', 'down', 'high'),
  signal('D', 'down', 'up'),
  signal('E', 'high', 'down'),
  signal('F', 'out', 'down'),
  signal('G', 'low', 'down'),
  signal('H', 'across-low', 'out'),
  signal('I', 'across-low', 'high'),
  signal('J', 'out', 'up'),
  signal('K', 'up', 'low'),
  signal('L', 'high', 'low'),
  signal('M', 'out', 'low'),
  signal('N', 'low', 'low'),
  signal('O', 'across-high', 'out'),
  signal('P', 'up', 'out'),
  signal('Q', 'high', 'out'),
  signal('R', 'out', 'out'),
  signal('S', 'low', 'out'),
  signal('T', 'up', 'high'),
  signal('U', 'high', 'high'),
  signal('V', 'low', 'up'),
  signal('W', 'out', 'across-high'),
  signal('X', 'low', 'across-high'),
  signal('Y', 'out', 'high'),
  signal('Z', 'out', 'across-low'),
];

export function resolveCheatsheetBackLink(referrer: string, origin: string): string {
  try {
    const url = new URL(referrer, origin);
    const path = url.pathname.replace(/\/+$/u, '') || '/';
    if (url.origin !== origin || !RIDDLE_ROUTE.test(path)) {
      return FALLBACK_BACK_LINK;
    }
    return `${path}${url.search}${url.hash}`;
  } catch {
    return FALLBACK_BACK_LINK;
  }
}

@Component({
  selector: 'app-cheatsheet',
  templateUrl: './cheatsheet.html',
  styleUrl: './cheatsheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cheatsheet {
  private readonly document = inject(DOCUMENT);
  protected readonly nonogramExample = NONOGRAM_EXAMPLE;
  protected readonly nonogramRowClues = NONOGRAM_ROW_CLUES;
  protected readonly nonogramColumnClues = NONOGRAM_COLUMN_CLUES;
  protected readonly minesweeperExample = MINESWEEPER_EXAMPLE;
  protected readonly morseCodes = MORSE_CODES;
  protected readonly brailleVisuals = BRAILLE_VISUALS;
  protected readonly binaryCodes = BINARY_CODES;
  protected readonly caesarCodes = CAESAR_CODES;
  protected readonly pigpenGrids = PIGPEN_GRIDS;
  protected readonly signals = SEMAPHORE_SIGNALS;
  protected readonly backLink = resolveCheatsheetBackLink(
    this.document.referrer,
    this.document.location.origin,
  );
  protected readonly backLabel = this.backLink.includes('/enigmes/')
    ? 'Retour à l’énigme'
    : 'Retour aux énigmes';

  protected armAngle(position: SemaphorePosition, side: SemaphoreSide): string {
    return `rotate(${ARM_ANGLES[side][position]}deg)`;
  }

  protected signalLabel(signalToRead: SemaphoreSignal): string {
    return `${signalToRead.letter}. Bras gauche : ${POSITION_NAMES[signalToRead.left]}. Bras droit : ${POSITION_NAMES[signalToRead.right]}.`;
  }
}
