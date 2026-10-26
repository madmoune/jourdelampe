import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import { GameStore } from './game-store';

describe('progression commune du jeu', () => {
  let catalog: BehaviorSubject<unknown>;
  let round: BehaviorSubject<unknown>;
  let solutions: BehaviorSubject<unknown>;
  let store: GameStore;
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
    const sources: Record<string, BehaviorSubject<unknown>> = {
      'game/catalog': catalog,
      'game/round': round,
      'game/solves': solutions,
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: RealtimeDatabase, useValue: { watch: (path: string) => sources[path] } },
      ],
    });
    store = TestBed.inject(GameStore);
  });

  it('garde le méta verrouillé sans énigme et exige une résolution de chacune, quel que soit le joueur', () => {
    expect(store.metaUnlocked()).toBe(false);
    catalog.next({
      a: { title: 'A', prompt: '', order: 0 },
      b: { title: 'B', prompt: '', order: 1 },
    });
    solutions.next({ a: { alice: solve('a', 'alice'), bob: solve('a', 'bob') } });
    expect(store.riddles()[0].solutions).toHaveLength(2);
    expect(store.solvedCount()).toBe(1);
    expect(store.metaUnlocked()).toBe(false);
    solutions.next({
      a: { alice: solve('a', 'alice'), bob: solve('a', 'bob') },
      b: { charlie: solve('b', 'charlie') },
    });
    expect(store.solvedCount()).toBe(2);
    expect(store.metaUnlocked()).toBe(true);
  });

  it('verrouille immédiatement le méta au changement de partie, même avant la réception des résolutions vidées', () => {
    catalog.next({ a: { title: 'A', prompt: '', order: 0 } });
    solutions.next({ a: { alice: solve('a', 'alice') } });
    expect(store.metaUnlocked()).toBe(true);
    round.next({ id: 'two', resetAt: 2 });
    expect(store.metaUnlocked()).toBe(false);
    expect(store.solvedCount()).toBe(0);
    solutions.next(null);
    expect(store.riddles()[0].solutions).toEqual([]);
    solutions.next({ a: { alice: solve('a', 'alice', 'two') } });
    expect(store.metaUnlocked()).toBe(true);
  });

  it('ne conserve pas un déverrouillage si la lecture du jeu échoue', () => {
    catalog.next({ a: { title: 'A', prompt: '', order: 0 } });
    solutions.next({ a: { alice: solve('a', 'alice') } });
    expect(store.metaUnlocked()).toBe(true);
    solutions.error(new Error('offline'));
    expect(store.ready()).toBe(false);
    expect(store.metaUnlocked()).toBe(false);
  });
});
