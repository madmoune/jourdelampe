import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempt, RiddleAttempts } from '../riddles/riddle-attempts';
import { FOURCHETTE_ID } from '../riddles/riddle-pages';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { FourchettePlay } from './fourchette-play';
import {
  FOURCHETTE_GRID,
  FOURCHETTE_GRID_VERSION,
  FOURCHETTE_WORD_COLUMNS,
  FOURCHETTE_WORDS,
  parseFourchetteProgress,
} from './fourchette.model';

describe('grille interactive de La Fourchette', () => {
  afterEach(() => localStorage.clear());

  async function setup(correct = true) {
    const round = signal({ id: 'one', resetAt: 1 });
    const participant = signal({ id: 'alice', name: 'Alice' });
    const solved = signal(false);
    const attempts = signal<readonly RiddleAttempt[]>([]);
    const checkGrid = vi.fn().mockResolvedValue(correct);
    const submit = vi.fn();
    await TestBed.configureTestingModule({
      imports: [FourchettePlay],
      providers: [
        { provide: ParticipantStore, useValue: { participant } },
        { provide: RiddleAttempts, useValue: { attempts } },
        { provide: RiddleSubmissions, useValue: { checkGrid, submit } },
        {
          provide: GameStore,
          useValue: {
            ready: signal(true),
            round,
            riddles: computed(() => [
              {
                id: FOURCHETTE_ID,
                solutions: solved() ? [{ participantId: participant().id }] : [],
              },
            ]),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FourchettePlay);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const cell = (coordinate: string) =>
      page.querySelector<HTMLButtonElement>(`[data-cell="${coordinate}"]`)!;
    const checkWords = async () => {
      for (const word of page.querySelectorAll<HTMLButtonElement>('.word-button'))
        if (word.getAttribute('aria-pressed') === 'false') word.click();
      await fixture.whenStable();
    };
    const waitForCheck = async (calls = 1) => {
      await vi.waitFor(() => expect(checkGrid).toHaveBeenCalledTimes(calls), { timeout: 2500 });
      await fixture.whenStable();
    };
    return {
      fixture,
      page,
      round,
      participant,
      solved,
      attempts,
      checkGrid,
      submit,
      cell,
      checkWords,
      waitForCheck,
    };
  }

  it('reproduit les lettres, les chiffres et les deux colonnes de mots fournis', async () => {
    const { page, cell, checkGrid } = await setup();
    expect(page.querySelectorAll('.letter')).toHaveLength(110);
    expect(
      [...page.querySelectorAll('.letter')].map((letter) => letter.textContent!.trim()).join(''),
    ).toBe(FOURCHETTE_GRID.join(''));
    expect(
      [...page.querySelectorAll('.word-columns ul')].map((column) =>
        [...column.querySelectorAll('.word-text')].map((word) => word.textContent),
      ),
    ).toEqual(FOURCHETTE_WORD_COLUMNS);
    expect(page.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(page.querySelector('thead, th')).toBeNull();
    expect(
      [...page.querySelectorAll('tbody tr')].every(
        (row) => row.querySelectorAll('td').length === 22,
      ),
    ).toBe(true);
    expect(cell('A05').textContent?.trim()).toBe('O');
    expect(cell('A04').textContent?.trim()).toBe('0');
    expect(page.querySelector('.verify-grid')).toBeNull();
    expect(page.textContent).not.toContain('Vérifier la grille');
    expect(page.querySelector('.wordsearch-help')?.textContent).toContain(
      'Chaque caractère n’est utilisé qu’une seule fois.',
    );
    expect(page.querySelector('.wordsearch-help')?.textContent).not.toContain('vérifie');
    expect(checkGrid).not.toHaveBeenCalled();
  });

  it('bascule indépendamment une lettre et un mot, sans sélectionner automatiquement les lettres', async () => {
    const { fixture, page, cell } = await setup();
    const firstCell = cell('A01');
    const word = page.querySelector<HTMLButtonElement>('.word-button')!;
    firstCell.focus();
    firstCell.click();
    word.click();
    await fixture.whenStable();
    expect(firstCell.getAttribute('aria-pressed')).toBe('true');
    expect(firstCell.classList.contains('selected')).toBe(true);
    expect(word.classList.contains('found')).toBe(true);
    expect(page.querySelectorAll('.letter.selected')).toHaveLength(1);
    firstCell.click();
    word.click();
    await fixture.whenStable();
    expect(firstCell.getAttribute('aria-pressed')).toBe('false');
    expect(word.getAttribute('aria-pressed')).toBe('false');
  });

  it('met en évidence les lettres restantes pour l’extraction après validation', async () => {
    const { page, cell, checkWords, waitForCheck } = await setup();
    cell('A01').click();
    await checkWords();
    expect(page.querySelectorAll('.letter.extraction-letter')).toHaveLength(0);
    await waitForCheck();
    expect(page.querySelectorAll('.letter.selected')).toHaveLength(1);
    expect(page.querySelectorAll('.letter.extraction-letter')).toHaveLength(109);
  });

  it('vérifie automatiquement les cases dès les dix mots cochés, sans résoudre la réponse finale', async () => {
    const { page, cell, checkWords, waitForCheck, checkGrid, submit } = await setup(false);
    cell('A01').click();
    await checkWords();
    await waitForCheck();
    expect(checkGrid).toHaveBeenCalledExactlyOnceWith(
      FOURCHETTE_ID,
      '1' + '0'.repeat(109),
      FOURCHETTE_GRID_VERSION,
    );
    expect(page.querySelector('.grid-error')?.textContent).toContain('Grille non valide');
    expect(page.querySelector('.grid-success')).toBeNull();
    expect(submit).not.toHaveBeenCalled();
  });

  it('revalide automatiquement après une modification et conserve le focus dans la grille', async () => {
    const { fixture, page, checkWords, waitForCheck, cell, checkGrid, submit } = await setup();
    await checkWords();
    await waitForCheck();
    const message = page.querySelector('.grid-success')!;
    expect(message.textContent).toContain('Tu peux maintenant passer à l’extraction');
    expect(
      message.compareDocumentPosition(page.querySelector('table')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    checkGrid.mockResolvedValueOnce(false);
    const editedCell = cell('A02');
    editedCell.focus();
    editedCell.click();
    await fixture.whenStable();
    expect(page.querySelector('.grid-success')).toBeNull();
    await waitForCheck(2);
    expect(checkGrid).toHaveBeenLastCalledWith(
      FOURCHETTE_ID,
      '01' + '0'.repeat(108),
      FOURCHETTE_GRID_VERSION,
    );
    expect(page.querySelector('.grid-error')?.textContent).toContain('Grille non valide');
    expect(editedCell.ownerDocument.activeElement).toBe(editedCell);
    expect(submit).not.toHaveBeenCalled();
  });

  it('conserve les sélections et réessaie automatiquement après une panne de validation', async () => {
    const { page, cell, checkWords, waitForCheck, checkGrid } = await setup();
    checkGrid.mockRejectedValueOnce(new Error('Connexion indisponible. Réessaie.'));
    cell('A03').click();
    await checkWords();
    await waitForCheck();
    expect(page.querySelector('.grid-error')?.textContent).toContain('momentanément indisponible');
    expect(cell('A03').getAttribute('aria-pressed')).toBe('true');
    await waitForCheck(2);
    expect(checkGrid).toHaveBeenCalledTimes(2);
    expect(page.querySelector('.grid-success')).not.toBeNull();
  });

  it('restaure les sélections sans partager les brouillons entre joueurs ou parties', async () => {
    const { fixture, page, cell, round, participant } = await setup();
    cell('A01').click();
    page.querySelector<HTMLButtonElement>('.word-button')!.click();
    await fixture.whenStable();
    fixture.destroy();
    const reopened = TestBed.createComponent(FourchettePlay);
    await reopened.whenStable();
    const restored = reopened.nativeElement as HTMLElement;
    expect(restored.querySelectorAll('.letter.selected')).toHaveLength(1);
    expect(restored.querySelectorAll('.word-button.found')).toHaveLength(1);
    participant.set({ id: 'bob', name: 'Bob' });
    await reopened.whenStable();
    expect(restored.querySelectorAll('.letter.selected')).toHaveLength(0);
    participant.set({ id: 'alice', name: 'Alice' });
    round.set({ id: 'two', resetAt: 2 });
    await reopened.whenStable();
    expect(restored.querySelectorAll('.word-button.found')).toHaveLength(0);
    round.set({ id: 'one', resetAt: 1 });
    await reopened.whenStable();
    expect(restored.querySelectorAll('.letter.selected')).toHaveLength(1);
    expect(restored.querySelectorAll('.word-button.found')).toHaveLength(1);
  });

  it('récupère une grille validée dans Firebase et la verrouille après la résolution finale', async () => {
    const { fixture, page, attempts, solved } = await setup();
    attempts.set([
      {
        id: 'right',
        riddleId: FOURCHETTE_ID,
        kind: 'grid',
        target: FOURCHETTE_GRID_VERSION,
        answer: '01'.repeat(55),
        correct: true,
        participantName: 'Alice',
        roundId: 'one',
        submittedAt: 1,
      },
    ]);
    await fixture.whenStable();
    expect(page.querySelectorAll('.letter.selected')).toHaveLength(55);
    expect(page.querySelectorAll('.word-button.found')).toHaveLength(10);
    expect(page.querySelector('.grid-success')).not.toBeNull();
    solved.set(true);
    await fixture.whenStable();
    for (const button of page.querySelectorAll<HTMLButtonElement>('button'))
      expect(button.disabled).toBe(true);
  });

  it('vide une grille restaurée sans la remplir à nouveau depuis l’historique après réouverture', async () => {
    const { fixture, page, attempts, submit } = await setup();
    attempts.set([
      {
        id: 'right',
        riddleId: FOURCHETTE_ID,
        kind: 'grid',
        target: FOURCHETTE_GRID_VERSION,
        answer: '01'.repeat(55),
        correct: true,
        participantName: 'Alice',
        roundId: 'one',
        submittedAt: 1,
      },
    ]);
    await fixture.whenStable();
    expect(page.querySelectorAll('.letter.selected')).toHaveLength(55);
    page.querySelector<HTMLButtonElement>('.clear-grid')!.click();
    await fixture.whenStable();
    expect(page.querySelectorAll('.letter.selected')).toHaveLength(0);
    expect(page.querySelectorAll('.word-button.found')).toHaveLength(0);
    expect(page.querySelector('.grid-success')).toBeNull();
    expect(attempts()).toHaveLength(1);
    expect(submit).not.toHaveBeenCalled();
    fixture.destroy();
    const reopened = TestBed.createComponent(FourchettePlay);
    await reopened.whenStable();
    const restored = reopened.nativeElement as HTMLElement;
    expect(restored.querySelectorAll('.letter.selected')).toHaveLength(0);
    expect(restored.querySelectorAll('.word-button.found')).toHaveLength(0);
    expect(restored.querySelector<HTMLButtonElement>('.clear-grid')?.disabled).toBe(true);
  });

  it('ignore une vérification reçue après une remise à zéro', async () => {
    const { fixture, page, checkGrid, checkWords, waitForCheck, round } = await setup();
    let resolve!: (value: boolean) => void;
    checkGrid.mockImplementationOnce(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );
    await checkWords();
    await waitForCheck();
    round.set({ id: 'two', resetAt: 2 });
    await fixture.whenStable();
    resolve(true);
    await fixture.whenStable();
    expect(page.querySelector('.grid-success')).toBeNull();
    expect(page.querySelectorAll('.word-button.found')).toHaveLength(0);
  });

  it('regroupe les clics rapprochés et ne perd pas une modification pendant une validation', async () => {
    const { fixture, cell, page, checkWords, waitForCheck, checkGrid } = await setup();
    let resolve!: (value: boolean) => void;
    checkGrid.mockImplementationOnce(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        }),
    );
    await checkWords();
    await waitForCheck();
    cell('A01').click();
    cell('A02').click();
    cell('A03').click();
    await fixture.whenStable();
    resolve(false);
    await fixture.whenStable();
    expect(page.querySelector('.grid-error')).toBeNull();
    await waitForCheck(2);
    expect(checkGrid).toHaveBeenLastCalledWith(
      FOURCHETTE_ID,
      '111' + '0'.repeat(107),
      FOURCHETTE_GRID_VERSION,
    );
    expect(page.querySelector('.grid-success')).not.toBeNull();
  });

  it('refuse le stockage corrompu et ignore les mots inconnus ou répétés', () => {
    expect(parseFourchetteProgress({ selection: '1', found: [] })).toBeNull();
    expect(
      parseFourchetteProgress({
        selection: '0'.repeat(110),
        found: ['ALTIVO', 'ALTIVO', 'FAUX', 42],
      }),
    ).toEqual({ selection: '0'.repeat(110), found: ['ALTIVO'] });
    expect(FOURCHETTE_WORDS).toHaveLength(10);
  });

  it('ignore les sélections et les validations de la disposition précédente', async () => {
    localStorage.setItem(
      'jdl-fourchette-v1:alice:one',
      JSON.stringify({ selection: '1'.repeat(110), found: FOURCHETTE_WORDS }),
    );
    const { fixture, page, attempts, checkGrid } = await setup();
    attempts.set([
      {
        id: 'old',
        riddleId: FOURCHETTE_ID,
        kind: 'grid',
        answer: '1'.repeat(110),
        correct: true,
        participantName: 'Alice',
        roundId: 'one',
        submittedAt: 1,
      },
    ]);
    await fixture.whenStable();
    expect(page.querySelectorAll('.letter.selected')).toHaveLength(0);
    expect(page.querySelectorAll('.word-button.found')).toHaveLength(0);
    expect(page.querySelector('.grid-success')).toBeNull();
    expect(checkGrid).not.toHaveBeenCalled();
    expect(localStorage.getItem('jdl-fourchette-v1:alice:one')).not.toBeNull();
  });
});
