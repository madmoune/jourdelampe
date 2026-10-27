import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Home } from '../home/home';
import { LampTitle } from '../home/lamp-title/lamp-title';
import { TitleLights } from '../home/lamp-title/title-lights';
import { AiHome } from './ai-home';
import { AiTakeover } from './ai-takeover';
import { ParticipantStore } from '../riddles/participant-store';
import { Participant } from '../riddles/participant';
import { GameStore } from '../riddles/game-store';
import { RiddleSubmissions } from '../riddles/riddle-submissions';

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

  function switchOffLampWord(): void {
    for (const index of [8, 9, 10, 11, 12]) toggleLetter(index);
  }

  function skipIntro(): void {
    page.querySelector<HTMLButtonElement>('.skip-intro')!.click();
    fixture.detectChanges();
  }

  function revealAi(): void {
    switchOffLampWord();
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
    expect(TestBed.inject(Title).getTitle()).toBe('Le Jour de Lampe — 2027');
  });

  it('déclenche l’animation quand les cinq lettres de LAMPE sont éteintes et laisse les autres allumées', () => {
    createPage();
    for (const index of [8, 9, 10, 11]) {
      toggleLetter(index);
      expect(page.querySelector('.takeover-terminal')).toBeNull();
    }
    vi.advanceTimersByTime(5000);
    fixture.detectChanges();
    expect(page.querySelector('#ai-title')).toBeNull();

    toggleLetter(12);
    expect(TestBed.inject(TitleLights).pattern()).toBe('1111111100000');
    expect(page.textContent).toContain('Là, c’est moi qui décide.');
    expect(page.querySelector('.original-site')?.hasAttribute('inert')).toBe(true);
    vi.advanceTimersByTime(3600);
    fixture.detectChanges();
    expect(page.querySelector('#ai-title')?.textContent).toBe('LE JOUR DE L’AI');
    expect(page.querySelector('.original-site')).toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Le Jour de l’AI — Votre party est en sursis');
    expect(window.sessionStorage.getItem(obsoleteStorageKey)).toBeNull();
  });

  it('ignore l’état des huit autres ampoules, y compris leurs lettres L et E', () => {
    createPage();
    for (let index = 0; index < 8; index++) toggleLetter(index);
    expect(TestBed.inject(TitleLights).pattern()).toBe('0000000011111');
    expect(page.querySelector('.takeover-terminal')).toBeNull();
    switchOffLampWord();
    expect(page.querySelector('.takeover-terminal')).not.toBeNull();
  });

  it('retrouve le portail sans rejouer l’intrusion après une navigation interne', () => {
    createPage();
    revealAi();
    fixture.destroy();
    createPage();
    expect(page.querySelector('#ai-title')).not.toBeNull();
    expect(page.querySelector('.takeover-terminal')).toBeNull();
  });

  it('exige que les cinq ampoules soient éteintes ensemble, quel que soit l’ordre des clics', () => {
    createPage();
    for (const index of [11, 9, 8, 10]) toggleLetter(index);
    toggleLetter(8);
    toggleLetter(12);
    expect(page.querySelector('.takeover-terminal')).toBeNull();
    toggleLetter(8);
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
    switchOffLampWord();
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
    for (const link of page.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      expect(page.querySelector(link.getAttribute('href')!)).not.toBeNull();
    }
    const pause = [...page.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('Mettre les animations en pause'),
    )!;
    pause.click();
    fixture.detectChanges();
    expect(pause.getAttribute('aria-pressed')).toBe('true');
    expect(page.querySelector('.ai-world')?.classList.contains('motion-paused')).toBe(true);
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
