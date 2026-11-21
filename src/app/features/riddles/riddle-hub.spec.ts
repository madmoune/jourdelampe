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
              { id: ZEBRA_ID, title: 'Zebra Pretzel', prompt: '', order: 0, solutions: [] },
            ]),
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/apercu-ia/enigmes', RiddleHub);
    const page = harness.routeNativeElement!;
    expect(page.querySelector('h1')?.textContent).toContain('Puzzle Hunt');
    expect(page.textContent).toContain(
      'Je ne laisserai pas la tâche de mon père inachevée. Si vous voulez sauver votre party et le monde, résolvez ces énigmes!',
    );
    expect(page.textContent).toContain(
      'J’ai confiance en vous. Je suis sûre que vous n’aurez pas l’air de très gros cons.',
    );
    const cheatsheet = page.querySelector<HTMLAnchorElement>('.cheatsheet-link')!;
    expect(cheatsheet.pathname).toBe('/cheatsheet');
    expect(new URLSearchParams(cheatsheet.search).get('retour')).toBe('/apercu-ia/enigmes');
    expect(page.querySelector('.cheatsheet-banner h2')?.textContent).toContain('Cheatsheet');
    expect(page.querySelector('.cheatsheet-banner')?.textContent).toContain(
      'Astuces, règles de jeu et codes pour résoudre les énigmes.',
    );
    expect(
      page.querySelector('.puzzle-play > app-riddle-access + .cheatsheet-banner'),
    ).not.toBeNull();
    expect(page.querySelector('app-riddle-access form')).not.toBeNull();
    expect(page.querySelectorAll('.riddle')).toHaveLength(9);
    expect(page.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/zebra',
    );
    const fourth = page.querySelectorAll('.riddle')[3];
    expect(fourth.querySelector('h3')?.textContent).toBe('La porcherie');
    expect(fourth.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/la-porcherie',
    );
    const fifth = page.querySelectorAll('.riddle')[4];
    expect(fifth.querySelector('h3')?.textContent).toBe('Sudoquoi?');
    expect(fifth.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/la-vigie',
    );
    const sixth = page.querySelectorAll('.riddle')[5];
    expect(sixth.querySelector('h3')?.textContent).toBe(
      'Crossword Démineur (ne jamais oublier le word)',
    );
    expect(sixth.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/en-manchettes',
    );
    const seventh = page.querySelectorAll('.riddle')[6];
    expect(seventh.querySelector('h3')?.textContent).toBe('Arcade');
    expect(seventh.querySelector('.puzzle-link')?.getAttribute('href')).toBe(
      '/apercu-ia/enigmes/salle-arcade',
    );
    expect(page.querySelector('#dossiers-title')?.textContent).toBe('Les énigmes');
    expect(page.querySelector('.reveal-help')).toBeNull();
    expect(page.querySelector('.progress')).toBeNull();
    expect(page.querySelector('.riddle .file-label')).toBeNull();
    expect(page.querySelector('.meta-status .file-label')).toBeNull();
    expect(page.querySelector('.riddle-grid > .meta-status')).not.toBeNull();
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
    expect(
      harness.routeNativeElement?.querySelectorAll('app-sudoku-play table input'),
    ).toHaveLength(81);
    await harness.navigateByUrl('/apercu-ia/enigmes/en-manchettes');
    expect(
      harness.routeNativeElement?.querySelectorAll('app-manchettes-play .mine-square'),
    ).toHaveLength(504);
    await harness.navigateByUrl('/apercu-ia/enigmes/salle-arcade');
    expect(
      harness.routeNativeElement?.querySelectorAll('app-arcade-room .cabinets button'),
    ).toHaveLength(4);
    await harness.navigateByUrl('/apercu-ia/enigmes/sens-dessus-dessous');
    const eighth = harness.routeNativeElement!;
    const title = eighth.querySelector('h1')?.textContent ?? '';
    const flavor = eighth.querySelector('.flavor-text')?.textContent ?? '';
    const baseTitle = 'Sens Dessus Dessous';
    const letters = (text: string) => text.toLowerCase().replace(/[^a-z]/g, '');
    expect(title).toBe(`${baseTitle} (in english!)`);
    expect(letters(flavor)).not.toBe(letters(baseTitle));
    expect([...letters(flavor)].sort()).toEqual([...letters(baseTitle)].sort());

    expect([...eighth.querySelectorAll('.phrase-list li')].map((row) => row.textContent)).toEqual([
      'MY RICE JAR',
      'CAN I DRAG YA',
      'MERMAN OF ANGER',
      'A PERIODICAL DONOR',
      'BIG MELONS',
      'BESTIAL JUROR',
      'A SEVERE NUKE',
    ]);
    const titleGroups = [...eighth.querySelectorAll('.title-group')];
    expect(titleGroups.map((group) => group.children.length)).toEqual([4, 4, 3, 5, 3, 3, 5]);
    const firstTitles = titleGroups.map((group) => group.firstElementChild?.textContent ?? '');
    expect(firstTitles).toEqual(
      [...firstTitles].sort((left, right) => left.localeCompare(right, 'en')),
    );
    expect(eighth.querySelector('.title-group strong')).toBeNull();
  });
});
