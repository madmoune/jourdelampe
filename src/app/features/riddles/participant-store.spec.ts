import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { AnonymousSession } from '../../core/services/anonymous-session';
import { RealtimeDatabase } from '../../core/services/realtime-database';
import { ParticipantStore } from './participant-store';

describe('profil des participants', () => {
  let identities: BehaviorSubject<string | null>;
  let profiles: BehaviorSubject<unknown>;
  let session: { watch: ReturnType<typeof vi.fn>; signIn: ReturnType<typeof vi.fn> };
  let database: { watch: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  const profile = { name: 'Chloé', updatedAt: 1 };

  beforeEach(() => {
    identities = new BehaviorSubject<string | null>(null);
    profiles = new BehaviorSubject<unknown>(null);
    session = {
      watch: vi.fn(() => identities),
      signIn: vi.fn(async () => {
        if (!identities.value) identities.next('same-person');
        return identities.value!;
      }),
    };
    database = {
      watch: vi.fn(() => profiles),
      update: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: AnonymousSession, useValue: session },
        { provide: RealtimeDatabase, useValue: database },
      ],
    });
  });

  it('bloque les réponses sans nom et ne crée pas de compte à la visite', () => {
    const store = TestBed.inject(ParticipantStore);
    expect(store.loading()).toBe(false);
    expect(store.canSolve()).toBe(false);
    expect(() => store.requireParticipant()).toThrow('enregistre ton nom');
    expect(session.signIn).not.toHaveBeenCalled();
    expect(database.watch).not.toHaveBeenCalled();
  });

  it('refuse les noms vides, trop longs ou invisibles avant toute écriture', async () => {
    const store = TestBed.inject(ParticipantStore);
    for (const name of ['', ' \t\n\u00a0 ', 'a'.repeat(61), '\u200b']) {
      await expect(store.saveName(name)).rejects.toThrow();
    }
    expect(session.signIn).not.toHaveBeenCalled();
    expect(database.update).not.toHaveBeenCalled();
    expect(store.canSolve()).toBe(false);
  });

  it('attend la confirmation serveur même si Firebase émet déjà le nom localement', async () => {
    const store = TestBed.inject(ParticipantStore);
    let confirm!: () => void;
    database.update.mockImplementation(() => new Promise<void>((resolve) => (confirm = resolve)));
    const pending = store.saveName('  Chloé   et Alex  ');
    await Promise.resolve();
    expect(database.update).toHaveBeenCalledWith(
      'participants/same-person',
      expect.objectContaining({ name: 'Chloé et Alex' }),
    );
    profiles.next({ name: 'Chloé et Alex', updatedAt: 2 });
    expect(store.saving()).toBe(true);
    expect(store.canSolve()).toBe(false);
    expect(() => store.requireParticipant()).toThrow();
    confirm();
    await pending;
    expect(store.requireParticipant()).toMatchObject({ id: 'same-person', name: 'Chloé et Alex' });
  });

  it('garde l’accès fermé si la première sauvegarde est refusée', async () => {
    const store = TestBed.inject(ParticipantStore);
    database.update.mockImplementation(async () => {
      profiles.next(profile);
      throw new Error('permission-denied');
    });
    await expect(store.saveName('Chloé')).rejects.toThrow('n’a pas pu être enregistré');
    expect(store.participant()).toBeNull();
    expect(store.canSolve()).toBe(false);
    expect(store.saving()).toBe(false);
  });

  it('retrouve le profil de la session existante sans demander le nom à nouveau', () => {
    identities.next('same-person');
    profiles.next(profile);
    const store = TestBed.inject(ParticipantStore);
    expect(database.watch).toHaveBeenCalledWith('participants/same-person');
    expect(store.requireParticipant()).toEqual({ id: 'same-person', ...profile });
    expect(session.signIn).not.toHaveBeenCalled();
  });

  it('change le nom sous le même identifiant sans interrompre une énigme déjà ouverte', async () => {
    identities.next('same-person');
    profiles.next(profile);
    const store = TestBed.inject(ParticipantStore);
    let confirm!: () => void;
    database.update.mockImplementation(() => new Promise<void>((resolve) => (confirm = resolve)));
    const pending = store.saveName('Chloé Martin');
    await Promise.resolve();
    profiles.next({ name: 'Chloé Martin', updatedAt: 2 });
    expect(store.requireParticipant().name).toBe('Chloé');
    confirm();
    await pending;
    expect(store.requireParticipant()).toMatchObject({ id: 'same-person', name: 'Chloé Martin' });
    expect(database.update).toHaveBeenCalledTimes(1);
    expect(database.update.mock.calls[0][0]).toBe('participants/same-person');
  });

  it('conserve le nom confirmé si une modification échoue', async () => {
    identities.next('same-person');
    profiles.next(profile);
    const store = TestBed.inject(ParticipantStore);
    database.update.mockImplementation(async () => {
      profiles.next({ name: 'Non enregistré', updatedAt: 2 });
      throw new Error('offline');
    });
    await expect(store.saveName('Non enregistré')).rejects.toThrow();
    expect(store.requireParticipant()).toEqual({ id: 'same-person', ...profile });
  });

  it('ferme l’accès si la session change et ignore les événements de l’ancien profil', () => {
    identities.next('same-person');
    profiles.next(profile);
    const store = TestBed.inject(ParticipantStore);
    expect(store.canSolve()).toBe(true);
    identities.next(null);
    profiles.next({ name: 'Ancien profil', updatedAt: 3 });
    expect(store.participant()).toBeNull();
    expect(() => store.requireParticipant()).toThrow();
  });

  it('bloque un profil invalide et permet de réessayer après correction', () => {
    identities.next('same-person');
    profiles.next({ name: '  ', updatedAt: 1 });
    const store = TestBed.inject(ParticipantStore);
    expect(store.canSolve()).toBe(false);
    expect(store.error()).toContain('indisponible');
    profiles.next(profile);
    store.retry();
    expect(store.canSolve()).toBe(true);
    expect(store.error()).toBe('');
  });
});
