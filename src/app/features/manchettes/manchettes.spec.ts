import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempt, RiddleAttempts } from '../riddles/riddle-attempts';
import { MANCHETTES_ID } from '../riddles/riddle-pages';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
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
    expect(CLUES.find((clue) => clue.number === 26)?.text).toBe(
      'Groupe de Boom Desjardins derrière « Calvaire ».',
    );
    expect(CLUES.find((clue) => clue.number === 20)?.text).toBe(
      'Chanteur britannique qui apparaît dans son propre rôle dans un épisode de Futurama.',
    );
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
  let gameReady: WritableSignal<boolean>;
  let attemptHistory: WritableSignal<readonly RiddleAttempt[]>;
  let checkGrid: ReturnType<typeof vi.fn>;

  const crosswordAnswers: Readonly<Record<number, string>> = {
    1: 'HEYMANS',
    2: 'EMINEM',
    3: 'KOURSK',
    4: 'FLORIDE',
    5: 'GLADIATOR',
    6: 'MOTELCAPRI',
    7: 'THESIMS',
    8: 'AUGER',
    9: 'MAJORASMASK',
    10: 'SYDNEY',
    11: 'VIDEOTRON',
    12: 'LESCOLOCS',
    13: 'DIABLOII',
    14: 'LAPOINTE',
    15: 'DESJARDINS',
    16: 'HOCHELAGA',
    17: 'WHITFIELD',
    18: 'SCHUMACHER',
    19: 'MAELSTROM',
    20: 'DONOVAN',
    21: 'ROCKET',
    22: 'QUEBECOR',
    23: 'LINKINPARK',
    24: 'NAPSTER',
    25: 'BOUCHER',
    26: 'LACHICANE',
    27: 'TRUDEAU',
    28: 'CONCORDE',
  };

  const correctCrossword = () => {
    const letters = Array<string>(GRID_SIZE).fill('');
    for (const clue of CLUES) {
      const answer = crosswordAnswers[clue.number];
      clue.cells.forEach((cell, index) => (letters[cell] = answer[index]));
    }
    return {
      letters,
      code: CROSSWORD_CELLS.filter((cell) => cell.open)
        .map((cell) => letters[cell.index])
        .join(''),
    };
  };

  beforeEach(() => {
    localStorage.removeItem(key);
    gameReady = signal(false);
    attemptHistory = signal<readonly RiddleAttempt[]>([]);
    checkGrid = vi.fn().mockResolvedValue(false);
    TestBed.configureTestingModule({
      imports: [ManchettesPlay],
      providers: [
        { provide: GameStore, useValue: { round: signal({ id: 'one' }), ready: gameReady } },
        { provide: ParticipantStore, useValue: { participant: signal({ id: 'alice' }) } },
        { provide: RiddleAttempts, useValue: { attempts: attemptHistory } },
        { provide: RiddleSubmissions, useValue: { checkGrid } },
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
    expect(page.querySelector('.mine-tools span')).toBeNull();
    expect(page.textContent).not.toContain('Un nombre indique combien de mines');
    expect(page.textContent).not.toContain('Annuler');
    expect(page.querySelectorAll('.mine-tools button')).toHaveLength(2);
    expect(page.querySelector('.mine-tools button:not([aria-pressed])')?.textContent).toContain(
      'Recommencer le démineur',
    );
    expect(page.querySelector('.mine-lives')?.textContent).toContain('0 / 5');
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

  it('garde le sens horizontal en traversant une entrée verticale', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const horizontalClue = [...page.querySelectorAll<HTMLButtonElement>('.clues button')].find(
      (button) => button.textContent?.includes('25.'),
    )!;
    horizontalClue.click();
    fixture.detectChanges();

    const enter = (cell: number, value: string) => {
      const input = page.querySelector<HTMLInputElement>(`#word-cell-${cell}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      fixture.detectChanges();
    };

    enter(368, 'D');
    expect(page.querySelector<HTMLInputElement>('#word-cell-369')).toBe(document.activeElement);
    enter(369, 'A');
    expect(page.querySelector<HTMLInputElement>('#word-cell-370')).toBe(document.activeElement);
  });

  it('n’affiche pas la réussite quand toutes les cases sont remplies mais incorrectes', async () => {
    const letters = CROSSWORD_CELLS.map((cell) => (cell.open ? 'A' : ''));
    localStorage.setItem(
      key,
      JSON.stringify({ letters, mines: initialMinefield(), explosions: 0 }),
    );
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    gameReady.set(true);
    fixture.detectChanges();
    await vi.waitFor(() => expect(checkGrid).toHaveBeenCalledWith(MANCHETTES_ID, 'A'.repeat(194)));
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.crossword-success')).toBeNull();
    expect(page.querySelector('.crossword-complete-section')).toBeNull();
    expect(page.querySelector('.crossword-complete-grid')).toBeNull();
  });

  it('affiche la réussite seulement après la validation de toutes les réponses', async () => {
    checkGrid.mockResolvedValue(true);
    const { letters, code } = correctCrossword();
    localStorage.setItem(
      key,
      JSON.stringify({ letters, mines: initialMinefield(), explosions: 0 }),
    );
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    gameReady.set(true);
    fixture.detectChanges();
    await vi.waitFor(() => expect(checkGrid).toHaveBeenCalledWith(MANCHETTES_ID, code));
    await vi.waitFor(() =>
      expect(fixture.nativeElement.querySelector('.crossword-success')).not.toBeNull(),
    );
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.crossword-success')?.textContent).toContain(
      'Toutes les réponses sont bonnes',
    );
    expect(page.querySelector('.crossword-complete-section')).not.toBeNull();
    expect(page.querySelector('.crossword-complete-grid')).not.toBeNull();
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
    expect(page.querySelector('.mine-complete')?.textContent).toContain('Terrain déminé');
  });

  it('pose et retire un drapeau par simple pression sans ouvrir la case', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const toggle = page.querySelector<HTMLButtonElement>('.mine-tools [aria-pressed]')!;
    const mine = page.querySelector<HTMLButtonElement>(`#mine-cell-${[...MINES][0]}`)!;

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    mine.click();
    fixture.detectChanges();
    expect(mine.classList.contains('flagged')).toBe(true);
    mine.click();
    fixture.detectChanges();
    expect(mine.classList.contains('flagged')).toBe(false);
    expect(mine.classList.contains('hit')).toBe(false);

    toggle.click();
    mine.click();
    fixture.detectChanges();
    expect(mine.classList.contains('hit')).toBe(true);
  });

  it.each([false, true])(
    'révèle les cases voisines quand les drapeaux correspondent au chiffre (mode drapeau %s)',
    (flagMode) => {
      const fixture = TestBed.createComponent(ManchettesPlay);
      fixture.detectChanges();
      const page: HTMLElement = fixture.nativeElement;
      const button = (cell: number) => page.querySelector<HTMLButtonElement>(`#mine-cell-${cell}`)!;
      const toggle = page.querySelector<HTMLButtonElement>('.mine-tools [aria-pressed]')!;
      const initial = initialMinefield();
      const target = MINE_COUNTS.findIndex(
        (count, cell) =>
          initial[cell] === 'clear' &&
          count > 0 &&
          NEIGHBORS[cell].some(
            (neighbor) => initial[neighbor] === 'hidden' && !MINES.has(neighbor),
          ),
      );
      expect(target).toBeGreaterThanOrEqual(0);
      const mineNeighbors = NEIGHBORS[target].filter((neighbor) => MINES.has(neighbor));
      const safeNeighbors = NEIGHBORS[target].filter(
        (neighbor) => initial[neighbor] === 'hidden' && !MINES.has(neighbor),
      );

      if (flagMode) toggle.click();
      button(target).click();
      fixture.detectChanges();
      for (const neighbor of safeNeighbors) {
        expect(button(neighbor).getAttribute('aria-label')).toContain('masquée');
      }

      for (const mine of mineNeighbors) {
        if (flagMode) button(mine).click();
        else {
          button(mine).dispatchEvent(
            new MouseEvent('contextmenu', { cancelable: true, bubbles: true }),
          );
        }
      }
      button(target).click();
      fixture.detectChanges();

      for (const neighbor of safeNeighbors) expect(button(neighbor).classList).toContain('clear');
      for (const mine of mineNeighbors) expect(button(mine).classList).toContain('flagged');
      expect(toggle.getAttribute('aria-pressed')).toBe(String(flagMode));
    },
  );

  it('permet quatre annulations puis impose un redémarrage à la cinquième explosion', () => {
    const fixture = TestBed.createComponent(ManchettesPlay);
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    const mine = [...MINES][0];
    const button = page.querySelector<HTMLButtonElement>(`#mine-cell-${mine}`)!;
    const letter = page.querySelector<HTMLInputElement>('.crossword input')!;
    letter.value = 'A';
    letter.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    const undo = () => page.querySelector<HTMLButtonElement>('.undo-mine');
    for (let attempt = 1; attempt <= 4; attempt++) {
      button.click();
      fixture.detectChanges();
      expect(page.querySelectorAll('.mine-square.hit')).toHaveLength(1);
      expect(button.classList.contains('hit')).toBe(true);
      expect(page.querySelector('.mine-lives')?.textContent).toContain(`${attempt} / 5`);
      expect(undo()).not.toBeNull();
      expect(page.textContent).toContain('Mine déclenchée.');

      const storedAfterCrash: { letters: string[]; mines: MineMark[]; explosions: number } =
        JSON.parse(localStorage.getItem(key)!);
      expect(storedAfterCrash.explosions).toBe(attempt);
      undo()!.click();
      fixture.detectChanges();
      expect(button.classList.contains('hit')).toBe(false);
      expect(button.getAttribute('aria-label')).toContain('masquée');
      expect(undo()).toBeNull();
    }

    expect(letter.value).toBe('A');
    button.click();
    fixture.detectChanges();
    expect(button.classList.contains('hit')).toBe(true);
    expect(undo()).toBeNull();
    expect(page.textContent).toContain('Cinquième mine déclenchée.');
    const storedAtLimit: { letters: string[]; mines: MineMark[]; explosions: number } = JSON.parse(
      localStorage.getItem(key)!,
    );
    expect(storedAtLimit.explosions).toBe(5);

    const safeCell = EXTRACTION_CELLS[0];
    const safe = page.querySelector<HTMLButtonElement>(`#mine-cell-${safeCell}`)!;
    safe.click();
    fixture.detectChanges();
    expect(safe.classList.contains('clear')).toBe(false);
    page.querySelector<HTMLButtonElement>('.mine-tools button:not([aria-pressed])')!.click();
    fixture.detectChanges();
    expect(button.classList.contains('hit')).toBe(false);
    expect(letter.value).toBe('A');
    const storedAfterRestart: { letters: string[]; mines: MineMark[]; explosions: number } =
      JSON.parse(localStorage.getItem(key)!);
    expect(storedAfterRestart.mines).toEqual(initialMinefield());
    expect(storedAfterRestart.explosions).toBe(0);
    safe.click();
    fixture.detectChanges();
    expect(safe.classList.contains('clear')).toBe(true);
    const stored: { letters: string[]; mines: MineMark[]; explosions: number } = JSON.parse(
      localStorage.getItem(key)!,
    );
    expect(stored.letters).toContain('A');
    expect(stored.mines[safeCell]).toBe('clear');
  });
});
