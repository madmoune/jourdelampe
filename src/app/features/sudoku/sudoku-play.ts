import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import {
  BOX_SIZE,
  FLAG_DIGITS,
  isCompleteSudoku,
  SUDOKU_GIVENS,
  SUDOKU_SIZE,
} from './sudoku.model';

@Component({
  selector: 'app-sudoku-play',
  templateUrl: './sudoku-play.html',
  styleUrl: './sudoku-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SudokuPlay {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly participants = inject(ParticipantStore);
  private readonly game = inject(GameStore);
  private readonly storageKey = computed(
    () =>
      `jdl-sudoku-v1:${this.participants.participant()?.id ?? 'anonymous'}:${this.game.round()?.id ?? 'preview'}`,
  );
  protected readonly size = SUDOKU_SIZE;
  protected readonly boxSize = BOX_SIZE;
  protected readonly positions = Array.from({ length: SUDOKU_SIZE }, (_, index) => index);
  protected readonly givens = SUDOKU_GIVENS;
  protected readonly flagDigits = FLAG_DIGITS;
  protected readonly board = linkedSignal({
    source: this.storageKey,
    computation: (key) => this.restore(key),
  });
  protected readonly focused = signal(this.givens.findIndex((digit) => digit === 0));
  protected readonly complete = computed(() => isCompleteSudoku(this.board()));
  protected readonly filledCount = computed(() => this.board().filter(Boolean).length);

  protected selectCell(event: FocusEvent, index: number): void {
    this.focused.set(index);
    (event.target as HTMLInputElement).select();
  }

  protected editCell(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = this.givens[index] || Number(input.value.match(/[1-9]/u)?.[0] ?? '0');
    input.value = value ? String(value) : '';
    if (this.board()[index] !== value) {
      const updated = [...this.board()];
      updated[index] = value;
      this.board.set(updated);
      try {
        this.browser?.localStorage.setItem(this.storageKey(), JSON.stringify(updated));
      } catch {}
    }
    input.select();
  }

  protected moveFocus(event: KeyboardEvent, row: number, column: number): void {
    switch (event.key) {
      case 'ArrowUp':
        row = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        row = Math.min(this.size - 1, row + 1);
        break;
      case 'ArrowLeft':
        column = Math.max(0, column - 1);
        break;
      case 'ArrowRight':
        column = Math.min(this.size - 1, column + 1);
        break;
      default:
        return;
    }
    event.preventDefault();
    this.host.nativeElement
      .querySelector<HTMLInputElement>(`#sudoku-cell-${row * this.size + column}`)
      ?.focus();
  }

  private restore(key: string): number[] {
    try {
      const stored: unknown = JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null');
      if (
        Array.isArray(stored) &&
        stored.length === this.givens.length &&
        stored.every(
          (digit) =>
            typeof digit === 'number' && Number.isInteger(digit) && digit >= 0 && digit <= 9,
        )
      ) {
        return this.givens.map((digit, index) => digit || stored[index]);
      }
    } catch {}
    return [...this.givens];
  }
}
