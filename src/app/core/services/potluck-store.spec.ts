import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { PotluckStore } from './potluck-store';
import { RealtimeDatabase } from './realtime-database';

describe('potluck en temps réel', () => {
  const meal = { name: 'Sam', dish: 'Lasagne', active: true, createdAt: 1, updatedAt: 1 };
  let source: BehaviorSubject<unknown>;
  let database: {
    configured: boolean;
    watch: ReturnType<typeof vi.fn>;
    append: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let store: PotluckStore;

  beforeEach(() => {
    source = new BehaviorSubject<unknown>(null);
    database = {
      configured: true,
      watch: vi.fn(() => source),
      append: vi.fn().mockResolvedValue('new-meal'),
      update: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: RealtimeDatabase, useValue: database }],
    });
    store = TestBed.inject(PotluckStore);
  });

  it('ouvre une liste vide sans créer de repas fictifs', () => {
    expect(database.watch).toHaveBeenCalledWith('potluck');
    expect(store.ready()).toBe(true);
    expect(store.active()).toEqual([]);
    expect(database.append).not.toHaveBeenCalled();
  });

  it('enregistre le nom et le repas puis suit les mises à jour de la base', async () => {
    const entry = await store.add(' Sam ', '  Lasagne  ');
    expect(entry).toMatchObject({ id: 'new-meal', name: 'Sam', dish: 'Lasagne', active: true });
    expect(database.append).toHaveBeenCalledWith(
      'potluck',
      expect.objectContaining({ name: 'Sam', dish: 'Lasagne', active: true }),
    );
    expect(store.active()).toHaveLength(0);
    source.next({ 'new-meal': meal });
    expect(store.active()).toHaveLength(1);
  });

  it('refuse le même repas au même nom mais accepte un autre plat ou un autre invité', async () => {
    source.next({ first: meal });
    await expect(store.add('SAM', ' lasagne ')).rejects.toThrow('déjà inscrit');
    expect(database.append).not.toHaveBeenCalled();
    await store.add('Sam', 'Tarte');
    await store.add('Alex', 'Lasagne');
    expect(database.append).toHaveBeenCalledTimes(2);
  });

  it('modifie une entrée sans changer sa date de création', async () => {
    source.next({ first: meal });
    await store.edit(store.entries()[0], ' Sam et Alex ', ' Lasagne végétarienne ');
    expect(database.update).toHaveBeenCalledWith(
      'potluck/first',
      expect.objectContaining({ name: 'Sam et Alex', dish: 'Lasagne végétarienne' }),
    );
    expect(database.update.mock.calls[0][1]).not.toHaveProperty('createdAt');
  });

  it('retire et rétablit un repas sans le perdre', async () => {
    source.next({ first: meal });
    await store.setActive(store.entries()[0], false);
    expect(database.update).toHaveBeenLastCalledWith(
      'potluck/first',
      expect.objectContaining({ active: false }),
    );
    source.next({ first: { ...meal, active: false } });
    expect(store.active()).toHaveLength(0);
    expect(store.removed()).toHaveLength(1);
    await store.setActive(store.entries()[0], true);
    expect(database.update).toHaveBeenLastCalledWith(
      'potluck/first',
      expect.objectContaining({ active: true }),
    );
  });

  it('signale les écritures refusées et conserve le dernier état lisible hors connexion', async () => {
    database.append.mockRejectedValue(new Error('permission-denied'));
    await expect(store.add('Sam', 'Lasagne')).rejects.toThrow('n’a pas pu être ajouté');
    source.next({ first: meal });
    source.error(new Error('offline'));
    expect(store.ready()).toBe(false);
    expect(store.active()).toHaveLength(1);
    expect(store.error()).toContain('temporairement indisponible');
    await expect(store.edit(store.entries()[0], 'Sam', 'Tarte')).rejects.toThrow('pas disponible');
    expect(database.update).not.toHaveBeenCalled();
  });
});
