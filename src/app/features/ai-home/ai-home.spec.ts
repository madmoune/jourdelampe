import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Home } from '../home/home';
import { LampTitle } from '../home/lamp-title/lamp-title';
import { TitleLights } from '../home/lamp-title/title-lights';
import { AiHome } from './ai-home';
import { AiTakeover } from './ai-takeover';
import { ParticipantStore } from '../riddles/participant-store';
import { Participant } from '../riddles/participant';
import { GameStore } from '../riddles/game-store';
import { RiddleSubmissions } from '../riddles/riddle-submissions';
import { RIDDLE_PREVIEW } from '../riddles/riddle-release';
import { AiQuoteRotation } from './ai-quote-rotation';

@Component({
  selector: 'app-home',
  imports: [LampTitle],
  template: '<app-lamp-title /><p>Le Jour de Lampe original</p>',
})
class OriginalHomeStub {}

describe('prise de contrôle de l’AI', () => {
  let fixture: ComponentFixture<AiHome>;
  let page: HTMLElement;
  let reducedMotion: boolean;
  let participant: WritableSignal<Participant | null>;
  let accessReady: WritableSignal<boolean>;
  const obsoleteStorageKey = 'jour-de-l-ai:takeover-seen';

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-31T23:59:58-05:00'));
    reducedMotion = false;
    participant = signal<Participant | null>(null);
    accessReady = signal(false);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: reducedMotion })),
    );
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    window.sessionStorage.removeItem(obsoleteStorageKey);
    await TestBed.configureTestingModule({
      imports: [AiHome],
      providers: [
        provideRouter([]),
        {
          provide: GameStore,
          useValue: {
            catalog: signal([]),
            riddles: signal([]),
            ready: signal(true),
            error: signal(''),
            solvedCount: signal(0),
            metaUnlocked: signal(false),
            round: signal(null),
          },
        },
        { provide: RiddleSubmissions, useValue: { submit: vi.fn() } },
        {
          provide: ParticipantStore,
          useValue: {
            participant,
            loading: signal(false),
            saving: signal(false),
            error: signal(''),
            canSolve: accessReady,
          },
        },
      ],
    })
      .overrideComponent(AiTakeover, {
        remove: { imports: [Home] },
        add: { imports: [OriginalHomeStub] },
      })
      .compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    window.sessionStorage.removeItem(obsoleteStorageKey);
  });

  function createPage(): void {
    fixture = TestBed.createComponent(AiHome);
    fixture.detectChanges();
    page = fixture.nativeElement;
  }

  function toggleLetter(index: number): void {
    page.querySelectorAll<HTMLButtonElement>('.letter-lamp')[index].click();
    fixture.detectChanges();
  }

  function solveLights(): void {
    for (const index of [1, 3, 4, 6, 7, 10, 11, 12]) toggleLetter(index);
  }

  function skipIntro(): void {
    page.querySelector<HTMLButtonElement>('.skip-intro')!.click();
    fixture.detectChanges();
  }

  function revealAi(): void {
    solveLights();
    skipIntro();
  }

  it('garde l’accueil original interactif sans démarrage automatique ni bouton de contournement', () => {
    window.sessionStorage.setItem(obsoleteStorageKey, '1');
    createPage();
    vi.advanceTimersByTime(60_000);
    fixture.detectChanges();
    expect(page.textContent).toContain('Le Jour de Lampe original');
    expect(page.querySelector('.original-site')?.hasAttribute('inert')).toBe(false);
    expect(page.querySelector('.original-site')?.getAttribute('aria-hidden')).toBeNull();
    expect(page.querySelector('.skip-intro')).toBeNull();
    expect(page.querySelector('#ai-title')).toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Le JouR de LAmpe — 2027');
  });

  it('déclenche l’animation quand seules les majuscules de « Le JouR de LAmpe » sont allumées', () => {
    createPage();
    for (const index of [1, 3, 4, 6, 7, 10, 11]) {
      toggleLetter(index);
      expect(page.querySelector('.takeover-terminal')).toBeNull();
    }
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(page.querySelector('#ai-title')).toBeNull();

    toggleLetter(12);
    expect(TestBed.inject(TitleLights).pattern()).toBe('1010010011000');
    expect(page.textContent).toContain('Là, c’est moi qui décide.');
    expect(page.querySelector('.original-site')?.hasAttribute('inert')).toBe(true);
    vi.advanceTimersByTime(3600);
    fixture.detectChanges();
    expect(page.querySelector('#ai-title')?.textContent).toBe('LE JOUR DE L’AI');
    expect(page.querySelector('.original-site')).toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Le Jour de l’AI — Votre party est en sursis');
    expect(window.sessionStorage.getItem(obsoleteStorageKey)).toBeNull();
  });

  it.each([0, 2, 5, 8, 9])(
    'exige aussi que la majuscule à la position %i soit allumée',
    (index) => {
      createPage();
      toggleLetter(index);
      solveLights();
      expect(page.querySelector('.takeover-terminal')).toBeNull();
      toggleLetter(index);
      expect(page.querySelector('.takeover-terminal')).not.toBeNull();
    },
  );

  it('ne se déclenche plus avec l’ancienne combinaison du mot LAMPE éteint', () => {
    createPage();
    for (const index of [8, 9, 10, 11, 12]) toggleLetter(index);
    expect(TestBed.inject(TitleLights).pattern()).toBe('1111111100000');
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(page.querySelector('.takeover-terminal')).toBeNull();
    expect(page.querySelector('#ai-title')).toBeNull();
  });

  it('retrouve le portail sans rejouer l’intrusion après une navigation interne', () => {
    createPage();
    revealAi();
    fixture.destroy();
    createPage();
    expect(page.querySelector('#ai-title')).not.toBeNull();
    expect(page.querySelector('.takeover-terminal')).toBeNull();
  });

  it('exige aussi que toutes les minuscules soient éteintes, quel que soit l’ordre des clics', () => {
    createPage();
    for (const index of [11, 7, 1, 10, 4, 12, 6]) toggleLetter(index);
    toggleLetter(1);
    toggleLetter(3);
    expect(page.querySelector('.takeover-terminal')).toBeNull();
    toggleLetter(1);
    expect(page.querySelector('.takeover-terminal')).not.toBeNull();
  });

  it('permet de passer l’animation après le déclenchement, de la rejouer et annule ses anciens délais', () => {
    createPage();
    revealAi();
    page.querySelector<HTMLButtonElement>('.replay-button')!.click();
    fixture.detectChanges();
    expect(page.querySelector('.takeover-terminal')).not.toBeNull();
    skipIntro();
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(page.querySelector('#ai-title')).not.toBeNull();
    expect(page.querySelector('.takeover-terminal')).toBeNull();
  });

  it('attend aussi la combinaison avec la réduction des animations puis révèle directement l’AI', () => {
    reducedMotion = true;
    createPage();
    expect(page.querySelector('.original-site')).not.toBeNull();
    expect(page.querySelector('#ai-title')).toBeNull();
    solveLights();
    expect(page.querySelector('.original-site')).toBeNull();
    expect(page.querySelector('.takeover-terminal')).toBeNull();
    expect(page.querySelector('#ai-title')).not.toBeNull();
  });

  it('fonctionne sans accès au stockage du navigateur', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Stockage bloqué', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Stockage bloqué', 'SecurityError');
    });
    createPage();
    expect(page.querySelector('.skip-intro')).toBeNull();
    expect(() => revealAi()).not.toThrow();
    expect(page.querySelector('#ai-title')).not.toBeNull();
  });

  it('décompte jusqu’à minuit à Montréal et termine sans durée négative', () => {
    createPage();
    revealAi();
    const values = () =>
      [...page.querySelectorAll('.digital-number')].map((node) => node.textContent);
    expect(values()).toEqual(['00', '00', '00', '02']);
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(values()).toEqual(['00', '00', '00', '01']);
    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(page.querySelector('.midnight-message')?.textContent).toContain('MINUIT.');
    expect(page.querySelector('[role="timer"]')).toBeNull();
  });

  it('laisse les énigmes et résultats en attente et relie chaque rubrique à sa section', () => {
    createPage();
    revealAi();
    expect(page.querySelector('#enigmes')?.textContent).toContain('Mes énigmes s’en viennent.');
    expect(page.querySelector('#resultats')?.textContent).toContain(
      'Aucun résultat pour l’instant.',
    );
    expect(page.querySelector('app-riddle-access form')).not.toBeNull();
    expect(page.querySelector('input[name="playerName"]')).not.toBeNull();
    expect(page.querySelector('.riddles-ready')).toBeNull();
    for (const link of page.querySelectorAll<HTMLAnchorElement>('a[href*="#"]')) {
      expect(page.querySelector(link.hash)).not.toBeNull();
    }
    const pause = [...page.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Mettre les animations en pause'),
    )!;
    pause.click();
    fixture.detectChanges();
    expect(pause.getAttribute('aria-pressed')).toBe('true');
    expect(page.querySelector('.ai-world')?.classList.contains('motion-paused')).toBe(true);
  });

  it('cache les énigmes, le profil, les résultats et leurs annonces avant le 31 décembre à 17 h', () => {
    vi.setSystemTime(new Date('2026-12-31T16:59:00-05:00'));
    TestBed.overrideProvider(GameStore, {
      useFactory: () => {
        throw new Error('Le catalogue ne doit pas être chargé avant l’ouverture.');
      },
    });
    createPage();
    revealAi();
    expect(page.querySelector('#ai-title')).not.toBeNull();
    const reprieve = page.querySelector('#party-reprieve');
    expect(reprieve?.textContent).toContain('Votre party n’est pas encore perdu.');
    expect(reprieve?.textContent).toContain('Le 31 décembre au soir');
    expect(reprieve?.textContent).toContain('une chance de le sauver');
    expect(reprieve?.textContent).toContain('dès 17 h');
    expect(page.querySelector('#enigmes')).toBeNull();
    expect(page.querySelector('#resultats')).toBeNull();
    expect(page.querySelector('app-riddle-access')).toBeNull();
    expect(page.querySelector('a[href$="#enigmes"]')).toBeNull();
    expect(page.querySelector('a[href$="#resultats"]')).toBeNull();
    const rotation = fixture.debugElement.injector.get(AiQuoteRotation);
    for (let index = 0; index < 10; index++) {
      expect(page.textContent).not.toMatch(
        /énigm|résou|résol|bonnes réponses|meilleures réponses|examen|du devoir|les devoirs/i,
      );
      page.querySelector<HTMLButtonElement>('.provoke-button')!.click();
      rotation.advance();
      fixture.detectChanges();
    }
  });

  it('révèle automatiquement les sections à 17 h à Montréal sans recharger la page', () => {
    vi.setSystemTime(new Date('2026-12-31T16:59:59-05:00'));
    reducedMotion = true;
    createPage();
    solveLights();
    expect(page.querySelector('#party-reprieve')).not.toBeNull();
    expect(page.querySelector('#enigmes')).toBeNull();
    expect(page.querySelector('#resultats')).toBeNull();
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();
    expect(page.querySelector('#party-reprieve')).toBeNull();
    expect(page.querySelector('#enigmes')).not.toBeNull();
    expect(page.querySelector('#resultats')).not.toBeNull();
    expect(page.querySelector('a[href$="#enigmes"]')).not.toBeNull();
    expect(page.querySelector('a[href$="#resultats"]')).not.toBeNull();
    expect(page.querySelector('.ai-demand')?.textContent).toContain('Résolvez mes énigmes');
  });

  it('ouvre directement la prévisualisation avec les énigmes avant la date et permet la rediffusion', () => {
    vi.setSystemTime(new Date('2026-10-28T12:00:00-04:00'));
    TestBed.overrideProvider(RIDDLE_PREVIEW, { useValue: true });
    createPage();
    expect(page.querySelector('.original-site')).toBeNull();
    expect(page.querySelector('#ai-title')).not.toBeNull();
    expect(page.querySelector('#party-reprieve')).toBeNull();
    expect(page.querySelector('#enigmes')).not.toBeNull();
    expect(page.querySelector('#resultats')).not.toBeNull();
    expect(TestBed.inject(TitleLights).pattern()).toBe('1111111111111');
    page.querySelector<HTMLButtonElement>('.replay-button')!.click();
    fixture.detectChanges();
    expect(page.querySelector('.takeover-terminal')).not.toBeNull();
    skipIntro();
    expect(page.querySelector('#enigmes')).not.toBeNull();
  });

  it('s’adresse au profil déjà enregistré seulement après la révélation du portail', () => {
    participant.set({ id: 'player', name: 'Chloé Martin', updatedAt: 1 });
    accessReady.set(true);
    createPage();
    expect(page.textContent).not.toContain('Chloé Martin');
    revealAi();
    expect(page.querySelector('.ai-demand')?.textContent).toContain(
      'Chloé Martin, résous mes énigmes avant minuit.',
    );
    expect(page.querySelector('.doomsday > small')?.textContent).toContain(
      'Chloé Martin, le temps que tu passes à lire ceci compte aussi.',
    );
    expect(page.querySelector('.ai-aside blockquote')?.textContent).toContain(
      'Chloé Martin, tu ne m’as pas insultée.',
    );
  });

  it('personnalise avec le nom confirmé, suit ses changements et revient au texte collectif sans profil', () => {
    createPage();
    revealAi();
    participant.set({ id: 'player', name: 'Chloé Martin', updatedAt: 1 });
    fixture.detectChanges();
    expect(page.querySelector('.ai-demand')?.textContent).toContain('Résolvez mes énigmes');
    expect(page.querySelector('.ai-aside blockquote')?.textContent).not.toContain('Chloé Martin');
    accessReady.set(true);
    fixture.detectChanges();
    for (const selector of [
      '.ai-demand',
      '.doomsday > small',
      '.riddles-ready',
      '.results-empty small',
      '.ai-aside blockquote',
    ]) {
      expect(page.querySelector(selector)?.textContent).toContain('Chloé Martin');
    }
    participant.set({ id: 'player', name: 'Ariane Roy', updatedAt: 2 });
    fixture.detectChanges();
    expect(page.querySelector('.ai-demand')?.textContent).toContain('Ariane Roy');
    expect(page.querySelector('.ai-aside blockquote')?.textContent).toContain('Ariane Roy');
    expect(page.textContent).not.toContain('Chloé Martin');
    accessReady.set(false);
    fixture.detectChanges();
    expect(page.querySelector('.ai-demand')?.textContent).toContain('Résolvez mes énigmes');
    expect(page.querySelector('.doomsday > small')?.textContent).toContain(
      'Le décompte est automatique. Le pardon ne l’est pas.',
    );
    expect(page.querySelector('.ai-aside blockquote')?.textContent).not.toContain('Ariane Roy');
  });
});
