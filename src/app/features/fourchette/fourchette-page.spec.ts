import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { RiddleAttempt, RiddleAttempts } from '../riddles/riddle-attempts';
import { FOURCHETTE_ID, ZEBRA_ID } from '../riddles/riddle-pages';
import { RIDDLE_PREVIEW } from '../riddles/riddle-release';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { FourchettePage } from './fourchette-page';

describe('La Fourchette et le gabarit commun des énigmes', () => {
  afterEach(() => localStorage.clear());

  async function setup(preview = false, registered = true) {
    const solved = signal(false);
    const attempts = signal<readonly RiddleAttempt[]>([]);
    const submit = vi.fn().mockResolvedValue(true);
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = true;
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false;
      },
    });
    await TestBed.configureTestingModule({
      imports: [FourchettePage],
      providers: [
        provideRouter([]),
        { provide: RIDDLE_PREVIEW, useValue: preview },
        {
          provide: ParticipantStore,
          useValue: {
            loading: signal(false),
            canSolve: signal(registered),
            error: signal(''),
            participant: signal(registered ? { id: 'alice', name: 'Alice Roy' } : null),
          },
        },
        {
          provide: GameStore,
          useValue: {
            ready: signal(true),
            error: signal(''),
            round: signal({ id: 'one', resetAt: 1 }),
            riddles: computed(() => [
              { id: ZEBRA_ID, solutions: [{ participantId: 'alice' }] },
              { id: FOURCHETTE_ID, solutions: solved() ? [{ participantId: 'alice' }] : [] },
            ]),
          },
        },
        { provide: RiddleAttempts, useValue: { attempts } },
        { provide: RiddleSubmissions, useValue: { submit } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(FourchettePage);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement, solved, attempts, submit };
  }

  it('exige le profil du portail avant de présenter le formulaire et le contenu', async () => {
    const { page } = await setup(false, false);
    expect(page.querySelector('h1')?.textContent).toContain('La Fourchette');
    expect(page.querySelector('input')).toBeNull();
    expect(page.querySelector('.wordsearch')).toBeNull();
    expect(page.querySelector('.access-notice a')?.getAttribute('href')).toBe('/#enigmes');
  });

  it.each([false, true])(
    'conserve la présentation, la validation et le retour au portail (aperçu : %s)',
    async (preview) => {
      const { fixture, page, submit, solved } = await setup(preview);
      const title = page.querySelector('h1')!;
      const flavor = page.querySelector('.flavor-text')!;
      const input = page.querySelector<HTMLInputElement>('input[name="answer"]')!;
      const puzzle = page.querySelector('.wordsearch')!;
      expect(title.compareDocumentPosition(flavor) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(flavor.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(input.compareDocumentPosition(puzzle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(page.querySelector('label')?.textContent).toBe('Réponse (12 lettres)');
      expect(flavor.textContent).toBe(
        'On ne doit jamais faire cavalier seul, sauf si on est solide comme le roque (ou un personnage de Pokemon).',
      );
      expect(page.querySelector('.answer-section')?.textContent).not.toContain('Énigme résolue');
      expect(input.disabled).toBe(false);
      input.value = 'Réponse de test';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      page
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await fixture.whenStable();
      expect(submit).toHaveBeenCalledWith(FOURCHETTE_ID, 'Réponse de test');
      expect(page.querySelector('dialog')?.open).toBe(true);
      const portal = `${preview ? '/apercu-ia' : '/'}#enigmes`;
      expect(page.querySelector('dialog a')?.getAttribute('href')).toBe(portal);
      expect(page.querySelector('header a')?.getAttribute('href')).toBe(portal);
      solved.set(true);
      await fixture.whenStable();
      expect(page.querySelector('.answer-section > .success')?.textContent).toBe('Énigme résolue');
      expect(page.querySelector<HTMLInputElement>('input[readonly]')?.value).toBe(
        'Réponse de test',
      );
      expect(page.querySelector('form')).toBeNull();
    },
  );

  it('restaure la bonne réponse de cette énigme depuis les essais privés', async () => {
    const { fixture, page, solved, attempts } = await setup();
    solved.set(true);
    attempts.set([
      {
        id: 'other',
        riddleId: ZEBRA_ID,
        kind: 'answer',
        answer: 'Autre réponse',
        correct: true,
        participantName: 'Alice Roy',
        roundId: 'one',
        submittedAt: 3,
      },
      {
        id: 'wrong',
        riddleId: FOURCHETTE_ID,
        kind: 'answer',
        answer: 'Essai incorrect',
        correct: false,
        participantName: 'Alice Roy',
        roundId: 'one',
        submittedAt: 2,
      },
      {
        id: 'right',
        riddleId: FOURCHETTE_ID,
        kind: 'answer',
        answer: 'Bonne réponse',
        correct: true,
        participantName: 'Alice Roy',
        roundId: 'one',
        submittedAt: 1,
      },
    ]);
    await fixture.whenStable();
    const answer = page.querySelector<HTMLInputElement>('input[readonly]');
    expect(answer?.value).toBe('Bonne réponse');
    expect(answer?.readOnly).toBe(true);
    expect(page.textContent).not.toContain('Essai incorrect');
  });
});
