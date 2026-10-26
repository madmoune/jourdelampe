import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleGame } from './riddle-game';
import { RiddleSubmissions } from './riddle-submissions';

describe('remise à zéro pendant une réponse', () => {
  async function setup() {
    const round = signal({ id: 'one', resetAt: 1 });
    let confirm!: () => void;
    const submit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          confirm = resolve;
        }),
    );
    await TestBed.configureTestingModule({
      imports: [RiddleGame],
      providers: [
        {
          provide: GameStore,
          useValue: {
            ready: signal(true),
            error: signal(''),
            round,
            catalog: signal([{ id: 'a' }]),
            riddles: signal([{ id: 'a', title: 'Lampe', prompt: '', solutions: [] }]),
            solvedCount: signal(0),
            metaUnlocked: signal(false),
          },
        },
        {
          provide: ParticipantStore,
          useValue: { participant: signal({ id: 'alice', name: 'Alice Roy' }) },
        },
        { provide: RiddleSubmissions, useValue: { submit } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RiddleGame);
    fixture.detectChanges();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const input = page.querySelector<HTMLInputElement>('input')!;
    input.value = 'Lampe';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    return { fixture, page, round, confirm: () => confirm(), input };
  }

  it('retire les anciennes confirmations et les réponses saisies à la nouvelle partie', async () => {
    const { fixture, page, round, confirm, input } = await setup();
    confirm();
    await fixture.whenStable();
    expect(page.textContent).toContain('réponse validée');
    input.value = 'Autre réponse';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    round.set({ id: 'two', resetAt: 2 });
    await fixture.whenStable();
    expect(page.textContent).not.toContain('réponse validée');
    expect(input.value).toBe('');
  });

  it('ignore une confirmation de l’ancienne partie reçue après la réinitialisation', async () => {
    const { fixture, page, round, confirm } = await setup();
    round.set({ id: 'two', resetAt: 2 });
    fixture.detectChanges();
    confirm();
    await fixture.whenStable();
    expect(page.textContent).not.toContain('réponse validée');
    expect(page.querySelector<HTMLInputElement>('input')!.value).toBe('');
  });
});
