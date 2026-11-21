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

interface SudokuProgress {
  readonly board: number[];
  readonly notes: string[];
}

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
  protected readonly progress = linkedSignal({
    source: this.storageKey,
    computation: (key) => this.restore(key),
  });
  protected readonly board = computed(() => this.progress().board);
  protected readonly notes = computed(() => this.progress().notes);
  protected readonly notesMode = signal(false);
  protected readonly focused = signal(this.givens.findIndex((digit) => digit === 0));
  protected readonly complete = computed(() => isCompleteSudoku(this.board()));
  protected readonly filledCount = computed(() => this.board().filter(Boolean).length);

  protected selectCell(event: FocusEvent, index: number): void {
    this.focused.set(index);
    (event.target as HTMLInputElement).select();
  }

  protected editCell(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (this.notesMode()) {
      const value = this.normalizeNotes(input.value);
      input.value = value;
      if (this.notes()[index] !== value) {
        const notes = [...this.notes()];
        notes[index] = value;
        this.save({ board: [...this.board()], notes });
      }
    } else {
      const value = this.givens[index] || Number(input.value.match(/[1-9]/u)?.[0] ?? '0');
      input.value = value ? String(value) : '';
      if (this.board()[index] !== value || this.notes()[index]) {
        const board = [...this.board()];
        const notes = [...this.notes()];
        board[index] = value;
        notes[index] = '';
        this.save({ board, notes });
      }
    }
    input.select();
  }

  protected toggleNotesMode(): void {
    this.notesMode.update((enabled) => !enabled);
  }

  protected toggleNotesFromHotkey(event: KeyboardEvent): void {
    if (event.key !== '+' && event.code !== 'NumpadAdd') return;
    event.preventDefault();
    this.toggleNotesMode();
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

  private save(progress: SudokuProgress): void {
    this.progress.set(progress);
    try {
      this.browser?.localStorage.setItem(this.storageKey(), JSON.stringify(progress));
    } catch {}
  }

  private restore(key: string): SudokuProgress {
    try {
      const stored: unknown = JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null');
      const boardValue = Array.isArray(stored)
        ? stored
        : stored && typeof stored === 'object' && 'board' in stored
          ? stored.board
          : undefined;
      if (this.isBoard(boardValue)) {
        const board = this.givens.map((digit, index) => digit || boardValue[index]);
        const notesValue =
          stored && typeof stored === 'object' && 'notes' in stored ? stored.notes : undefined;
        const notes = this.isNotes(notesValue)
          ? notesValue.map((note, index) =>
              this.givens[index] || board[index] ? '' : this.normalizeNotes(note),
            )
          : Array<string>(this.givens.length).fill('');
        return { board, notes };
      }
    } catch {}
    return {
      board: [...this.givens],
      notes: Array<string>(this.givens.length).fill(''),
    };
  }

  private isBoard(value: unknown): value is number[] {
    return (
      Array.isArray(value) &&
      value.length === this.givens.length &&
      value.every(
        (digit) => typeof digit === 'number' && Number.isInteger(digit) && digit >= 0 && digit <= 9,
      )
    );
  }

  private isNotes(value: unknown): value is string[] {
    return (
      Array.isArray(value) &&
      value.length === this.givens.length &&
      value.every((note) => typeof note === 'string' && /^[1-9]*$/u.test(note))
    );
  }

  private normalizeNotes(value: string): string {
    return [...new Set(value.match(/[1-9]/gu) ?? [])].sort().join('');
  }
}
