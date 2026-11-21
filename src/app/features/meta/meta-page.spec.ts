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
  const storageKey = 'jdl-meta-v1:alice:one';

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

  afterEach(() => localStorage.removeItem(storageKey));

  it('ouvre en aperçu la grille vide et conserve les cases de plusieurs lettres par partie', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apercu-ia/enigmes/meta', MetaPage);
    const page = harness.routeNativeElement!;
    const cells = Array.from(page.querySelectorAll<HTMLInputElement>('app-meta-grid input'));
    expect(cells).toHaveLength(63);
    expect(cells.every((cell) => cell.value === '')).toBe(true);
    expect(cells.every((cell) => cell.maxLength === 3)).toBe(true);
    expect(page.querySelectorAll('.entry.rebus')).toHaveLength(0);
    const previous = page.querySelector<HTMLInputElement>('#meta-cell-135')!;
    const intersection = page.querySelector<HTMLInputElement>('#meta-cell-136')!;
    previous.focus();
    previous.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true }));
    expect(document.activeElement).toBe(intersection);
    intersection.value = 'é';
    intersection.dispatchEvent(new Event('input', { bubbles: true }));
    expect(intersection.value).toBe('E');
    expect(document.activeElement).toBe(intersection);
    intersection.value = 'Éxa';
    intersection.dispatchEvent(new Event('input', { bubbles: true }));
    expect(document.activeElement?.id).toBe('meta-cell-137');
    round.set({ id: 'two', resetAt: 2 });
    harness.detectChanges();
    expect(page.querySelector<HTMLInputElement>('#meta-cell-136')?.value).toBe('');
    round.set({ id: 'one', resetAt: 1 });
    harness.detectChanges();
    expect(page.querySelector<HTMLInputElement>('#meta-cell-136')?.value).toBe('EXA');
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
});
