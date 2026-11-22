import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SEMAPHORE_SIGNALS } from '../cheatsheet/cheatsheet';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import {
  boxCell,
  flagCells,
  FLAG_DIGITS,
  isCompleteSudoku,
  SUDOKU_GIVENS,
  SUDOKU_UNITS,
} from './sudoku.model';
import { SudokuPlay } from './sudoku-play';

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const solveBySingles = () => {
  const board = [...SUDOKU_GIVENS];
  const cellUnits = board.map((_, cell) => SUDOKU_UNITS.filter((unit) => unit.includes(cell)));

  for (let step = 0; step < board.length && board.includes(0); step++) {
    const candidates = board.map((digit, cell) =>
      digit
        ? []
        : digits.filter((next) =>
            cellUnits[cell].every((unit) => unit.every((index) => board[index] !== next)),
          ),
    );
    const single = candidates.findIndex((list) => list.length === 1);
    if (single !== -1) {
      board[single] = candidates[single][0];
      continue;
    }
    const forced = SUDOKU_UNITS.flatMap((unit) =>
      digits.flatMap((digit) => {
        const cells = unit.filter((cell) => candidates[cell].includes(digit));
        return cells.length === 1 ? [{ cell: cells[0], digit }] : [];
      }),
    ).at(0);
    if (!forced) break;
    board[forced.cell] = forced.digit;
  }
  return board;
};

describe('les neuf signaux du sudoku', () => {
  const left = { up: 1, high: 0, out: 3, low: 6, down: 7, 'across-high': 2, 'across-low': 8 };
  const right = { up: 1, high: 2, out: 5, low: 8, down: 7, 'across-high': 0, 'across-low': 6 };
  const poseKey = (positions: readonly number[]) => [...positions].sort((a, b) => a - b).join();

  it('se résout sans deviner, avec 36 chiffres de départ', () => {
    expect(SUDOKU_GIVENS).toHaveLength(81);
    expect(SUDOKU_GIVENS.filter(Boolean)).toHaveLength(36);
    expect(isCompleteSudoku(SUDOKU_GIVENS)).toBe(false);
    const solved = solveBySingles();
    expect(isCompleteSudoku(solved)).toBe(true);
    solved[0] = solved[1];
    expect(isCompleteSudoku(solved)).toBe(false);
  });

  it('cache les 18 chiffres des drapeaux et produit neuf poses non ambiguës', () => {
    const solved = solveBySingles();
    const knownPoses = new Set(
      SEMAPHORE_SIGNALS.map((signal) => poseKey([left[signal.left], right[signal.right]])),
    );
    expect(knownPoses.size).toBe(26);
    expect(FLAG_DIGITS).toHaveLength(9);
    for (const [box, pair] of FLAG_DIGITS.entries()) {
      expect(pair[0]).not.toBe(pair[1]);
      const cells = flagCells(solved, box);
      expect(cells).toHaveLength(2);
      expect(cells).not.toContain(4);
      expect(cells.every((cell) => SUDOKU_GIVENS[boxCell(box, cell)] === 0)).toBe(true);
      expect(knownPoses.has(poseKey(cells))).toBe(true);
    }
  });
});

