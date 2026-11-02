import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GameMode } from './game.model';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleResults } from './riddle-results';

describe('résultats selon le mode du puzzle hunt', () => {
  it('partage les résultats en équipe et limite la vue au joueur courant en individuel', async () => {
    const mode = signal<GameMode>('team');
    const participant = signal({ id: 'alice', name: 'Alice' });
    const riddles = [
      {
        id: 'a',
        title: 'La lampe',
        prompt: '',
        order: 0,
        solutions: [{ participantId: 'bob', participantName: 'Bob', solvedAt: 1 }],
      },
    ];
    await TestBed.configureTestingModule({
      imports: [RiddleResults],
      providers: [
        { provide: ParticipantStore, useValue: { participant } },
        {
          provide: GameStore,
          useValue: {
            ready: signal(true),
            error: signal(''),
            mode,
            catalog: signal(riddles),
            riddles: signal(riddles),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RiddleResults);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Bob');
    expect(page.textContent).toContain('Méta déverrouillé.');
    expect(page.textContent).toContain('par l’équipe');
    mode.set('individual');
    await fixture.whenStable();
    expect(page.textContent).not.toContain('Bob');
    expect(page.textContent).toContain('Non résolue');
    expect(page.textContent).toContain('Méta verrouillé.');
    expect(page.textContent).toContain('par toi');
    participant.set({ id: 'bob', name: 'Bob' });
    await fixture.whenStable();
    expect(page.textContent).toContain('Bob');
    expect(page.textContent).toContain('Méta déverrouillé.');
  });
});
