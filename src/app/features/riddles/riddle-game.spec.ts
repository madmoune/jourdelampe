import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleGame } from './riddle-game';
import { FOURCHETTE_ID, ZEBRA_ID } from './riddle-pages';
import { RIDDLE_PREVIEW } from './riddle-release';

describe('liens du catalogue des énigmes', () => {
  it.each([
    { preview: false, path: '/enigmes/zebra' },
    { preview: true, path: '/apercu-ia/enigmes/zebra' },
  ])('ouvre le bon lien avec le mode aperçu à $preview', async ({ preview, path }) => {
    const catalog = [
      { id: ZEBRA_ID, title: 'Nostalgie', prompt: '', order: 0, solutions: [] },
      { id: FOURCHETTE_ID, title: 'La Fourchette', prompt: '', order: 1, solutions: [] },
    ];
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
            mode: signal('team'),
            catalog: signal(catalog),
            riddles: signal(catalog),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RiddleGame);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const links = page.querySelectorAll<HTMLAnchorElement>('.puzzle-link');
    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe(path);
    expect(links[1].getAttribute('href')).toBe(
      `${preview ? '/apercu-ia' : ''}/enigmes/la-fourchette`,
    );
    expect([...page.querySelectorAll('h3')].map((title) => title.textContent)).toEqual([
      'Nostalgie',
      'La Fourchette',
    ]);
  });
});
