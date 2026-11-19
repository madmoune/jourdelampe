import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { GameStore } from './game-store';
import type { Participant } from './participant';
import { ParticipantStore } from './participant-store';
import { RiddleAttempts } from './riddle-attempts';
import { RiddleHub } from './riddle-hub';
import { ZEBRA_ID } from './riddle-pages';
import { RiddleSubmissions } from './riddle-submissions';

describe('page dédiée aux énigmes', () => {
  it('charge le vrai catalogue dans l’aperçu et affiche les dossiers avant l’inscription', async () => {
    const participant = signal<Participant | null>(null);
    const canSolve = signal(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: RiddleAttempts, useValue: { attempts: signal([]) } },
        { provide: RiddleSubmissions, useValue: { submit: vi.fn() } },
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
            round: signal(null),
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
    const fourth = page.querySelectorAll('.riddle')[3];
    expect(fourth.querySelector('h3')?.textContent).toBe('La porcherie');
    expect(fourth.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/la-porcherie',
    );
    const fifth = page.querySelectorAll('.riddle')[4];
    expect(fifth.querySelector('h3')?.textContent).toBe('La vigie');
    expect(fifth.querySelector('.puzzle-link')?.getAttribute('href')).toBe('/apercu-ia/enigmes/la-vigie');
    const sixth = page.querySelectorAll('.riddle')[5];
    expect(sixth.querySelector('h3')?.textContent).toBe('En manchettes');
    expect(sixth.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/en-manchettes',
    );
    const seventh = page.querySelectorAll('.riddle')[6];
    expect(seventh.querySelector('h3')?.textContent).toBe('Salle d’arcade');
    expect(seventh.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/salle-arcade',
    );
    expect(page.querySelector('.progress')?.textContent).toContain('0 / 8');
    expect(page.querySelector('.riddle-status')?.textContent).toContain('Non résolue');
    expect(page.querySelector('app-riddle-spoiler')).toBeNull();
    participant.set({ id: 'alice', name: 'Alice', updatedAt: 1 });
    canSolve.set(true);
    harness.detectChanges();
    expect(page.textContent).toContain('Tu joues sous le nom');
    expect(page.textContent).not.toContain('Voir les résultats détaillés');
    await harness.navigateByUrl('/apercu-ia/enigmes/la-porcherie');
    expect(harness.routeNativeElement?.querySelectorAll('app-pigpen-play .pen')).toHaveLength(7);
    await harness.navigateByUrl('/apercu-ia/enigmes/la-vigie');
    expect(harness.routeNativeElement?.querySelectorAll('app-sudoku-play table input')).toHaveLength(81);
    await harness.navigateByUrl('/apercu-ia/enigmes/en-manchettes');
    expect(harness.routeNativeElement?.querySelectorAll('app-manchettes-play .mine-square')).toHaveLength(504);
    await harness.navigateByUrl('/apercu-ia/enigmes/salle-arcade');
    expect(harness.routeNativeElement?.querySelectorAll('app-arcade-room .cabinets button')).toHaveLength(4);
  });
});
