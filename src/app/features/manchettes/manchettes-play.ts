import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempts } from '../riddles/riddle-attempts';
import { MANCHETTES_ID } from '../riddles/riddle-pages';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import {
  CLUES,
  CROSSWORD_CELLS,
  type CrosswordClue,
  type Direction,
  EXTRACTION_CELLS,
  EXTRACTION_ORDERS,
  GRID_HEIGHT,
  GRID_SIZE,
  GRID_WIDTH,
  initialMinefield,
  MINE_COUNTS,
  MINES,
  NEIGHBORS,
  type MineMark,
  openCell,
} from './manchettes.model';

const ARROWS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};
const CROSSWORD_START = CLUES[0].start;
const CLUES_BY_CELL = CROSSWORD_CELLS.map(({ index }) =>
  CLUES.filter((clue) => clue.cells.includes(index)),
);
const CROSSWORD_CELL_COUNT = CROSSWORD_CELLS.filter((cell) => cell.open).length;
const MAX_EXPLOSIONS = 5;

interface Progress {
  readonly letters: readonly string[];
  readonly mines: readonly MineMark[];
  readonly explosions: number;
}

@Component({
  selector: 'app-manchettes-play',
  templateUrl: './manchettes-play.html',
  styleUrl: './manchettes-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManchettesPlay {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly game = inject(GameStore);
  private readonly participants = inject(ParticipantStore);
  private readonly attempts = inject(RiddleAttempts);
  private readonly submissions = inject(RiddleSubmissions);
  private readonly key = computed(
    () =>
      `jdl-manchettes-v1:${this.participants.participant()?.id ?? 'anonymous'}:${this.game.round()?.id ?? 'preview'}`,
  );
  protected readonly progress = linkedSignal({
    source: this.key,
    computation: (key) => this.restore(key),
  });
  protected readonly width = GRID_WIDTH;
  protected readonly height = GRID_HEIGHT;
  protected readonly cells = CROSSWORD_CELLS;
  protected readonly clueGroups = [
    { label: 'Horizontalement', list: CLUES.filter((clue) => clue.direction === 'across') },
    { label: 'Verticalement', list: CLUES.filter((clue) => clue.direction === 'down') },
  ];
  protected readonly counts = MINE_COUNTS;
  protected readonly orders = EXTRACTION_ORDERS;
  protected readonly letterFocus = signal(CROSSWORD_START);
  protected readonly mineFocus = signal(0);
  protected readonly flagMode = signal(false);
  protected readonly maxExplosions = MAX_EXPLOSIONS;
  private readonly direction = signal<Direction>('across');
  protected readonly activeClue = computed(
    () =>
      CLUES_BY_CELL[this.letterFocus()].find((clue) => clue.direction === this.direction()) ??
      CLUES_BY_CELL[this.letterFocus()][0],
  );
  protected readonly activeCells = computed(() => new Set(this.activeClue()?.cells));
  private readonly crosswordCode = computed(() =>
    this.cells
      .filter((cell) => cell.open)
      .map((cell) => this.progress().letters[cell.index])
      .join(''),
  );
  private readonly crosswordFilled = computed(
    () => this.crosswordCode().length === CROSSWORD_CELL_COUNT,
  );
  private readonly verifiedCrosswordCode = computed(
    () =>
      this.attempts
        .attempts()
        .find(
          (attempt) =>
            attempt.riddleId === MANCHETTES_ID &&
            attempt.roundId === this.game.round()?.id &&
            attempt.kind === 'grid' &&
            attempt.correct &&
            /^[A-Z]{194}$/u.test(attempt.answer),
        )?.answer ?? null,
  );
  private readonly crosswordVerdict = signal<{
    readonly key: string;
    readonly code: string;
    readonly correct?: boolean;
    readonly error?: string;
  } | null>(null);
  private crosswordRequestId = 0;
  private lastCrosswordCheck = '';
  protected readonly currentCrosswordVerdict = computed(() => {
    const code = this.crosswordCode();
    const key = this.key();
    if (code && this.verifiedCrosswordCode() === code) return { correct: true };
    const verdict = this.crosswordVerdict();
    return verdict?.key === key && verdict.code === code ? verdict : null;
  });
  protected readonly crosswordComplete = computed(
    () => this.crosswordFilled() && this.currentCrosswordVerdict()?.correct === true,
  );
  protected readonly crashed = computed(() => this.progress().mines.some((mark) => mark === 'hit'));
  protected readonly explosions = computed(() => this.progress().explosions);
  protected readonly canUndoExplosion = computed(
    () => this.crashed() && this.explosions() < MAX_EXPLOSIONS,
  );
  protected readonly won = computed(
    () =>
      !this.crashed() &&
      this.progress().mines.filter((mark) => mark === 'clear').length === GRID_SIZE - MINES.size,
  );
  protected readonly extracted = computed(() =>
    EXTRACTION_CELLS.map((cell) => {
      const state = this.progress();
      const found = state.mines[cell] === 'clear';
      return { found, letter: found ? state.letters[cell] : '' };
    }),
  );
  protected readonly foundCount = computed(
    () => this.extracted().filter((item) => item.found).length,
  );

  constructor() {
    effect(() => {
      const key = this.key();
      const code = this.crosswordCode();
      const ready = this.game.ready();
      const round = this.game.round();
      const verified = this.verifiedCrosswordCode();
      if (!this.crosswordFilled() || !ready || !round || verified === code) return;
      const checkKey = `${key}:${code}`;
      if (this.lastCrosswordCheck === checkKey) return;
      this.lastCrosswordCheck = checkKey;
      const requestId = ++this.crosswordRequestId;
      untracked(() => void this.checkCrossword(code, key, requestId));
    });
  }

  protected chooseClue(clue: CrosswordClue): void {
    this.direction.set(clue.direction);
    const firstBlank = clue.cells.find((cell) => !this.progress().letters[cell]);
    this.focus('word-cell', firstBlank ?? clue.start);
  }

  protected selectLetter(event: FocusEvent, cell: number): void {
    this.letterFocus.set(cell);
    // A crossing belongs to both entries: keep the direction while typing
    // through it. Switch only when the focused cell cannot be part of the
    // current entry (for example, after clicking a horizontal-only cell).
    if (!CLUES_BY_CELL[cell].some((clue) => clue.direction === this.direction())) {
      this.direction.set(CLUES_BY_CELL[cell][0]?.direction ?? this.direction());
    }
    (event.target as HTMLInputElement).select();
  }

  protected enterLetter(event: Event, cell: number): void {
    const input = event.target as HTMLInputElement;
    const letter = input.value.normalize('NFD').toUpperCase().match(/[A-Z]/u)?.[0] ?? '';
    input.value = letter;
    const state = this.progress();
    if (state.letters[cell] !== letter) {
      const letters = [...state.letters];
      letters[cell] = letter;
      this.save({ ...state, letters });
    }
    const entry =
      CLUES_BY_CELL[cell].find((clue) => clue.direction === this.direction())?.cells ?? [];
    const next = entry[entry.indexOf(cell) + 1];
    if (letter && next !== undefined) this.focus('word-cell', next);
    else input.select();
  }

  protected letterKey(event: KeyboardEvent, cell: number): void {
    if (event.key === 'Enter' && CLUES_BY_CELL[cell].length === 2) {
      event.preventDefault();
      this.direction.update((value) => (value === 'across' ? 'down' : 'across'));
      return;
    }
    if (event.key === 'Backspace' && !this.progress().letters[cell]) {
      const entry =
        CLUES_BY_CELL[cell].find((clue) => clue.direction === this.direction())?.cells ?? [];
      const previous = entry[entry.indexOf(cell) - 1];
      if (previous !== undefined) {
        event.preventDefault();
        this.focus('word-cell', previous);
      }
      return;
    }
    const arrow = ARROWS[event.key];
    if (!arrow) return;
    this.direction.set(arrow[0] ? 'down' : 'across');
    this.move(event, cell, 'word-cell');
  }

  protected playMine(cell: number): void {
    const state = this.progress();
    if (this.won() || this.crashed()) return;
    if (state.mines[cell] === 'clear') {
      const neighbors = NEIGHBORS[cell];
      const flags = neighbors.filter((neighbor) => state.mines[neighbor] === 'flagged').length;
      if (flags !== this.counts[cell]) return;
      let mines = [...state.mines];
      for (const neighbor of neighbors) {
        if (mines[neighbor] !== 'hidden') continue;
        mines = openCell(mines, neighbor);
      }
      this.saveMinefield(state, mines);
      return;
    }
    if (this.flagMode()) {
      this.toggleFlag(cell);
      return;
    }
    if (state.mines[cell] !== 'hidden') return;
    this.saveMinefield(state, openCell(state.mines, cell));
  }

  protected markMine(event: MouseEvent, cell: number): void {
    event.preventDefault();
    this.toggleFlag(cell);
  }

  protected mineKey(event: KeyboardEvent, cell: number): void {
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      this.toggleFlag(cell);
    } else this.move(event, cell, 'mine-cell');
  }

  protected resetMines(): void {
    this.flagMode.set(false);
    this.save({ ...this.progress(), mines: initialMinefield(), explosions: 0 });
  }

  protected undoExplosion(): void {
    const state = this.progress();
    if (!this.canUndoExplosion()) return;
    const hit = state.mines.findIndex((mark) => mark === 'hit');
    if (hit < 0) return;
    const mines = [...state.mines];
    mines[hit] = 'hidden';
    this.save({ ...state, mines });
  }

  protected toggleFlagMode(): void {
    this.flagMode.update((active) => !active);
  }

  protected coordinates(cell: number): string {
    return `Ligne ${Math.floor(cell / this.width) + 1}, colonne ${(cell % this.width) + 1}`;
  }

  protected mineLabel(cell: number): string {
    const prefix = this.coordinates(cell);
    const state = this.progress().mines[cell];
    if (state === 'hidden') return `${prefix} : masquée`;
    if (state === 'flagged') return `${prefix} : drapeau`;
    if (state === 'hit') return `${prefix} : mine déclenchée`;
    const order = this.orders.get(cell);
    if (order) return `${prefix} : lettre ${order} à extraire`;
    const mines = this.counts[cell];
    return `${prefix} : ${mines} ${mines > 1 ? 'mines voisines' : 'mine voisine'}`;
  }

  private toggleFlag(cell: number): void {
    const state = this.progress();
    if (this.won() || this.crashed()) return;
    const mark = state.mines[cell];
    if (mark !== 'hidden' && mark !== 'flagged') return;
    const mines = [...state.mines];
    mines[cell] = mark === 'hidden' ? 'flagged' : 'hidden';
    this.save({ ...state, mines });
  }

  private move(event: KeyboardEvent, cell: number, kind: 'word-cell' | 'mine-cell'): void {
    const arrow = ARROWS[event.key];
    if (!arrow) return;
    event.preventDefault();
    const [dy, dx] = arrow;
    let row = Math.floor(cell / this.width) + dy;
    let column = (cell % this.width) + dx;
    while (row >= 0 && row < this.height && column >= 0 && column < this.width) {
      const next = row * this.width + column;
      if (kind === 'mine-cell' || this.cells[next].open) {
        this.focus(kind, next);
        return;
      }
      row += dy;
      column += dx;
    }
  }

  private focus(kind: string, cell: number): void {
    this.host.nativeElement.querySelector<HTMLElement>(`#${kind}-${cell}`)?.focus();
  }

  private save(state: Progress): void {
    this.progress.set(state);
    try {
      this.browser?.localStorage.setItem(this.key(), JSON.stringify(state));
    } catch {}
  }

  private saveMinefield(state: Progress, mines: readonly MineMark[]): void {
    if (mines.some((mark) => mark === 'hit')) {
      this.save({
        ...state,
        mines,
        explosions: Math.min(MAX_EXPLOSIONS, state.explosions + 1),
      });
      return;
    }
    if (mines.some((mark, index) => mark !== state.mines[index])) {
      this.save({ ...state, mines });
    }
  }

  private async checkCrossword(code: string, key: string, requestId: number): Promise<void> {
    this.crosswordVerdict.set(null);
    try {
      const correct = await this.submissions.checkGrid(MANCHETTES_ID, code);
      if (
        requestId === this.crosswordRequestId &&
        this.key() === key &&
        this.crosswordCode() === code
      )
        this.crosswordVerdict.set({ key, code, correct });
    } catch (error: unknown) {
      if (
        requestId === this.crosswordRequestId &&
        this.key() === key &&
        this.crosswordCode() === code
      )
        this.crosswordVerdict.set({
          key,
          code,
          error: error instanceof Error ? error.message : 'Vérification indisponible.',
        });
    }
  }

  private restore(key: string): Progress {
    try {
      const stored = JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null');
      if (
        Array.isArray(stored?.letters) &&
        stored.letters.length === GRID_SIZE &&
        stored.letters.every(
          (letter: unknown, cell: number) =>
            typeof letter === 'string' &&
            (this.cells[cell].open ? /^$|^[A-Z]$/u.test(letter) : letter === ''),
        ) &&
        Array.isArray(stored?.mines) &&
        stored.mines.length === GRID_SIZE &&
        stored.mines.every(
          (mark: unknown, cell: number) =>
            mark === 'hidden' ||
            mark === 'flagged' ||
            (!MINES.has(cell) && mark === 'clear') ||
            (MINES.has(cell) && mark === 'hit'),
        )
      )
        return {
          letters: stored.letters,
          mines: stored.mines,
          explosions:
            typeof stored.explosions === 'number' &&
            Number.isInteger(stored.explosions) &&
            stored.explosions >= 0 &&
            stored.explosions <= MAX_EXPLOSIONS
              ? stored.explosions
              : 0,
        };
    } catch {}
    return { letters: Array<string>(GRID_SIZE).fill(''), mines: initialMinefield(), explosions: 0 };
  }
}
