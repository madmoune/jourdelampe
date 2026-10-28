import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleGame } from './riddle-game';
import { RIDDLE_PREVIEW } from './riddle-release';

describe('liens du catalogue des énigmes', () => {
  it.each([
    { preview: false, path: '/enigmes/zebra' },
    { preview: true, path: '/apercu-ia/enigmes/zebra' },
  ])('ouvre le bon lien avec le mode aperçu à $preview', async ({ preview, path }) => {
    const catalog = [{ id: 'zebra-01', title: 'Zebra', prompt: '', order: 0, solutions: [] }];
    await TestBed.configureTestingModule({
      imports: [RiddleGame],
      providers: [
        provideRouter([]),
        { provide: RIDDLE_PREVIEW, useValue: preview },
        { provide: ParticipantStore, useValue: { participant: signal(null) } },
        {
          provide: GameStore,
          useValue: {
            error: signal(''),
            ready: signal(true),
            catalog: signal(catalog),
            riddles: signal(catalog),
            metaUnlocked: signal(false),
            solvedCount: signal(0),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RiddleGame);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.querySelector('.puzzle-link')?.getAttribute('href')).toBe(path);
  });
});
