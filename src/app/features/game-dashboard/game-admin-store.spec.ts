import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FirebaseRest } from '../../core/services/firebase-rest';
import { GameStore } from '../riddles/game-store';
import { GameAdminSession } from './game-admin-session';
import { GameAdminStore } from './game-admin-store';
import { GameMode } from '../riddles/game.model';

const sdk = vi.hoisted(() => ({ onValue: vi.fn() }));
vi.mock('firebase/database', () => ({
  getDatabase: () => ({}),
  ref: (_database: unknown, path: string) => path,
  onValue: sdk.onValue,
  runTransaction: async () => {},
  serverTimestamp: () => ({ '.sv': 'timestamp' }),
}));

describe('gestion du jeu et suivi des joueurs', () => {
  const update = vi.fn();
  const token = vi.fn();
  let store: GameAdminStore;
  let listeners: Map<
    string,
    {
      emit: (value: unknown) => void;
      fail: () => void;
      stop: ReturnType<typeof vi.fn>;
    }
  >;

  beforeEach(() => {
    update.mockReset().mockResolvedValue(undefined);
    token.mockReset().mockResolvedValue('admin-token');
    listeners = new Map();
    sdk.onValue
      .mockReset()
      .mockImplementation(
        (
          path: string,
          next: (snapshot: { val: () => unknown }) => void,
          error: (error: Error) => void,
        ) => {
          const stop = vi.fn();
          listeners.set(path, {
            emit: (value) => next({ val: () => value }),
            fail: () => error(new Error('permission-denied')),
            stop,
          });
          return stop;
        },
      );
    TestBed.configureTestingModule({
      providers: [
        GameAdminStore,
        { provide: FirebaseRest, useValue: { update } },
        {
          provide: GameStore,
          useValue: {
            catalog: signal([{ id: 'first' }, { id: 'second' }]),
            riddles: signal([]),
            mode: signal<GameMode>('team'),
            ready: signal(true),
          },
        },
        {
          provide: GameAdminSession,
          useValue: {
            token,
            login: async () => {},
            getApp: async () => ({}),
            logout: async () => {},
          },
        },
      ],
    });
    store = TestBed.inject(GameAdminStore);
  });

  it('modifie uniquement le réglage avec la session de gestion', async () => {
    await store.setMode('individual');
    expect(update).toHaveBeenCalledExactlyOnceWith(
      'game/settings',
      { mode: 'individual' },
      'admin-token',
    );
  });

  it('conserve le réglage lors de la remise à zéro', async () => {
    await store.reset();
    const [path, patch, auth] = update.mock.calls[0];
    expect(path).toBe('game');
    expect(auth).toBe('admin-token');
    expect(patch).toEqual({
      round: { id: expect.any(String), resetAt: { '.sv': 'timestamp' } },
      solves: null,
      proofs: null,
      attempts: null,
    });
  });

  it('signale un refus du serveur sans annoncer de réussite', async () => {
    update.mockRejectedValue(new Error('denied'));
    await expect(store.setMode('team')).rejects.toThrow('Le mode n’a pas pu être enregistré');
  });

  it('supprime le profil et toutes ses données de jeu avec une écriture admin atomique', async () => {
    await store.removePlayer('alice');
    expect(update).toHaveBeenCalledExactlyOnceWith(
      '',
      {
        'participants/alice': null,
        'game/proofs/alice': null,
        'game/attempts/alice': null,
        'game/solves/first/alice': null,
        'game/solves/second/alice': null,
      },
      'admin-token',
    );
  });

  it('conserve le profil si la suppression est refusée', async () => {
    await store.login('password');
    listeners.get('riddleSecrets')!.emit(null);
    listeners.get('participants')!.emit({ alice: { name: 'Alice', updatedAt: 1 } });
    update.mockRejectedValueOnce(new Error('denied'));
    await expect(store.removePlayer('alice')).rejects.toThrow('n’a pas pu être supprimé');
    expect(store.players().map((player) => player.id)).toEqual(['alice']);
  });

  it('charge tous les profils après connexion et attend les deux lectures avant de les afficher', async () => {
    expect(sdk.onValue).not.toHaveBeenCalled();
    await store.login('password');
    expect(store.loading()).toBe(true);
    const participants = listeners.get('participants')!;
    participants.emit({ alice: { name: 'Alice', updatedAt: 1 } });
    expect(store.loading()).toBe(true);
    expect(store.players()).toEqual([]);
    listeners.get('riddleSecrets')!.emit(null);
    expect(store.loading()).toBe(false);
    expect(store.players()).toHaveLength(1);
    expect(store.players()[0]).toMatchObject({ id: 'alice', name: 'Alice', solvedCount: 0 });
    participants.emit({
      alice: { name: 'Nouveau nom', updatedAt: 2 },
      bob: { name: 'Bob', updatedAt: 1 },
    });
    expect(store.players().map((player) => player.name)).toEqual(['Bob', 'Nouveau nom']);
    await store.logout();
    expect(participants.stop).toHaveBeenCalledOnce();
    expect(listeners.get('riddleSecrets')!.stop).toHaveBeenCalledOnce();
    expect(store.players()).toEqual([]);
    participants.emit({ alice: { name: 'Ancien profil', updatedAt: 3 } });
    expect(store.players()).toEqual([]);
  });

  it('signale une erreur de lecture des profils sans prétendre qu’aucun joueur n’est inscrit', async () => {
    await store.login('password');
    listeners.get('riddleSecrets')!.emit(null);
    const participants = listeners.get('participants')!;
    participants.emit({ alice: { name: 'Alice', updatedAt: 1 } });
    expect(store.players()).toHaveLength(1);
    participants.fail();
    expect(store.error()).toContain('indisponibles');
    expect(store.loading()).toBe(false);
    expect(store.players()).toEqual([]);
    expect(participants.stop).toHaveBeenCalledOnce();
  });
});
