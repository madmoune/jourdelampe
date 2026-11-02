import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleAnswer } from './riddle-answer';
import { RiddleAttempt, RiddleAttempts } from './riddle-attempts';
import { RiddleSubmissions } from './riddle-submissions';

describe('réponse finale sans historique et fenêtre de succès', () => {
  afterEach(() => localStorage.clear());

  async function setup(solved = false) {
    const round = signal({ id: 'one', resetAt: 1 });
    let confirm!: (correct: boolean) => void;
    const submit = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          confirm = resolve;
        }),
    );
    const attempts = signal<readonly RiddleAttempt[]>([]);
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
      imports: [RiddleAnswer],
      providers: [
        provideRouter([]),
        {
          provide: GameStore,
          useValue: {
            ready: signal(true),
            error: signal(''),
            round,
            riddles: signal([
              {
                id: 'a',
                title: 'Lampe',
                solutions: solved ? [{ participantId: 'alice' }] : [],
              },
            ]),
          },
        },
        {
          provide: ParticipantStore,
          useValue: { participant: signal({ id: 'alice', name: 'Alice Roy' }) },
        },
        { provide: RiddleSubmissions, useValue: { submit } },
        { provide: RiddleAttempts, useValue: { attempts } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RiddleAnswer);
    fixture.componentRef.setInput('riddleId', 'a');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const input = page.querySelector<HTMLInputElement>('input')!;
    const send = async () => {
      input.value = 'Lampe';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
      page
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    };
    return {
      fixture,
      page,
      round,
      attempts,
      confirm: (correct: boolean) => confirm(correct),
      input,
      send,
    };
  }
  it('ne charge ni n’affiche les réponses précédentes pour le joueur', async () => {
    const { page } = await setup();
    expect(page.querySelector('.history')).toBeNull();
    expect(page.textContent).not.toContain('Tes réponses précédentes');
    expect(page.querySelector('input[name="answer"]')).not.toBeNull();
  });
  it('ouvre le popup uniquement après confirmation d’une bonne réponse et propose le retour aux énigmes', async () => {
    const { fixture, page, send, confirm } = await setup();
    await send();
    expect(page.querySelector('dialog')!.open).toBe(false);
    confirm(true);
    await fixture.whenStable();
    expect(page.querySelector('dialog')!.open).toBe(true);
    expect(page.querySelector('dialog a')?.getAttribute('href')).toBe('/#enigmes');
    expect(page.querySelector('dialog h2')?.textContent).toContain('Alice Roy');
    expect(localStorage.getItem('jdl-riddle-answer-v1:a:alice:one')).toBe('Lampe');
  });

  it('réaffiche la réponse validée en lecture seule quand l’énigme est déjà résolue', async () => {
    localStorage.setItem('jdl-riddle-answer-v1:a:alice:one', 'Lampe');
    const { page } = await setup(true);
    const answer = page.querySelector<HTMLInputElement>('input[readonly]');
    expect(answer?.value).toBe('Lampe');
    expect(answer?.readOnly).toBe(true);
    expect(page.querySelector('form')).toBeNull();
    expect(page.textContent).toContain('Énigme résolue');
  });

  it('récupère la réponse validée conservée par Firebase après une ancienne résolution', async () => {
    const { fixture, page, attempts } = await setup(true);
    attempts.set([
      {
        id: 'attempt-1',
        riddleId: 'a',
        participantName: 'Alice Roy',
        kind: 'answer',
        answer: 'Lampe',
        correct: true,
        roundId: 'one',
        submittedAt: 1,
      },
    ]);
    await fixture.whenStable();
    expect(page.querySelector<HTMLInputElement>('input[readonly]')?.value).toBe('Lampe');
  });
  it('ne montre pas le popup pour une réponse incorrecte', async () => {
    const { fixture, page, send, confirm } = await setup();
    await send();
    confirm(false);
    await fixture.whenStable();
    expect(page.querySelector('dialog')!.open).toBe(false);
    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'ce n’est pas la bonne réponse',
    );
  });
  it('change de réplique à chaque mauvaise réponse en conservant le nom du joueur', async () => {
    const { fixture, page, send, confirm } = await setup();
    await send();
    confirm(false);
    await fixture.whenStable();
    const first = page.querySelector('[role="alert"]')!.textContent;
    await send();
    confirm(false);
    await fixture.whenStable();
    const second = page.querySelector('[role="alert"]')!.textContent;
    expect(second).not.toBe(first);
    expect(first).toContain('Alice Roy');
    expect(second).toContain('Alice Roy');
    expect(page.querySelector('dialog')!.open).toBe(false);
  });
  it('ignore une confirmation reçue après une remise à zéro', async () => {
    const { fixture, page, round, send, confirm, input } = await setup();
    await send();
    round.set({ id: 'two', resetAt: 2 });
    fixture.detectChanges();
    confirm(true);
    await fixture.whenStable();
    expect(page.querySelector('dialog')!.open).toBe(false);
    expect(page.textContent).not.toContain('réponse validée');
    expect(input.value).toBe('');
  });
});
