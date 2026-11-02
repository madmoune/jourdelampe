import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import { GameStore } from './game-store';
import { Participant } from './participant';
import { ParticipantStore } from './participant-store';
import { PlayerProgress } from './player-progress';

describe('progression du puzzle hunt selon le mode', () => {
  let catalog: BehaviorSubject<unknown>;
  let round: BehaviorSubject<unknown>;
  let solutions: BehaviorSubject<unknown>;
  let settings: BehaviorSubject<unknown>;
  const participant = signal<Participant | null>(null);
  let store: GameStore;
  let progress: PlayerProgress;
  const solve = (riddleId: string, participantId: string, roundId = 'one') => ({
    participantId,
    participantName: participantId,
    riddleId,
    riddleTitle: riddleId,
    roundId,
    solvedAt: 1,
  });
  beforeEach(() => {
    catalog = new BehaviorSubject<unknown>(null);
    round = new BehaviorSubject<unknown>({ id: 'one', resetAt: 1 });
    solutions = new BehaviorSubject<unknown>(null);
    settings = new BehaviorSubject<unknown>(null);
    participant.set({ id: 'alice', name: 'Alice', updatedAt: 1 });
    const sources: Record<string, BehaviorSubject<unknown>> = {
      'game/catalog': catalog,
      'game/round': round,
      'game/solves': solutions,
      'game/settings': settings,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: RealtimeDatabase, useValue: { watch: (path: string) => sources[path] } },
        { provide: ParticipantStore, useValue: { participant } },
      ],
    });
    store = TestBed.inject(GameStore);
    progress = TestBed.inject(PlayerProgress);
  });

  it('garde le méta verrouillé sans énigme et exige une résolution de chacune, quel que soit le joueur', () => {
    expect(store.mode()).toBe('team');
    expect(progress.metaUnlocked()).toBe(false);
    catalog.next({
      a: { title: 'A', prompt: '', order: 0 },
      b: { title: 'B', prompt: '', order: 1 },
    });
    solutions.next({ a: { alice: solve('a', 'alice'), bob: solve('a', 'bob') } });
    expect(store.riddles()[0].solutions).toHaveLength(2);
    expect(store.solvedCount()).toBe(1);
    expect(progress.metaUnlocked()).toBe(false);
    solutions.next({
      a: { alice: solve('a', 'alice'), bob: solve('a', 'bob') },
      b: { charlie: solve('b', 'charlie') },
    });
    expect(store.solvedCount()).toBe(2);
    expect(progress.metaUnlocked()).toBe(true);
    expect(progress.riddles()[1].solvedByMe).toBe(false);
    expect(progress.riddles()[1].infoUnlocked).toBe(true);
    expect(store.individualMetaCount()).toBe(0);
  });

  it('recalcule l’accès au méta et aux informations en direct, sans perdre les résolutions', () => {
    catalog.next({
      a: { title: 'A', prompt: '', order: 0 },
      b: { title: 'B', prompt: '', order: 1 },
    });
    solutions.next({ a: { alice: solve('a', 'alice') }, b: { bob: solve('b', 'bob') } });
    expect(progress.metaUnlocked()).toBe(true);
    settings.next({ mode: 'individual' });
    expect(store.mode()).toBe('individual');
    expect(progress.solvedCount()).toBe(1);
    expect(progress.metaUnlocked()).toBe(false);
    expect(progress.riddles()[1].solutions).toEqual([]);
    expect(progress.riddles()[1].infoUnlocked).toBe(false);
    expect(store.teamMetaUnlocked()).toBe(true);
    expect(store.riddles()[1].solutions).toHaveLength(1);
    settings.next({ mode: 'team' });
    expect(progress.metaUnlocked()).toBe(true);
    expect(progress.solvedCount()).toBe(2);
    expect(progress.riddles()[1].infoUnlocked).toBe(true);
  });

  it('débloque le méta individuel seulement pour les joueurs ayant tout résolu et suit leur identité', () => {
    settings.next({ mode: 'individual' });
    catalog.next({
      a: { title: 'A', prompt: '', order: 0 },
      b: { title: 'B', prompt: '', order: 1 },
    });
    solutions.next({
      a: { alice: solve('a', 'alice'), bob: solve('a', 'bob') },
      b: { alice: solve('b', 'alice') },
    });
    expect(progress.metaUnlocked()).toBe(true);
    expect(store.individualMetaCount()).toBe(1);
    participant.set({ id: 'alice', name: 'Nouveau nom', updatedAt: 2 });
    expect(progress.metaUnlocked()).toBe(true);
    participant.set({ id: 'bob', name: 'Nouveau nom', updatedAt: 2 });
    expect(progress.metaUnlocked()).toBe(false);
    expect(progress.solvedCount()).toBe(1);
    participant.set(null);
    expect(progress.metaUnlocked()).toBe(false);
    expect(progress.solvedCount()).toBe(0);
  });

  it('ne déverrouille rien quand le mode reçu est invalide', () => {
    catalog.next({ a: { title: 'A', prompt: '', order: 0 } });
    solutions.next({ a: { alice: solve('a', 'alice') } });
    settings.next({ mode: 'unknown' });
    expect(store.ready()).toBe(false);
    expect(progress.metaUnlocked()).toBe(false);
    expect(progress.riddles()[0].infoUnlocked).toBe(false);
  });

  it.each(['team', 'individual'])(
    'verrouille immédiatement le méta au changement de partie en mode %s',
    (mode) => {
      settings.next({ mode });
      catalog.next({ a: { title: 'A', prompt: '', order: 0 } });
      solutions.next({ a: { alice: solve('a', 'alice') } });
      expect(progress.metaUnlocked()).toBe(true);
      round.next({ id: 'two', resetAt: 2 });
      expect(progress.metaUnlocked()).toBe(false);
      expect(store.solvedCount()).toBe(0);
      solutions.next(null);
      expect(store.riddles()[0].solutions).toEqual([]);
      solutions.next({ a: { alice: solve('a', 'alice', 'two') } });
      expect(progress.metaUnlocked()).toBe(true);
      expect(store.mode()).toBe(mode);
    },
  );

  it('ne conserve pas un déverrouillage si la lecture du jeu échoue', () => {
    catalog.next({ a: { title: 'A', prompt: '', order: 0 } });
    solutions.next({ a: { alice: solve('a', 'alice') } });
    expect(progress.metaUnlocked()).toBe(true);
    solutions.error(new Error('offline'));
    expect(store.ready()).toBe(false);
    expect(progress.metaUnlocked()).toBe(false);
  });
});
