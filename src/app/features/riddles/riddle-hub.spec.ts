import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { GameStore } from './game-store';
import type { Participant } from './participant';
import { ParticipantStore } from './participant-store';
import { RiddleHub } from './riddle-hub';
import { ZEBRA_ID } from './riddle-pages';

describe('page dédiée aux énigmes', () => {
  it('charge le vrai catalogue dans l’aperçu et affiche les dossiers avant l’inscription', async () => {
    const participant = signal<Participant | null>(null);
    const canSolve = signal(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        {
          provide: ParticipantStore,
          useValue: {
            canSolve,
            participant,
            loading: signal(false),
            saving: signal(false),
            error: signal(''),
          },
        },
        {
          provide: GameStore,
          useValue: {
            error: signal(''),
            ready: signal(true),
            mode: signal('team'),
            riddles: signal([
              { id: ZEBRA_ID, title: 'Nostalgie', prompt: '', order: 0, solutions: [] },
            ]),
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apercu-ia/enigmes', RiddleHub);
    const page = harness.routeNativeElement!;
    expect(page.querySelector('h1')?.textContent).toContain('Les énigmes');
    expect(page.querySelector('app-riddle-access form')).not.toBeNull();
    expect(page.querySelectorAll('.riddle')).toHaveLength(8);
    expect(page.querySelector('.puzzle-link')?.getAttribute('href')).toBe('/apercu-ia/enigmes/zebra');
    expect(page.querySelector('.riddle-status')?.textContent).toContain('Non résolue');
    expect(page.querySelector('app-riddle-spoiler')).toBeNull();
    participant.set({ id: 'alice', name: 'Alice', updatedAt: 1 });
    canSolve.set(true);
    harness.detectChanges();
    expect(page.textContent).toContain('Tu joues sous le nom');
    expect(page.textContent).not.toContain('Voir les résultats détaillés');
  });
});
