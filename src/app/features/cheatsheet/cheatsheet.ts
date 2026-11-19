import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type SemaphorePosition =
  | 'up'
  | 'high'
  | 'out'
  | 'low'
  | 'down'
  | 'across-high'
  | 'across-low';
type SemaphoreSide = 'left' | 'right';

interface SemaphoreSignal {
  readonly letter: string;
  readonly circle: number;
  readonly left: SemaphorePosition;
  readonly right: SemaphorePosition;
}

interface SemaphoreControl {
  readonly title: string;
  readonly symbol: string;
  readonly left: SemaphorePosition;
  readonly right: SemaphorePosition;
  readonly description: string;
}

const POSITION_NAMES: Record<SemaphorePosition, string> = {
  up: 'haut',
  high: 'haut extérieur',
  out: 'horizontal extérieur',
  low: 'bas extérieur',
  down: 'bas',
  'across-high': 'haut intérieur',
  'across-low': 'bas intérieur',
};

const POSITION_CLOCKS: Record<SemaphoreSide, Record<SemaphorePosition, string>> = {
  left: {
    up: '12 h',
    high: '10–11 h',
    out: '9 h',
    low: '7–8 h',
    down: '6 h',
    'across-high': '1–2 h',
    'across-low': '4–5 h',
  },
  right: {
    up: '12 h',
    high: '1–2 h',
    out: '3 h',
    low: '4–5 h',
    down: '6 h',
    'across-high': '10–11 h',
    'across-low': '7–8 h',
  },
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

const signal = (
  letter: string,
  circle: number,
  left: SemaphorePosition,
  right: SemaphorePosition,
): SemaphoreSignal => ({ letter, circle, left, right });

export const SEMAPHORE_SIGNALS: readonly SemaphoreSignal[] = [
  signal('A', 1, 'down', 'low'),
  signal('B', 1, 'down', 'out'),
  signal('C', 1, 'down', 'high'),
  signal('D', 1, 'down', 'up'),
  signal('E', 1, 'high', 'down'),
  signal('F', 1, 'out', 'down'),
  signal('G', 1, 'low', 'down'),
  signal('H', 2, 'across-low', 'out'),
  signal('I', 2, 'across-low', 'high'),
  signal('J', 5, 'out', 'up'),
  signal('K', 2, 'up', 'low'),
  signal('L', 2, 'high', 'low'),
  signal('M', 2, 'out', 'low'),
  signal('N', 2, 'low', 'low'),
  signal('O', 3, 'across-high', 'out'),
  signal('P', 3, 'up', 'out'),
  signal('Q', 3, 'high', 'out'),
  signal('R', 3, 'out', 'out'),
  signal('S', 3, 'low', 'out'),
  signal('T', 4, 'up', 'high'),
  signal('U', 4, 'high', 'high'),
  signal('V', 5, 'low', 'up'),
  signal('W', 6, 'out', 'across-high'),
  signal('X', 6, 'low', 'across-high'),
  signal('Y', 4, 'out', 'high'),
  signal('Z', 7, 'out', 'across-low'),
];

export const SEMAPHORE_CIRCLES = [
  { number: 1, letters: 'A · B · C · D · E · F · G' },
  { number: 2, letters: 'H · I · K · L · M · N' },
  { number: 3, letters: 'O · P · Q · R · S' },
  { number: 4, letters: 'T · U · Y' },
  { number: 5, letters: 'J · V' },
  { number: 6, letters: 'W · X' },
  { number: 7, letters: 'Z' },
] as const;

export const SEMAPHORE_DIRECTIONS = [
  { glyph: '↑', label: 'Haut', detail: '12 h' },
  { glyph: '↗ / ↖', label: 'Haut extérieur', detail: '1–2 h / 10–11 h' },
  { glyph: '→ / ←', label: 'Horizontal extérieur', detail: '3 h / 9 h' },
  { glyph: '↘ / ↙', label: 'Bas extérieur', detail: '4–5 h / 7–8 h' },
  { glyph: '↓', label: 'Bas', detail: '6 h' },
  { glyph: '↙ / ↘', label: 'Bas intérieur', detail: '7–8 h / 4–5 h' },
  { glyph: '↖ / ↗', label: 'Haut intérieur', detail: '10–11 h / 1–2 h' },
] as const;

export const SEMAPHORE_CONTROLS: readonly SemaphoreControl[] = [
  {
    title: 'Chiffres',
    symbol: '123',
    left: 'high',
    right: 'up',
    description: 'Envoie ce signal, puis A = 1, B = 2, …, I = 9 et K = 0.',
  },
  {
    title: 'Retour aux lettres',
    symbol: 'J',
    left: 'out',
    right: 'up',
    description: 'Le J sert aussi de signal « lettres » pour quitter le mode chiffres.',
  },
  {
    title: 'Annulation',
    symbol: '×',
    left: 'low',
    right: 'high',
    description: 'Annule le dernier caractère ou le dernier signal envoyé.',
  },
];

@Component({
  selector: 'app-cheatsheet',
  imports: [RouterLink],
  templateUrl: './cheatsheet.html',
  styleUrl: './cheatsheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cheatsheet {
  protected readonly signals = SEMAPHORE_SIGNALS;
  protected readonly circles = SEMAPHORE_CIRCLES;
  protected readonly directions = SEMAPHORE_DIRECTIONS;
  protected readonly controls = SEMAPHORE_CONTROLS;

  protected positionLabel(position: SemaphorePosition, side: SemaphoreSide): string {
    return `${POSITION_NAMES[position]} · ${POSITION_CLOCKS[side][position]}`;
  }

  protected armAngle(position: SemaphorePosition, side: SemaphoreSide): string {
    return `rotate(${ARM_ANGLES[side][position]}deg)`;
  }

  protected signalLabel(signalToRead: SemaphoreSignal): string {
    return `${signalToRead.letter}. Bras gauche : ${this.positionLabel(signalToRead.left, 'left')}. Bras droit : ${this.positionLabel(signalToRead.right, 'right')}.`;
  }

  protected controlLabel(control: SemaphoreControl): string {
    return `${control.title}. Bras gauche : ${this.positionLabel(control.left, 'left')}. Bras droit : ${this.positionLabel(control.right, 'right')}.`;
  }
}
