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
      if (apply(unknown(), MINES.size - state.filter((mark) => mark === 'flagged').length))
        continue;
      const constraints = indices.flatMap((cell) => {
        if (state[cell] !== 'clear') return [];
        const neighbors = NEIGHBORS[cell];
        const unmarked = neighbors.filter((index) => state[index] === 'hidden');
        if (!unmarked.length) return [];
        return [
          {
            cells: unmarked,
            count:
              MINE_COUNTS[cell] - neighbors.filter((index) => state[index] === 'flagged').length,
          },
        ];
      });
      if (constraints.some(({ cells, count }) => apply(cells, count))) continue;
      if (
        !constraints.some((narrow) =>
          constraints.some(
            (wide) =>
              narrow.cells.length < wide.cells.length &&
              narrow.cells.every((cell) => wide.cells.includes(cell)) &&
              apply(
                wide.cells.filter((cell) => !narrow.cells.includes(cell)),
                wide.count - narrow.count,
              ),
          ),
        )
      )
        break;
    }
    expect(state).not.toContain('hidden');
    expect(state).not.toContain('hit');
    expect(indices.filter((cell) => state[cell] === 'flagged')).toEqual(
      [...MINES].sort((a, b) => a - b),
    );
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

  it('conserve l’extraction dans l’état du démineur sans bloc dédié', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelectorAll('.crossword input')).toHaveLength(194);
    expect(page.querySelectorAll('.mine-square')).toHaveLength(504);
    expect(page.querySelectorAll('.clues button')).toHaveLength(28);
    expect(page.querySelectorAll('.file-label')).toHaveLength(0);
    expect(page.querySelector('.extraction')).toBeNull();
    expect(page.querySelector('[aria-pressed]')).toBeNull();
    expect(page.querySelector('.mine-tools span')).toBeNull();
    expect(page.textContent).not.toContain('Un nombre indique combien de mines');
    expect(page.textContent).not.toContain('Annuler');
    expect(page.querySelectorAll('.mine-tools button')).toHaveLength(1);
    expect(page.querySelector<HTMLButtonElement>('.mine-tools button')?.textContent).toContain(
      'Recommencer le démineur',
    );
    const first = EXTRACTION_CELLS[0];
    const letter = page.querySelector<HTMLInputElement>(`#word-cell-${first}`)!;
    letter.value = 'é';
    letter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(letter.value).toBe('E');
    expect(page.querySelector('.board-status')?.textContent).toContain(
      '0 / 14 cases d’extraction trouvées',
    );
    page.querySelector<HTMLButtonElement>(`#mine-cell-${first}`)!.click();
    fixture.detectChanges();
    const extractionCell = page.querySelector<HTMLButtonElement>(`#mine-cell-${first}`)!;
    expect(extractionCell.querySelector('.target-order')?.textContent).toBe('1');
    expect(extractionCell.querySelector('.target-order')?.tagName).toBe('SPAN');
    expect(extractionCell.textContent?.trim()).toBe('1');
    expect(page.querySelector('.board-status')?.textContent).toContain(
      '1 / 14 cases d’extraction trouvées',
    );
  });

  it('signale visuellement une grille résolue', () => {
    const mines = Array<MineMark>(GRID_SIZE).fill('clear');
    for (const mine of MINES) mines[mine] = 'flagged';
    localStorage.setItem(
      key,
      JSON.stringify({ letters: Array<string>(GRID_SIZE).fill(''), mines }),
    );
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.mine-section')?.classList.contains('solved')).toBe(true);
    expect(page.querySelector('.mine-section .board-status')).toBeNull();
    expect(page.querySelector('.mine-complete')?.textContent).toContain('Démineur complété');
  });

  it('révèle les cases voisines quand les drapeaux correspondent au chiffre', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const initial = initialMinefield();
    const target = MINE_COUNTS.findIndex(
      (count, cell) =>
        initial[cell] === 'clear' &&
        count > 0 &&
        NEIGHBORS[cell].some((neighbor) => initial[neighbor] === 'hidden') &&
        NEIGHBORS[cell].some((neighbor) => initial[neighbor] === 'hidden' && !MINES.has(neighbor)),
    );
    expect(target).toBeGreaterThanOrEqual(0);
    const mineNeighbors = NEIGHBORS[target].filter((neighbor) => MINES.has(neighbor));
    const safeNeighbors = NEIGHBORS[target].filter(
      (neighbor) => initial[neighbor] === 'hidden' && !MINES.has(neighbor),
    );
    for (const mine of mineNeighbors) {
      page
        .querySelector<HTMLButtonElement>(`#mine-cell-${mine}`)!
        .dispatchEvent(new MouseEvent('contextmenu', { cancelable: true, bubbles: true }));
      fixture.detectChanges();
    }
    page.querySelector<HTMLButtonElement>(`#mine-cell-${target}`)!.click();
    fixture.detectChanges();
    expect(
      safeNeighbors.every((neighbor) =>
        page.querySelector(`#mine-cell-${neighbor}`)?.classList.contains('clear'),
      ),
    ).toBe(true);
  });

  it('montre la mine qui explose avant de permettre de recommencer', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const mine = [...MINES][0];
    const button = page.querySelector<HTMLButtonElement>(`#mine-cell-${mine}`)!;
    const letter = page.querySelector<HTMLInputElement>('.crossword input')!;
    letter.value = 'A';
    letter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    button.click();
    fixture.detectChanges();
    expect(page.querySelectorAll('.mine-square.hit')).toHaveLength(1);
    expect(page.querySelectorAll('.mine-square.flagged')).toHaveLength(0);
    expect(button.classList.contains('clear')).toBe(false);
    expect(button.classList.contains('hit')).toBe(true);
    expect(button.querySelector('.mine-explosion')?.textContent).toBe('💥');
    expect(page.textContent).toContain('Mine déclenchée.');
    expect(page.textContent).not.toContain('Annuler');
    expect(letter.value).toBe('A');
    const storedAfterCrash: { letters: string[]; mines: MineMark[] } = JSON.parse(
      localStorage.getItem(key)!,
    );
    expect(storedAfterCrash.mines).toEqual(initialMinefield());

    const safeCell = EXTRACTION_CELLS[0];
    const safe = page.querySelector<HTMLButtonElement>(`#mine-cell-${safeCell}`)!;
    safe.click();
    fixture.detectChanges();
    expect(safe.classList.contains('clear')).toBe(false);
    page.querySelector<HTMLButtonElement>('.mine-tools button')!.click();
    fixture.detectChanges();
    expect(button.classList.contains('hit')).toBe(false);
    expect(letter.value).toBe('A');
    const storedAfterRestart: { letters: string[]; mines: MineMark[] } = JSON.parse(
      localStorage.getItem(key)!,
    );
    expect(storedAfterRestart.mines).toEqual(initialMinefield());
    safe.click();
    fixture.detectChanges();
    expect(safe.classList.contains('clear')).toBe(true);
    const stored: { letters: string[]; mines: MineMark[] } = JSON.parse(localStorage.getItem(key)!);
    expect(stored.letters).toContain('A');
    expect(stored.mines[safeCell]).toBe('clear');
  });
});
