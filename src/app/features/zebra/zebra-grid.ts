import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  CategoryId,
  cellState,
  encodeCompleteGrid,
  parseMarks,
  toggleCell,
  ZebraBlock,
  ZEBRA_BLOCKS,
  ZEBRA_CATEGORIES,
  ZebraMarks,
} from './zebra.model';

interface DisplayBlock extends ZebraBlock {
  readonly source: ZebraBlock;
  readonly transposed: boolean;
}

@Component({
  selector: 'app-zebra-grid',
  templateUrl: './zebra-grid.html',
  styleUrl: './zebra-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZebraGrid {
  readonly storageKey = input.required<string>();
  readonly completed = output<{ key: string; code: string | null }>();
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly state = signal<{ key: string; marks: ZebraMarks }>({ key: '', marks: {} });
  protected readonly marks = computed(() =>
    this.state().key === this.storageKey() ? this.state().marks : {},
  );
  protected readonly categories = ZEBRA_CATEGORIES;
  protected readonly columns: readonly CategoryId[] = ['position', 'occupation', 'food'];
  protected readonly rows = (['name', 'food', 'occupation'] as const).map((id, index) => ({
    id,
    ...ZEBRA_CATEGORIES[id],
    blocks: this.columns.slice(0, this.columns.length - index).map((column): DisplayBlock => {
      const source = ZEBRA_BLOCKS.find(
        (block) =>
          (block.row === id && block.column === column) ||
          (block.column === id && block.row === column),
      )!;
      return { id: source.id, row: id, column, source, transposed: source.row !== id };
    }),
    unusedColumns: this.columns
      .slice(this.columns.length - index)
      .reduce((count, column) => count + ZEBRA_CATEGORIES[column].values.length, 0),
  }));
  protected readonly associationCount = computed(
    () => Object.values(this.marks()).filter((mark) => mark === 'yes').length,
  );

  constructor() {
    effect(() => {
      const key = this.storageKey();
      let marks: ZebraMarks = {};
      try {
        marks = parseMarks(JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null'));
      } catch {
        /* Grille utilisable sans stockage. */
      }
      this.state.set({ key, marks });
    });
    effect(() => {
      const { key, marks } = this.state();
      if (!key || key !== this.storageKey()) return;
      try {
        this.browser?.localStorage.setItem(key, JSON.stringify(marks));
      } catch {
        /* Mémoire de la page seulement. */
      }
      this.completed.emit({ key, code: encodeCompleteGrid(marks) });
    });
  }

  protected stateOf(block: DisplayBlock, row: number, column: number) {
    return cellState(
      this.marks(),
      block.source,
      block.transposed ? column : row,
      block.transposed ? row : column,
    );
  }
  protected click(block: DisplayBlock, row: number, column: number): void {
    const nextMark = this.stateOf(block, row, column) === 'empty' ? 'yes' : 'no';
    this.state.set({
      key: this.storageKey(),
      marks: toggleCell(
        this.marks(),
        block.source,
        block.transposed ? column : row,
        block.transposed ? row : column,
        nextMark,
      ),
    });
  }
  protected label(block: DisplayBlock, row: number, column: number): string {
    const status = {
      yes: 'associés',
      no: 'exclus',
      blocked: 'incompatibles avec une association du bloc',
      empty: 'à déterminer',
    };
    const rowValue = this.categories[block.row].values[row];
    return `${rowValue} / ${this.categories[block.column].label} ${this.categories[block.column].values[column]} : ${status[this.stateOf(block, row, column)]}`;
  }
}
