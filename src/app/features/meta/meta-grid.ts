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
  '........1.........',
  '........1.........',
  '........1.........',
  '........1.........',
  '........1.........',
  '........1.........',
  '......111111111111',
  '........1.........',
  '........1.........',
  '1....1..1....1....',
  '1...1111111111....',
  '1....1..1....1....',
  '1....1.......1....',
  '1111111111...1....',
  '1....1....1111111.',
  '1.................',
];
const WIDTH = LAYOUT[0].length;
const PREVIOUS_WIDTH = 22;
const STORAGE_PREFIX = 'jdl-meta-v2:';
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

function neighbor(index: number, rowOffset: number, columnOffset: number): number | undefined {
  const column = (index % WIDTH) + columnOffset;
  if (column < 0 || column >= WIDTH) return undefined;
  const next = index + rowOffset * WIDTH + columnOffset;
  return CAPACITIES[next] ? next : undefined;
}

const CLUES = [
  {
    row: 1,
    column: 9,
    previousStart: [1, 5],
    direction: DOWN,
    text: 'La chanteuse québécoise qui a enregistré « Parle-moi » et « Jamais assez loin » s’appelle',
  },
  {
    row: 7,
    column: 7,
    previousStart: [7, 3],
    direction: ACROSS,
    text: 'Dans South Park, le garçon à la tuque verte qui tient tête à Cartman s’appelle',
  },
  {
    row: 10,
    column: 1,
    previousStart: [12, 13],
    direction: DOWN,
    text: 'À Québec, la forteresse en étoile qui couronne le cap Diamant est la',
  },
  {
    row: 10,
    column: 6,
    previousStart: [10, 2],
    direction: DOWN,
    text: 'La série animée où Tommy Pickles et ses amis partent à l’aventure à quatre pattes s’intitule',
  },
  {
    row: 10,
    column: 14,
    previousStart: [10, 10],
    direction: DOWN,
    text: 'Jean-René Dufort revient avec humour sur l’actualité dans l’émission',
  },
  {
    row: 11,
    column: 5,
    previousStart: [11, 1],
    direction: ACROSS,
    text: 'Au cinéma, Wolverine et P. T. Barnum ont tous deux été incarnés par',
  },
  {
    row: 14,
    column: 1,
    previousStart: [16, 13],
    direction: ACROSS,
    text: 'Dans Pokémon, la mère de Sacha vit à Bourg Palette et s’appelle',
  },
  {
    row: 15,
    column: 11,
    previousStart: [15, 7],
    direction: ACROSS,
    text: 'Le célèbre séducteur vénitien prénommé Giacomo portait le nom de',
  },
].map(({ row, column, ...clue }, index) => {
  const start = (row - 1) * WIDTH + column - 1;
  const cells: number[] = [];
  for (
    let cell: number | undefined = start;
    cell !== undefined;
    cell = neighbor(cell, ...clue.direction)
  ) {
    cells.push(cell);
  }
  return { ...clue, number: index + 1, start, cells };
});

type MetaClue = (typeof CLUES)[number];
const CLUE_NUMBERS = new Map(CLUES.map((clue) => [clue.start, clue.number]));

// Un croisement peut se séparer ou réunir deux anciennes cases.
const PREVIOUS_CELLS = CAPACITIES.map(() => new Set<number>());
for (const { cells, direction, previousStart } of CLUES) {
  const [row, column] = previousStart;
  const start = (row - 1) * PREVIOUS_WIDTH + column - 1;
  const step = direction[0] * PREVIOUS_WIDTH + direction[1];
  for (const [offset, cell] of cells.entries()) {
    PREVIOUS_CELLS[cell].add(start + offset * step);
  }
}

function cellLetters(value: unknown, capacity: number): string {
  if (typeof value !== 'string') return '';
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
      `${STORAGE_PREFIX}${this.participants.participant()?.id ?? 'anonymous'}:${this.game.round()?.id ?? 'preview'}`,
  );
  private direction = DOWN;
  protected readonly width = WIDTH;
  protected readonly capacities = CAPACITIES;
  protected readonly clueNumbers = CLUE_NUMBERS;
  protected readonly clueGroups = [
    { label: 'Horizontalement', clues: CLUES.filter((clue) => clue.direction === ACROSS) },
    { label: 'Verticalement', clues: CLUES.filter((clue) => clue.direction === DOWN) },
  ];
  protected readonly focused = linkedSignal({
    source: this.storageKey,
    computation: () => CAPACITIES.findIndex(Boolean),
  });
  protected readonly letters = linkedSignal({
    source: this.storageKey,
    computation: (key) => this.restore(key),
  });
  protected readonly hasLetters = computed(() => this.letters().some(Boolean));
  protected readonly clueCompletions = computed(() => {
    const letters = this.letters();
    return CLUES.map((clue) => {
      const parts = clue.cells.map((cell) => letters[cell]);
      return parts.every(Boolean) ? parts.join('') : '';
    });
  });

  protected describeCell(index: number, capacity: number): string {
    const row = Math.floor(index / WIDTH) + 1;
    const column = (index % WIDTH) + 1;
    const number = this.clueNumbers.get(index);
    const clue = number ? `, début de l’indice ${number}` : '';
    return `Ligne ${row}, colonne ${column}${clue}, jusqu’à ${capacity} lettres`;
  }

  protected chooseClue(clue: MetaClue): void {
    this.direction = clue.direction;
    this.focus(clue.cells.find((cell) => !this.letters()[cell]) ?? clue.start);
  }

  protected clearGrid(): void {
    this.saveLetters(CAPACITIES.map(() => ''));
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
      this.saveLetters(letters);
    }
    if (value.length === capacity) this.focus(this.step(index, 1));
  }

  protected moveFocus(event: KeyboardEvent, index: number): void {
    if (event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const arrow = ARROWS[event.key];
    if (arrow) {
      event.preventDefault();
      const next = neighbor(index, ...arrow);
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
    return neighbor(index, row * distance, column * distance);
  }

  private focus(index: number | undefined): void {
    if (index === undefined) return;
    this.host.nativeElement.querySelector<HTMLInputElement>(`#meta-cell-${index}`)?.focus();
  }

  private saveLetters(letters: string[]): void {
    this.letters.set(letters);
    try {
      this.browser?.localStorage.setItem(this.storageKey(), JSON.stringify(letters));
    } catch {
      // Le brouillon reste disponible en mémoire.
    }
  }

  private restore(key: string): string[] {
    try {
      const storage = this.browser?.localStorage;
      const saved: unknown = JSON.parse(storage?.getItem(key) ?? 'null');
      if (Array.isArray(saved)) {
        return CAPACITIES.map((capacity, index) => cellLetters(saved[index], capacity));
      }

      const previousKey = key.replace(STORAGE_PREFIX, 'jdl-meta-v1:');
      const previous: unknown = JSON.parse(storage?.getItem(previousKey) ?? 'null');
      if (Array.isArray(previous)) {
        return PREVIOUS_CELLS.map((cells) => {
          const [first = '', ...others] = Array.from(cells, (index) =>
            cellLetters(previous[index], CELL_CAPACITY),
          ).filter(Boolean);
          return others.every((value) => value === first) ? first : '';
        });
      }
    } catch {
      // Un brouillon illisible peut être remplacé par une grille vide.
    }
    return CAPACITIES.map(() => '');
  }
}
