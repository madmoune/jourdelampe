import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameAdminStore } from './game-admin-store';
import { GameDashboard } from './game-dashboard';
import { GameMode } from '../riddles/game.model';
import { MATCHMAKER_ID } from '../riddles/riddle-pages';
import { Participant } from '../riddles/participant';
import { summarizePlayers } from './player-overview';

describe('tableau de bord protégé et confirmations de remise à zéro', () => {
  async function setup(authorized = false) {
    const access = signal(authorized);
    const reset = vi.fn().mockResolvedValue(undefined);
    const removePlayer = vi.fn().mockResolvedValue(undefined);
    const mode = signal<GameMode>('team');
    const participants = signal<readonly Participant[]>([
      { id: 'alice', name: 'Alice Roy', updatedAt: 1 },
      { id: 'bob', name: 'Bob Tremblay', updatedAt: 1 },
      { id: 'charlie', name: 'Charlie Sans-réussite', updatedAt: 1 },
    ]);
    const riddles = signal([
      {
        id: 'a',
        title: 'La lampe',
        prompt: '',
        order: 0,
        solutions: [
          {
            participantId: 'alice',
            participantName: 'Alice Roy',
            riddleId: 'a',
            riddleTitle: 'La lampe',
            roundId: 'one',
            solvedAt: Date.parse('2026-12-31T23:00:00Z'),
          },
          {
            participantId: 'bob',
            participantName: 'Bob Tremblay',
            riddleId: 'a',
            riddleTitle: 'La lampe',
            roundId: 'one',
            solvedAt: Date.parse('2026-12-31T23:01:00Z'),
          },
        ],
      },
    ]);
    const store = {
      session: { authorized: access },
      login: vi.fn(async () => {
        access.set(true);
      }),
      logout: vi.fn(async () => access.set(false)),
      reset,
      removePlayer,
      setMode: vi.fn(async (value: GameMode) => mode.set(value)),
      error: signal(''),
      loading: signal(false),
      secrets: signal({ a: { answer: 'Réponse secrète', normalizedAnswer: 'REPONSESECRETE' } }),
      players: computed(() => summarizePlayers(participants(), riddles(), mode(), true)),
      game: {
        ready: signal(true),
        mode,
        error: signal(''),
        solvedCount: signal(1),
        teamMetaUnlocked: signal(true),
        individualMetaCount: signal(1),
        catalog: signal([{ id: 'a' }]),
        riddles,
      },
    };
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = true;
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.open = false;
      },
    });
    await TestBed.configureTestingModule({
      imports: [GameDashboard],
      providers: [provideRouter([])],
    })
      .overrideComponent(GameDashboard, {
        set: { providers: [{ provide: GameAdminStore, useValue: store }] },
      })
      .compileComponents();
    const fixture = TestBed.createComponent(GameDashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const click = (label: string) =>
      [...page.querySelectorAll<HTMLButtonElement>('button')]
        .find((button) => button.textContent?.trim() === label)!
        .click();
    async function type(id: string, value: string) {
      const input = page.querySelector<HTMLInputElement>(id)!;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    }
    return { fixture, page, store, reset, removePlayer, click, type, participants, riddles };
  }

  it('ne rend pas les réponses avant la connexion et affiche tous les joueurs après celle-ci', async () => {
    const { fixture, page, type, click, store } = await setup();
    expect(page.textContent).not.toContain('Réponse secrète');
    expect(page.textContent).not.toContain('Alice Roy');
    expect(page.textContent).not.toContain('Charlie Sans-réussite');
    await type('#game-password', 'test-password');
    click('Ouvrir le tableau de bord');
    await fixture.whenStable();
    expect(store.login).toHaveBeenCalledWith('test-password');
    expect(page.textContent).toContain('Réponse secrète');
    expect(page.textContent).toContain('Alice Roy');
    expect(page.textContent).toContain('Bob Tremblay');
    expect(page.textContent).toContain('Charlie Sans-réussite');
    expect(page.querySelector('time')?.textContent).toContain('18:00:00');
    click('Se déconnecter');
    await fixture.whenStable();
    expect(page.textContent).not.toContain('Réponse secrète');
    expect(page.textContent).not.toContain('Alice Roy');
    expect(page.textContent).not.toContain('Charlie Sans-réussite');
  });

  it('n’efface rien à la première confirmation, à l’annulation ou sans le texte de deuxième confirmation', async () => {
    const { fixture, page, click, type, reset } = await setup(true);
    click('Réinitialiser le jeu');
    await fixture.whenStable();
    expect(page.textContent).toContain('Confirmation 1 sur 2');
    expect(reset).not.toHaveBeenCalled();
    click('Oui, continuer');
    await fixture.whenStable();
    expect(page.textContent).toContain('Confirmation 2 sur 2');
    expect(reset).not.toHaveBeenCalled();
    await type('#reset-word', 'oui');
    expect(
      [...page.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
        button.textContent?.includes('Confirmer la réinitialisation'),
      )!.disabled,
    ).toBe(true);
    click('Annuler');
    await fixture.whenStable();
    expect(reset).not.toHaveBeenCalled();
    click('Réinitialiser le jeu');
    await fixture.whenStable();
    click('Oui, continuer');
    await fixture.whenStable();
    await type('#reset-word', 'RÉINITIALISER');
    click('Confirmer la réinitialisation');
    await fixture.whenStable();
    expect(reset).toHaveBeenCalledTimes(1);
    expect(page.textContent).toContain('Toutes les énigmes sont à nouveau non résolues.');
  });

  it('intègre une nouvelle énigme sans réponse configurée au suivi en direct', async () => {
    const { fixture, page, store, riddles } = await setup(true);
    store.game.catalog.set([{ id: 'a' }, { id: MATCHMAKER_ID }]);
    riddles.update((current) => [
      ...current,
      { id: MATCHMAKER_ID, title: 'Le début de la fin', prompt: '', order: 2, solutions: [] },
    ]);
    await fixture.whenStable();
    const cards = page.querySelectorAll<HTMLElement>('.riddle-card');
    expect(cards).toHaveLength(2);
    expect(cards[1].querySelector('h3')?.textContent).toBe('Le début de la fin');
    expect(cards[1].querySelector('.badge')?.textContent).toContain('Non résolue');
    expect(cards[1].querySelector('.secret-answer')?.textContent).toContain('À définir');
    for (const player of page.querySelectorAll<HTMLElement>('.player-card')) {
      expect(player.querySelector('progress')?.max).toBe(2);
      expect(player.querySelector('.player-riddles')?.textContent).toContain('Le début de la fin');
      expect(player.textContent).toContain('Méta verrouillé');
    }
  });

  it('demande une confirmation avant de supprimer un joueur', async () => {
    const { fixture, page, removePlayer, store } = await setup(true);
    page.querySelector<HTMLButtonElement>('.remove-player')!.click();
    await fixture.whenStable();
    const dialog = page.querySelector<HTMLDialogElement>('.remove-player-dialog')!;
    expect(dialog.open).toBe(true);
    expect(dialog.textContent).toContain('Alice Roy');
    expect(removePlayer).not.toHaveBeenCalled();
    [...dialog.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent?.trim() === 'Annuler')!
      .click();
    await fixture.whenStable();
    expect(page.querySelector('.remove-player-dialog')).toBeNull();
    expect(removePlayer).not.toHaveBeenCalled();

    page.querySelector<HTMLButtonElement>('.remove-player')!.click();
    await fixture.whenStable();
    [...page.querySelectorAll<HTMLButtonElement>('.remove-player-dialog button')]
      .find((button) => button.textContent?.trim() === 'Supprimer le joueur')!
      .click();
    await fixture.whenStable();
    expect(store.removePlayer).toHaveBeenCalledWith('alice');
    expect(page.textContent).toContain('Le joueur Alice Roy a été supprimé.');
  });

  it('change le mode sans réinitialiser les réussites et adapte le suivi du méta', async () => {
    const { fixture, page, store, reset } = await setup(true);
    const individual = page.querySelector<HTMLButtonElement>('.mode-option')!;
    expect(individual.getAttribute('aria-pressed')).toBe('false');
    individual.click();
    await fixture.whenStable();
    expect(store.setMode).toHaveBeenCalledWith('individual');
    expect(individual.getAttribute('aria-pressed')).toBe('true');
    expect(page.textContent).toContain('1 accès au méta');
    expect(page.textContent).toContain('Mode individuel activé. Les réussites sont conservées.');
    expect(page.textContent).toContain('Alice Roy');
    page.querySelectorAll<HTMLButtonElement>('.mode-option')[1].click();
    await fixture.whenStable();
    expect(store.setMode).toHaveBeenLastCalledWith('team');
    expect(page.textContent).toContain('Méta déverrouillé');
    expect(reset).not.toHaveBeenCalled();
  });

  it.each(['game', 'answers'])(
    'arrête l’affichage du chargement si la lecture de %s échoue',
    async (source) => {
      const { fixture, page, store } = await setup(true);
      if (source === 'game') {
        store.game.ready.set(false);
        store.game.error.set('L’état du jeu est indisponible.');
      } else {
        store.loading.set(true);
        store.error.set('Les réponses sont indisponibles.');
      }
      await fixture.whenStable();
      expect(page.querySelector('[role="alert"]')?.textContent).toContain('indisponible');
      expect(page.textContent).not.toContain(
        'Chargement des joueurs, des énigmes et des résolutions…',
      );
      expect(page.querySelector('.riddle-list')).toBeNull();
    },
  );

  it('affiche les joueurs sans réussite et distingue la progression de la contribution', async () => {
    const { page, fixture } = await setup(true);
    expect(page.querySelector('.live-status')?.textContent).toContain('Mises à jour en direct');
    expect(page.querySelector('#players-heading')?.textContent).toContain('3');
    const [alice, bob, charlie] = page.querySelectorAll<HTMLElement>('.player-card');
    expect(alice.querySelector('progress')?.value).toBe(1);
    expect(alice.querySelector('.player-stats > div:last-child strong')?.textContent).toBe('1');
    expect(bob.querySelector('.player-stats > div:last-child strong')?.textContent).toBe('0');
    expect(charlie.querySelector('progress')?.value).toBe(0);
    expect(charlie.textContent).toContain('Méta accessible');
    expect(charlie.textContent).toContain('Aucune énigme résolue');
    expect(charlie.textContent).toContain('À résoudre');
    expect(alice.querySelector('.player-riddles time')?.textContent).toContain('18:00:00');
    expect(alice.querySelector('summary')).not.toBeNull();
    page.querySelector<HTMLButtonElement>('.mode-option')!.click();
    await fixture.whenStable();
    expect(alice.textContent).toContain('Méta accessible');
    expect(charlie.textContent).toContain('Méta verrouillé');
  });

  it('actualise les nouveaux profils, les noms et la progression sans perdre les joueurs au reset', async () => {
    const { page, fixture, participants, riddles } = await setup(true);
    participants.update((current) => [
      { ...current[0], name: 'Alice Nouveau nom' },
      ...current.slice(1),
      { id: 'david', name: 'David', updatedAt: 2 },
    ]);
    await fixture.whenStable();
    expect(page.querySelectorAll('.player-card')).toHaveLength(4);
    expect(page.querySelector('.player-card h3')?.textContent).toBe('Alice Nouveau nom');
    expect(page.querySelector<HTMLProgressElement>('.player-card progress')?.value).toBe(1);
    riddles.update((current) => current.map((riddle) => ({ ...riddle, solutions: [] })));
    await fixture.whenStable();
    expect(page.querySelectorAll('.player-card')).toHaveLength(4);
    for (const card of page.querySelectorAll<HTMLElement>('.player-card')) {
      expect(card.querySelector('progress')?.value).toBe(0);
      expect(card.textContent).toContain('Méta verrouillé');
      expect(card.textContent).toContain('Aucune énigme résolue');
    }
    participants.set([]);
    await fixture.whenStable();
    expect(page.textContent).toContain('Aucun joueur enregistré pour le moment.');
  });

  it('attend la confirmation du serveur et conserve le mode actif si l’enregistrement échoue', async () => {
    const { fixture, page, store } = await setup(true);
    let reject!: (error: Error) => void;
    store.setMode.mockImplementation(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail;
        }),
    );
    const options = page.querySelectorAll<HTMLButtonElement>('.mode-option');
    options[0].click();
    await fixture.whenStable();
    expect(options[0].disabled).toBe(true);
    expect(options[1].getAttribute('aria-pressed')).toBe('true');
    expect(page.textContent).not.toContain('Mode individuel activé');
    reject(new Error('Enregistrement indisponible.'));
    await vi.waitFor(async () => {
      await fixture.whenStable();
      expect(page.querySelector('[role="alert"]')?.textContent).toContain(
        'Enregistrement indisponible',
      );
    });
    expect(options[1].getAttribute('aria-pressed')).toBe('true');
    expect(options[0].disabled).toBe(false);
  });
});