describe('interface de La vigie', () => {
  const storageKey = 'jdl-sudoku-v1:alice:one';
  const round = signal({ id: 'one' });

  beforeEach(() => {
    round.set({ id: 'one' });
    localStorage.removeItem(storageKey);
    TestBed.configureTestingModule({
      imports: [SudokuPlay],
      providers: [
        { provide: GameStore, useValue: { round } },
        { provide: ParticipantStore, useValue: { participant: signal({ id: 'alice' }) } },
      ],
    });
  });

  afterEach(() => localStorage.removeItem(storageKey));

  it('protège les chiffres donnés, nettoie la saisie et permet le déplacement au clavier', () => {
    const fixture = TestBed.createComponent(SudokuPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const cells = page.querySelectorAll<HTMLInputElement>('table input');
    expect(cells).toHaveLength(81);
    expect(page.querySelectorAll('input[readonly]')).toHaveLength(36);
    expect(page.querySelector('#sudoku-guide')).toBeNull();
    expect(page.querySelector('table')?.getAttribute('aria-describedby')).toBeNull();
    expect(page.querySelector('.sudoku .file-label')).toBeNull();
    expect(page.querySelector('.semaphore .file-label')).toBeNull();
    expect(page.querySelector('#signals-title')).toBeNull();
    expect(page.querySelectorAll('.signal-grid li')).toHaveLength(9);
    expect(page.querySelectorAll('.signal-flags')).toHaveLength(9);
    expect(page.querySelectorAll('.digit-flag')).toHaveLength(18);
    const [blank, given] = cells;
    blank.focus();
    blank.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    expect(document.activeElement).toBe(given);
    given.value = '9';
    given.dispatchEvent(new Event('input', { bubbles: true }));
    expect(given.value).toBe(String(SUDOKU_GIVENS[1]));
    blank.value = 'a3';
    blank.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(blank.value).toBe('3');
    expect(blank.selectionStart).toBe(1);
    expect(blank.selectionEnd).toBe(1);
    expect(JSON.parse(localStorage.getItem(storageKey)!).board[0]).toBe(3);
  });

  it('permet de saisir des candidats sans modifier la grille', () => {
    const fixture = TestBed.createComponent(SudokuPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const blank = page.querySelector<HTMLInputElement>('#sudoku-cell-0')!;
    const toggle = page.querySelector<HTMLButtonElement>('.notes-toggle')!;

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    blank.value = '5315';
    blank.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(blank.value).toBe('135');
    expect(blank.selectionStart).toBe(3);
    expect(blank.selectionEnd).toBe(3);
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(
      expect.objectContaining({ board: expect.arrayContaining([0]), notes: expect.any(Array) }),
    );
    expect(JSON.parse(localStorage.getItem(storageKey)!).board[0]).toBe(0);

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(blank.value).toBe('');
    expect(blank.parentElement?.querySelector('.candidates')?.textContent).toContain('135');
    blank.value = '3';
    blank.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(blank.value).toBe('3');
    expect(JSON.parse(localStorage.getItem(storageKey)!).board[0]).toBe(3);
  });

  it('retire un candidat lorsqu’il est saisi une deuxième fois', () => {
    const fixture = TestBed.createComponent(SudokuPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const blank = page.querySelector<HTMLInputElement>('#sudoku-cell-0')!;
    page.querySelector<HTMLButtonElement>('.notes-toggle')!.click();
    fixture.detectChanges();

    blank.value = '3';
    blank.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(blank.value).toBe('3');

    blank.value = '33';
    blank.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(blank.value).toBe('');
    expect(JSON.parse(localStorage.getItem(storageKey)!).notes[0]).toBe('');
  });

  it('vide les saisies du sudoku sans effacer les chiffres donnés', () => {
    const fixture = TestBed.createComponent(SudokuPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const cells = page.querySelectorAll<HTMLInputElement>('table input');
    const firstBlank = SUDOKU_GIVENS.findIndex((digit) => digit === 0);
    const secondBlank = SUDOKU_GIVENS.findIndex(
      (digit, index) => digit === 0 && index !== firstBlank,
    );
    const entered = cells[firstBlank];
    entered.value = '3';
    entered.dispatchEvent(new Event('input', { bubbles: true }));
    page.querySelector<HTMLButtonElement>('.notes-toggle')!.click();
    fixture.detectChanges();
    const noted = cells[secondBlank];
    noted.value = '24';
    noted.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    const clear = page.querySelector<HTMLButtonElement>('.clear-grid')!;
    expect(clear.disabled).toBe(false);
    clear.click();
    fixture.detectChanges();

    expect(cells[firstBlank].value).toBe('');
    expect(cells[secondBlank].value).toBe('');
    expect(cells[1].value).toBe(String(SUDOKU_GIVENS[1]));
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual({
      board: SUDOKU_GIVENS,
      notes: Array<string>(SUDOKU_GIVENS.length).fill(''),
    });
    expect(clear.disabled).toBe(true);
  });

  it('permet aussi de retirer un candidat quand les neuf sont déjà présents', () => {
    const fixture = TestBed.createComponent(SudokuPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const blank = page.querySelector<HTMLInputElement>('#sudoku-cell-0')!;
    page.querySelector<HTMLButtonElement>('.notes-toggle')!.click();
    fixture.detectChanges();

    blank.value = '123456789';
    blank.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(blank.value).toBe('123456789');

    blank.value = '1234567891';
    blank.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(blank.value).toBe('23456789');
  });

  it('active et désactive le mode notes avec la touche plus', () => {
    const fixture = TestBed.createComponent(SudokuPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const toggle = page.querySelector<HTMLButtonElement>('.notes-toggle')!;
    const event = new KeyboardEvent('keydown', { key: '+', cancelable: true });

    window.dispatchEvent(event);
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '+', cancelable: true }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
  });

  it('restaure la grille et conserve les paires de chiffres', () => {
    localStorage.setItem(storageKey, JSON.stringify(solveBySingles()));
    const fixture = TestBed.createComponent(SudokuPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.grid-status')?.textContent).toContain('Grille correcte');
    expect(page.querySelectorAll('.signal-grid li')).toHaveLength(9);
    expect(page.querySelectorAll('.signal-flags')).toHaveLength(9);
    expect(page.querySelectorAll('.digit-flag')).toHaveLength(18);
    round.set({ id: 'two' });
    fixture.detectChanges();
    expect(page.querySelectorAll('.signal-grid li')).toHaveLength(9);
    expect(page.querySelectorAll('.signal-flags')).toHaveLength(9);
    expect(page.querySelectorAll('.digit-flag')).toHaveLength(18);
    expect(page.querySelector('.grid-status')).toBeNull();
  });
});
