import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from './game-store';
import { GameMode, GameRiddle, RiddleSolution } from './game.model';
import { ParticipantStore } from './participant-store';
import { RiddleGame } from './riddle-game';
import { FOURCHETTE_ID, MATCHMAKER_ID, META_ID, RIDDLE_COUNT, ZEBRA_ID } from './riddle-pages';
import { RIDDLE_PREVIEW } from './riddle-release';

describe('liens du catalogue des énigmes', () => {
  it.each([
    { preview: false, path: '/enigmes/zebra' },
    { preview: true, path: '/apercu-ia/enigmes/zebra' },
  ])('ouvre le bon lien avec le mode aperçu à $preview', async ({ preview, path }) => {
    const catalog = [
      { id: ZEBRA_ID, title: 'Nostalgie', prompt: '', order: 0, solutions: [] },
      { id: FOURCHETTE_ID, title: 'La Fourchette', prompt: '', order: 1, solutions: [] },
      { id: MATCHMAKER_ID, title: 'Le début de la fin', prompt: '', order: 2, solutions: [] },
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
            round: signal(null),
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
    expect(links).toHaveLength(3);
    expect(links[0].getAttribute('href')).toBe(path);
    expect(links[1].getAttribute('href')).toBe(
      `${preview ? '/apercu-ia' : ''}/enigmes/la-fourchette`,
    );
    expect(links[2].getAttribute('href')).toBe(
      `${preview ? '/apercu-ia' : ''}/enigmes/le-debut-de-la-fin`,
    );
    expect(page.querySelectorAll('.riddle')).toHaveLength(8);
    expect(
      [...page.querySelectorAll('.riddle h3')].slice(0, 3).map((title) => title.textContent),
    ).toEqual(['Nostalgie', 'La Fourchette', 'Le début de la fin']);
    expect(page.querySelector('.riddle:last-child')?.textContent).toContain('À venir');
    expect(page.querySelector('.meta-status')?.textContent).toContain('Verrouillé');
  });

  it('garde le méta séparé et ne montre son énoncé qu’après la huitième réussite', async () => {
    const buildRiddles = (solvedCount: number) =>
      Array.from({ length: RIDDLE_COUNT + 1 }, (_, index) => ({
        id: index === RIDDLE_COUNT ? META_ID : `riddle-${index}`,
        title: `Dossier ${index + 1}`,
        prompt: index === RIDDLE_COUNT ? 'Énoncé du méta' : '',
        order: index,
        solutions: index < solvedCount ? [{ participantId: 'alice' }] : [],
      }));
    const riddles = signal(buildRiddles(RIDDLE_COUNT - 1));
    TestBed.configureTestingModule({
      imports: [RiddleGame],
      providers: [
        provideRouter([]),
        { provide: ParticipantStore, useValue: { participant: signal(null) } },
        {
          provide: GameStore,
          useValue: {
            error: signal(''),
            ready: signal(true),
            mode: signal('team'),
            riddles,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(RiddleGame);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelectorAll('.riddle')).toHaveLength(RIDDLE_COUNT);
    expect(page.querySelector('.meta-status')?.textContent).toContain('Verrouillé');
    expect(page.textContent).not.toContain('Énoncé du méta');
    riddles.set(buildRiddles(RIDDLE_COUNT));
    await fixture.whenStable();
    expect(page.querySelector('.meta-status')?.textContent).toContain('Déverrouillé');
    expect(page.querySelector('.meta-status')?.textContent).toContain('Énoncé du méta');
  });

  it('ne charge la réponse qu’au clic et la remasque si le joueur change de mode', async () => {
    const riddle: GameRiddle & { solutions: RiddleSolution[] } = {
      id: ZEBRA_ID,
      title: 'Nostalgie',
      prompt: '',
      order: 0,
      solutions: [
        {
          participantId: 'bob',
          participantName: 'Bob',
          riddleId: ZEBRA_ID,
          riddleTitle: 'Nostalgie',
          roundId: 'one',
          solvedAt: 1,
        },
      ],
    };
    const mode = signal<GameMode>('team');
    const read = vi.fn().mockResolvedValue('Réponse de test');
    TestBed.configureTestingModule({
      imports: [RiddleGame],
      providers: [
        provideRouter([]),
        { provide: FirebaseRest, useValue: { read } },
        { provide: AnonymousSession, useValue: { token: vi.fn().mockResolvedValue('test-token') } },
        {
          provide: ParticipantStore,
          useValue: { participant: signal({ id: 'alice', name: 'Alice', updatedAt: 1 }) },
        },
        {
          provide: GameStore,
          useValue: {
            error: signal(''),
            ready: signal(true),
            round: signal({ id: 'one', resetAt: 1 }),
            mode,
            riddles: signal([riddle]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(RiddleGame);
    fixture.componentRef.setInput('canPlay', true);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    const card = page.querySelector('.riddle')!;
    const reveal = card.querySelector<HTMLButtonElement>('app-riddle-spoiler button')!;
    expect(card.textContent).toContain('Résolue par l’équipe');
    const results = card.querySelector('app-riddle-results');
    expect(results?.querySelector('strong')?.textContent).toBe('Bob');
    expect(results?.querySelector('time')?.getAttribute('datetime')).toBe('1970-01-01T00:00:00.001Z');
    expect(card.textContent).not.toContain('Réponse de test');
    expect(reveal.getAttribute('aria-expanded')).toBe('false');
    expect(read).not.toHaveBeenCalled();

    reveal.click();
    await fixture.whenStable();
    expect(read).toHaveBeenCalledExactlyOnceWith(`riddleSecrets/${ZEBRA_ID}/answer`, 'test-token');
    expect(card.textContent).toContain('Réponse de test');
    expect(reveal.getAttribute('aria-expanded')).toBe('true');

    reveal.click();
    await fixture.whenStable();
    expect(card.textContent).not.toContain('Réponse de test');
    reveal.click();
    await fixture.whenStable();
    mode.set('individual');
    await fixture.whenStable();
    expect(card.textContent).toContain('Non résolue');
    expect(card.querySelector('app-riddle-results')).toBeNull();
    expect(card.textContent).not.toContain('Réponse de test');
    expect(card.querySelector('app-riddle-spoiler')).toBeNull();
  });
});
