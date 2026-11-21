import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempts } from '../riddles/riddle-attempts';
import { RIDDLE_COUNT } from '../riddles/riddle-pages';
import { META_PREVIEW_UNLOCKED, RIDDLE_OPEN_EARLY } from '../riddles/riddle-release';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { MetaPage } from './meta-page';

describe('page du méta', () => {
  const round = signal({ id: 'one', resetAt: 1 });
  const riddles = signal<{ id: string; solutions: { participantId: string }[] }[]>([]);
  const storageKey = 'jdl-meta-v2:alice:one';
  const previousStorageKey = 'jdl-meta-v1:alice:one';

  beforeEach(() => {
    round.set({ id: 'one', resetAt: 1 });
    riddles.set([]);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: RIDDLE_OPEN_EARLY, useValue: true },
        { provide: META_PREVIEW_UNLOCKED, useValue: true },
        { provide: RiddleAttempts, useValue: { attempts: signal([]) } },
        { provide: RiddleSubmissions, useValue: { submit: vi.fn() } },
        {
          provide: ParticipantStore,
          useValue: {
            canSolve: signal(true),
            participant: signal({ id: 'alice', name: 'Alice' }),
            loading: signal(false),
          },
        },
        {
          provide: GameStore,
          useValue: {
            error: signal(''),
            ready: signal(true),
            mode: signal('team'),
            round,
            riddles,
          },
        },
      ],
    });
  });

  afterEach(() => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(previousStorageKey);
  });

  it('ouvre en aperçu la grille vide et conserve les cases de plusieurs lettres par partie', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apercu-ia/enigmes/meta', MetaPage);
    const page = harness.routeNativeElement!;
    const cells = Array.from(page.querySelectorAll<HTMLInputElement>('app-meta-grid input'));
    expect(cells).toHaveLength(63);
    expect(cells.every((cell) => cell.value === '')).toBe(true);
    expect(cells.every((cell) => cell.maxLength === 3)).toBe(true);
    expect(page.querySelectorAll('.entry.rebus')).toHaveLength(0);
    const previous = page.querySelector<HTMLInputElement>('#meta-cell-115')!;
    const intersection = page.querySelector<HTMLInputElement>('#meta-cell-116')!;
    previous.focus();
    previous.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    expect(document.activeElement).toBe(intersection);
    intersection.value = 'é';
    intersection.dispatchEvent(new Event('input', { bubbles: true }));
    expect(intersection.value).toBe('E');
    expect(document.activeElement).toBe(intersection);
    intersection.value = 'Éxa';
    intersection.dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.activeElement?.id).toBe('meta-cell-117');
    round.set({ id: 'two', resetAt: 2 });
    harness.detectChanges();
    expect(page.querySelector<HTMLInputElement>('#meta-cell-116')?.value).toBe('');
    round.set({ id: 'one', resetAt: 1 });
    harness.detectChanges();
    expect(page.querySelector<HTMLInputElement>('#meta-cell-116')?.value).toBe('EXA');
  });

  it.each([
    ['', 'T'],
    ['T', 'T'],
    ['X', ''],
  ])(
    'replace les lettres d’un ancien brouillon (%s → %s au nouveau croisement)',
    async (other, expected) => {
      const previous = Array<string>(22 * 18).fill('');
      previous[136] = 'ABC';
      previous[221] = 'DE';
      previous[342] = 'FGH';
      previous[317] = 'IJ';
      previous[320] = 'A';
      previous[287] = 'T';
      previous[347] = other;
      localStorage.setItem(previousStorageKey, JSON.stringify(previous));

      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/apercu-ia/enigmes/meta', MetaPage);
      const page = harness.routeNativeElement!;
      const cells = [...page.querySelectorAll<HTMLInputElement>('.board input')];
      expect(cells.map((cell) => cell.value).filter((value) => value.length > 1)).toEqual([
        'ABC',
        'DE',
        'FGH',
        'IJ',
      ]);
      expect(page.querySelector<HTMLInputElement>('#meta-cell-239')?.value).toBe(expected);
      expect(page.querySelector<HTMLInputElement>('#meta-cell-216')?.value).toBe('A');
      expect(page.querySelector<HTMLInputElement>('#meta-cell-268')?.value).toBe('A');

      page.querySelector<HTMLButtonElement>('.clear-grid')!.click();
      round.set({ id: 'two', resetAt: 2 });
      harness.detectChanges();
      round.set({ id: 'one', resetAt: 1 });
      harness.detectChanges();
      expect(
        [...page.querySelectorAll<HTMLInputElement>('.board input')].every((cell) => !cell.value),
      ).toBe(true);
    },
  );

  it('relie les huit phrases aux départs numérotés et les complète avec la saisie', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apercu-ia/enigmes/meta', MetaPage);
    const page = harness.routeNativeElement!;
    expect(page.querySelector('h1')?.textContent).toBe('Hommage à mon père (méta)');
    expect(page.querySelector('.flavor-text')?.textContent).toContain(
      'Rassemblez-vous et prouvez que vous avez bien compris en finissant chaque...',
    );

    const clues = [...page.querySelectorAll<HTMLButtonElement>('.clues button')];
    expect(clues.map((clue) => clue.querySelector('.clue-number')?.textContent)).toEqual([
      '2',
      '6',
      '7',
      '8',
      '1',
      '3',
      '4',
      '5',
    ]);
    const starts = [...page.querySelectorAll('.numbered input')].map((cell) => cell.id);
    expect(starts).toEqual([
      'meta-cell-8',
      'meta-cell-114',
      'meta-cell-162',
      'meta-cell-167',
      'meta-cell-175',
      'meta-cell-184',
      'meta-cell-234',
      'meta-cell-262',
    ]);

    const clue = clues.find((button) => button.querySelector('.clue-number')?.textContent === '5')!;
    const clear = page.querySelector<HTMLButtonElement>('.clear-grid')!;
    expect(clear.disabled).toBe(true);
    expect(clue.querySelector('.clue-ending')?.textContent).toBe('______');
    clue.click();
    expect(document.activeElement?.id).toBe('meta-cell-175');
    const entry = [175, 193, 211, 229, 247, 265].map((index) =>
      page.querySelector<HTMLInputElement>(`#meta-cell-${index}`)!,
    );
    for (const [index, value] of ['A', 'B', 'C', 'D', 'E', 'FG'].entries()) {
      entry[index].value = value;
      entry[index].dispatchEvent(new Event('input', { bubbles: true }));
    }
    harness.detectChanges();
    expect(clue.textContent).toContain('ABCDEFG.');
    expect(clear.disabled).toBe(false);
    entry[0].value = '';
    entry[0].dispatchEvent(new Event('input', { bubbles: true }));
    harness.detectChanges();
    expect(clue.querySelector('.clue-ending')?.textContent).toBe('______');

    clear.click();
    harness.detectChanges();
    expect(
      [...page.querySelectorAll<HTMLInputElement>('.board input')].every((cell) => !cell.value),
    ).toBe(true);
    expect(clear.disabled).toBe(true);
    expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(Array(18 * 16).fill(''));
  });

  it('applique le verrou sur la route publique, même si elle est ouverte directement', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/enigmes/meta', MetaPage);
    const page = harness.routeNativeElement!;
    expect(page.textContent).toContain('Résous les huit énigmes');
    expect(page.querySelector('app-meta-grid')).toBeNull();

    riddles.set(
      Array.from({ length: RIDDLE_COUNT }, (_, index) => ({
        id: `riddle-${index}`,
        solutions: [{ participantId: 'bob' }],
      })),
    );
    harness.detectChanges();
    expect(page.querySelector('app-meta-grid')).not.toBeNull();

    riddles.set([]);
    harness.detectChanges();
    expect(page.querySelector('app-meta-grid')).toBeNull();
  });

  it.each(['2000', '2 000!'])('affiche la réplique du méta pour « %s » seul', async (answer) => {
    const submit = vi.mocked(TestBed.inject(RiddleSubmissions).submit);
    submit.mockResolvedValue(false);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apercu-ia/enigmes/meta', MetaPage);
    const page = harness.routeNativeElement!;
    const input = page.querySelector<HTMLInputElement>('#answer-meta')!;
    input.value = answer;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await harness.fixture.whenStable();
    input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await harness.fixture.whenStable();

    expect(submit).toHaveBeenCalledExactlyOnceWith('meta', answer);
    expect(page.querySelector('#answer-feedback-meta [role="alert"]')?.textContent?.trim()).toBe(
      'Qui 2000?',
    );
    expect(page.querySelector('dialog')?.open).toBe(false);
  });
});
