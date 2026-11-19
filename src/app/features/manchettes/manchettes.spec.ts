import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import {
  CLUES,
  CROSSWORD_CELLS,
  EXTRACTION_CELLS,
  GRID_HEIGHT,
  GRID_SIZE,
  GRID_WIDTH,
  initialMinefield,
  MINE_COUNTS,
  MINES,
  type MineMark,
  NEIGHBORS,
  openCell,
} from './manchettes.model';
import { ManchettesPlay } from './manchettes-play';

describe('données des mots croisés et du démineur', () => {
  it('reproduit les 28 définitions et les 194 cases à lettre sur 21 × 24', () => {
    expect([GRID_WIDTH, GRID_HEIGHT, GRID_SIZE]).toEqual([21, 24, 504]);
    expect(CLUES).toHaveLength(28);
    expect(CLUES.filter((clue) => clue.direction === 'across')).toHaveLength(14);
    expect(CLUES.filter((clue) => clue.direction === 'down')).toHaveLength(14);
    const crosswordIndices = CROSSWORD_CELLS.filter((cell) => cell.open).map((cell) => cell.index);
    expect(crosswordIndices).toHaveLength(194);
    expect(new Set(CLUES.flatMap((clue) => clue.cells))).toEqual(new Set(crosswordIndices));
  });

  it('réserve les cases sûres entourées de huit mines aux 14 lettres à extraire', () => {
    const surrounded = MINE_COUNTS.flatMap((count, cell) =>
      count === 8 && !MINES.has(cell) ? [cell] : [],
    );
    expect(EXTRACTION_CELLS).toHaveLength(14);
    expect(new Set(surrounded)).toEqual(new Set(EXTRACTION_CELLS));
    expect(EXTRACTION_CELLS.every((cell) => CROSSWORD_CELLS[cell].open)).toBe(true);
    expect(EXTRACTION_CELLS.every((cell) => initialMinefield()[cell] === 'hidden')).toBe(true);
  });

  it('permet de déduire tout le terrain avec les indices voisins et le total de mines', () => {
    let state = initialMinefield();
    const indices = CROSSWORD_CELLS.map((cell) => cell.index);
    const unknown = () => indices.filter((index) => state[index] === 'hidden');
    const apply = (cells: readonly number[], count: number): boolean => {
      const hidden = cells.filter((cell) => state[cell] === 'hidden');
      if (!hidden.length || (count !== 0 && count !== cells.length)) return false;
      for (const cell of hidden) {
        if (count) state[cell] = 'flagged';
        else state = openCell(state, cell);
      }
      return true;
    };
    for (let step = 0; step < GRID_SIZE && unknown().length; step++) {
      if (apply(unknown(), MINES.size - state.filter((mark) => mark === 'flagged').length)) continue;
      const constraints = indices.flatMap((cell) => {
        if (state[cell] !== 'clear') return [];
        const neighbors = NEIGHBORS[cell];
        const unmarked = neighbors.filter((index) => state[index] === 'hidden');
        if (!unmarked.length) return [];
        return [{
          cells: unmarked,
          count: MINE_COUNTS[cell] - neighbors.filter((index) => state[index] === 'flagged').length,
        }];
      });
      if (constraints.some(({ cells, count }) => apply(cells, count))) continue;
      if (
        !constraints.some((narrow) => constraints.some((wide) =>
          narrow.cells.length < wide.cells.length &&
          narrow.cells.every((cell) => wide.cells.includes(cell)) &&
          apply(wide.cells.filter((cell) => !narrow.cells.includes(cell)), wide.count - narrow.count),
        ))
      ) break;
    }
    expect(state).not.toContain('hidden');
    expect(state).not.toContain('hit');
    expect(indices.filter((cell) => state[cell] === 'flagged')).toEqual([...MINES].sort((a, b) => a - b));
  });
});

describe('interaction d’En manchettes', () => {
  const key = 'jdl-manchettes-v1:alice:one';

  beforeEach(() => {
    localStorage.removeItem(key);
    TestBed.configureTestingModule({
      imports: [ManchettesPlay],
      providers: [
        { provide: GameStore, useValue: { round: signal({ id: 'one' }) } },
        { provide: ParticipantStore, useValue: { participant: signal({ id: 'alice' }) } },
      ],
    });
  });
  afterEach(() => localStorage.removeItem(key));

  it('remplit l’extraction uniquement après ouverture de la case correspondante', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelectorAll('.crossword input')).toHaveLength(194);
    expect(page.querySelectorAll('.mine-square')).toHaveLength(504);
    expect(page.querySelectorAll('.clues button')).toHaveLength(28);
    const first = EXTRACTION_CELLS[0];
    const letter = page.querySelector<HTMLInputElement>(`#word-cell-${first}`)!;
    letter.value = 'é';
    letter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(letter.value).toBe('E');
    expect(page.querySelector('.extraction li strong')?.textContent).toBe('·');
    page.querySelector<HTMLButtonElement>(`#mine-cell-${first}`)!.click();
    fixture.detectChanges();
    expect(page.querySelector('.target-order')?.textContent).toBe('1');
    expect(page.querySelector('.extraction li strong')?.textContent).toBe('E');
  });

  it('pose un drapeau, déclenche une mine sans lui, puis réinitialise seulement le démineur', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const mine = [...MINES][0];
    const button = page.querySelector<HTMLButtonElement>(`#mine-cell-${mine}`)!;
    button.dispatchEvent(new MouseEvent('contextmenu', { cancelable: true, bubbles: true }));
    fixture.detectChanges();
    expect(button.classList.contains('flagged')).toBe(true);
    button.click();
    fixture.detectChanges();
    expect(button.classList.contains('hit')).toBe(false);
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', cancelable: true, bubbles: true }));
    button.click();
    fixture.detectChanges();
    expect(button.classList.contains('hit')).toBe(true);
    const letter = page.querySelector<HTMLInputElement>('.crossword input')!;
    letter.value = 'A';
    letter.dispatchEvent(new Event('input', { bubbles: true }));
    page.querySelectorAll<HTMLButtonElement>('.mine-tools button')[1].click();
    fixture.detectChanges();
    expect(button.classList.contains('hit')).toBe(false);
    expect(letter.value).toBe('A');
    const stored: { letters: string[]; mines: MineMark[] } = JSON.parse(localStorage.getItem(key)!);
    expect(stored.letters).toContain('A');
    expect(stored.mines).toEqual(initialMinefield());
  });
});
