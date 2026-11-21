import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
} from '@angular/core';
import { normalizeAnswer } from '../riddles/game.model';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';

// Les 1 indiquent les cases actives. Chaque case accepte jusqu’à trois lettres.
const LAYOUT = [
  '....1.................',
  '....1.................',
  '....1.................',
  '....1.................',
  '....1.................',
  '....1.................',
  '..113111111111........',
  '....1.................',
  '....1.................',
  '.1..1....1............',
  '1211111111............',
  '.1..1....1..1.........',
  '.1.......1..1.........',
  '.1.......1..1.........',
  '.1....1112111.........',
  '............3111111111',
  '............1.........',
  '............1.........',
];
const WIDTH = LAYOUT[0].length;
const CELL_CAPACITY = 3;
const CAPACITIES = Array.from(LAYOUT.join(''), (cell) => (cell === '.' ? 0 : CELL_CAPACITY));

type Direction = readonly [row: number, column: number];
const ACROSS: Direction = [0, 1];
const DOWN: Direction = [1, 0];
const ARROWS: Partial<Record<string, Direction>> = {
  ArrowUp: [-1, 0],
  ArrowDown: DOWN,
  ArrowLeft: [0, -1],
  ArrowRight: ACROSS,
};

function cellLetters(value: string, capacity: number): string {
  return normalizeAnswer(value).replace(/[0-9]/g, '').slice(0, capacity);
}

@Component({
  selector: 'app-meta-grid',
  templateUrl: './meta-grid.html',
  styleUrl: './meta-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaGrid {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly game = inject(GameStore);
  private readonly participants = inject(ParticipantStore);
  protected readonly storageKey = computed(
    () =>
      `jdl-meta-v1:${this.participants.participant()?.id ?? 'anonymous'}:${this.game.round()?.id ?? 'preview'}`,
  );
  private direction = DOWN;
  protected readonly width = WIDTH;
  protected readonly capacities = CAPACITIES;
  protected readonly focused = linkedSignal({
    source: this.storageKey,
    computation: () => CAPACITIES.findIndex(Boolean),
  });
  protected readonly letters = linkedSignal({
    source: this.storageKey,
    computation: (key) => this.restore(key),
  });

  protected describeCell(index: number, capacity: number): string {
    const row = Math.floor(index / WIDTH) + 1;
    const column = (index % WIDTH) + 1;
    return `Ligne ${row}, colonne ${column}, jusqu’à ${capacity} lettres`;
  }

  protected selectCell(input: HTMLInputElement, index: number): void {
    this.focused.set(index);
    if (this.step(index, 1) === undefined && this.step(index, -1) === undefined) {
      this.direction = this.direction === DOWN ? ACROSS : DOWN;
    }
    input.select();
  }

  protected editCell(event: Event, index: number, capacity: number): void {
    if ((event as InputEvent).isComposing) return;
    const input = event.target as HTMLInputElement;
    const value = cellLetters(input.value, capacity);
    input.value = value;
    if (value !== this.letters()[index]) {
      const letters = [...this.letters()];
      letters[index] = value;
      this.letters.set(letters);
      try {
        this.browser?.localStorage.setItem(this.storageKey(), JSON.stringify(letters));
      } catch {
        // Le brouillon reste disponible en mémoire.
      }
    }
    if (value.length === capacity) this.focus(this.step(index, 1));
  }

  protected moveFocus(event: KeyboardEvent, index: number): void {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const arrow = ARROWS[event.key];
    if (arrow) {
      event.preventDefault();
      const next = this.neighbor(index, ...arrow);
      if (next === undefined) return;
      this.direction = arrow[0] ? DOWN : ACROSS;
      this.focus(next);
    } else if (event.key === 'Backspace' && !this.letters()[index]) {
      event.preventDefault();
      this.focus(this.step(index, -1));
    }
  }

  private step(index: number, distance: number): number | undefined {
    const [row, column] = this.direction;
    return this.neighbor(index, row * distance, column * distance);
  }

  private neighbor(index: number, rowOffset: number, columnOffset: number): number | undefined {
    const column = (index % WIDTH) + columnOffset;
    if (column < 0 || column >= WIDTH) return undefined;
    const next = index + rowOffset * WIDTH + columnOffset;
    return CAPACITIES[next] ? next : undefined;
  }

  private focus(index: number | undefined): void {
    if (index === undefined) return;
    this.host.nativeElement.querySelector<HTMLInputElement>(`#meta-cell-${index}`)?.focus();
  }

  private restore(key: string): string[] {
    try {
      const saved: unknown = JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null');
      if (Array.isArray(saved)) {
        return CAPACITIES.map((capacity, index) => {
          const value = saved[index];
          return typeof value === 'string' ? cellLetters(value, capacity) : '';
        });
      }
    } catch {
      // Un brouillon illisible peut être remplacé par une grille vide.
    }
    return CAPACITIES.map(() => '');
  }
}
