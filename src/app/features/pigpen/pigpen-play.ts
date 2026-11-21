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
import { CellMark, matchesClues, PEN_SIZE, PIGPEN_PUZZLES } from './pigpen.model';

const NEXT_MARK: Record<CellMark, CellMark> = { '': 'pig', pig: 'cross', cross: '' };
const MARK_LABEL: Record<CellMark, string> = { '': 'vide', pig: 'cochon', cross: 'barrée' };
const PIG_ROTATION_BY_PEN: readonly number[] = [0, 90, 0, 0, 0, 270, 0];

@Component({
  selector: 'app-pigpen-play',
  templateUrl: './pigpen-play.html',
  styleUrl: './pigpen-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PigpenPlay {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly participants = inject(ParticipantStore);
  private readonly game = inject(GameStore);
  protected readonly size = PEN_SIZE;
  protected readonly puzzles = PIGPEN_PUZZLES;
  private readonly progressKey = computed(
    () =>
      `jdl-pigpen-v1:${this.participants.participant()?.id ?? 'anonymous'}:${this.game.round()?.id ?? 'preview'}`,
  );
  protected readonly boards = linkedSignal({
    source: this.progressKey,
    computation: (key) => this.loadBoards(key),
  });
  protected readonly focused = signal(this.puzzles.map(() => 0));
  protected readonly completed = computed(() =>
    this.puzzles.map((puzzle, pen) => matchesClues(this.boards()[pen], puzzle)),
  );
  protected readonly completedCount = computed(() => this.completed().filter(Boolean).length);

  protected cycle(pen: number, cell: number): void {
    this.setMark(pen, cell, NEXT_MARK[this.boards()[pen][cell]]);
  }

  protected markCross(event: MouseEvent, pen: number, cell: number): void {
    event.preventDefault();
    this.setMark(pen, cell, 'cross');
  }

  protected cellLabel(pen: number, row: number, column: number): string {
    const label = MARK_LABEL[this.boards()[pen][row * this.size + column]];
    return `Ligne ${row + 1}, colonne ${column + 1} : ${label}`;
  }

  protected pigRotation(pen: number): number {
    return PIG_ROTATION_BY_PEN[pen] ?? 0;
  }

  protected focusCell(pen: number, cell: number): void {
    this.focused.update((cells) =>
      cells.map((previous, index) => (index === pen ? cell : previous)),
    );
  }

  protected moveFocus(event: KeyboardEvent, pen: number, row: number, column: number): void {
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
    const cell = row * this.size + column;
    this.host.nativeElement.querySelector<HTMLButtonElement>(`#pen-${pen}-cell-${cell}`)?.focus();
  }

  private setMark(pen: number, cell: number, mark: CellMark): void {
    const boards = [...this.boards()];
    const board = [...boards[pen]];
    board[cell] = mark;
    boards[pen] = board;
    this.boards.set(boards);
    try {
      this.browser?.localStorage.setItem(this.progressKey(), JSON.stringify(boards));
    } catch {}
  }

  private loadBoards(key: string): CellMark[][] {
    try {
      const stored: unknown = JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null');
      if (
        Array.isArray(stored) &&
        stored.length === this.puzzles.length &&
        stored.every(
          (board) =>
            Array.isArray(board) &&
            board.length === this.size ** 2 &&
            board.every((mark) => mark === '' || mark === 'pig' || mark === 'cross'),
        )
      )
        return stored;
    } catch {}
    return this.puzzles.map(() => Array<CellMark>(this.size ** 2).fill(''));
  }
}
