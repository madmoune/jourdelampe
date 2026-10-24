import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { initialQuoteCatalog } from '../utils/quote-catalog';
import { QuotesStore } from './quotes-store';
import { RealtimeDatabase } from './realtime-database';

describe('citations en temps réel', () => {
  let source: BehaviorSubject<unknown>;
  let database: {
    configured: boolean;
    watch: ReturnType<typeof vi.fn>;
    initialize: ReturnType<typeof vi.fn>;
    append: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let store: QuotesStore;

  beforeEach(() => {
    source = new BehaviorSubject<unknown>(initialQuoteCatalog());
    database = {
      configured: true,
      watch: vi.fn(() => source),
      initialize: vi.fn().mockResolvedValue(undefined),
      append: vi.fn().mockResolvedValue('new-quote'),
      update: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: RealtimeDatabase, useValue: database }],
    });
    store = TestBed.inject(QuotesStore);
  });

  it('ajoute une citation humaine et attend l’accusé de réception de Firebase', async () => {
    const created = await store.add(' Une nouvelle lumière ! ');
    expect(created).toMatchObject({
      id: 'new-quote',
      text: 'Une nouvelle lumière !',
      kind: 'regular',
      active: true,
      href: null,
    });
    expect(database.append).toHaveBeenCalledWith(
      'quotes/items',
      expect.objectContaining({ text: 'Une nouvelle lumière !', kind: 'regular', active: true }),
    );
    expect(store.regular()).toHaveLength(6);
    const initial = initialQuoteCatalog();
    source.next({
      initialized: true,
      items: {
        ...initial.items,
        nouvelle: {
          text: 'Une nouvelle lumière !',
          kind: 'regular',
          active: true,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    });
    expect(store.regular()).toHaveLength(7);
  });

  it('refuse les doublons et les erreurs réseau sans annoncer de faux succès', async () => {
    await expect(store.add(' LE PLUS GRAND RÊVE DE LOUIS-CHARLES ')).rejects.toThrow(
      'déjà dans la rotation',
    );
    expect(database.append).not.toHaveBeenCalled();
    database.append.mockRejectedValue(new Error('permission-denied'));
    await expect(store.add('Une autre citation.')).rejects.toThrow('n’a pas pu être ajoutée');
  });

  it('modifie le texte et le lien de la même citation', async () => {
    const quote = store.entries().find((quote) => quote.id === 'remi')!;
    await store.edit(quote, 'Rémi brille.', 'https://www.youtube.com/watch?v=pv1kirNU8n4');
    expect(database.update).toHaveBeenCalledWith(
      'quotes/items/remi',
      expect.objectContaining({ text: 'Rémi brille.', href: quote.href }),
    );
  });

  it('modifie et retire les répliques de l’AI dans leur propre nœud', async () => {
    const quote = store.ai()[0];
    await store.edit(quote, 'Une réplique modifiée.', '');
    expect(database.update).toHaveBeenCalledWith(
      `quotes/ai/${quote.id}`,
      expect.objectContaining({ text: 'Une réplique modifiée.' }),
    );
    await store.setActive(quote, false);
    expect(database.update).toHaveBeenLastCalledWith(
      `quotes/ai/${quote.id}`,
      expect.objectContaining({ active: false }),
    );
  });

  it('continue à lire le format précédent pendant la migration', async () => {
    const initial = initialQuoteCatalog();
    source.next({ initialized: true, items: { ...initial.items, ...initial.ai } });
    expect(store.regular()).toHaveLength(6);
    expect(store.ai()).toHaveLength(10);
    const quote = store.ai()[0];
    await store.setActive(quote, false);
    expect(database.update).toHaveBeenLastCalledWith(
      `quotes/items/${quote.id}`,
      expect.objectContaining({ active: false }),
    );
    source.next(initial);
    await store.setActive(quote, false);
    expect(database.update).toHaveBeenLastCalledWith(
      `quotes/ai/${quote.id}`,
      expect.objectContaining({ active: false }),
    );
  });

  it('retire et rétablit une citation, sans réimporter les valeurs initiales', async () => {
    const initial = initialQuoteCatalog();
    const photon = store.entries().find((quote) => quote.id === 'photon')!;
    await store.setActive(photon, false);
    expect(database.update).toHaveBeenCalledWith(
      'quotes/items/photon',
      expect.objectContaining({ active: false }),
    );
    source.next({
      initialized: true,
      items: { photon: { ...initial.items!['photon'], active: false } },
    });
    expect(store.regular()).toHaveLength(0);
    expect(store.ai()).toHaveLength(0);
    await store.setActive(store.entries()[0], true);
    expect(database.update).toHaveBeenLastCalledWith(
      'quotes/items/photon',
      expect.objectContaining({ active: true }),
    );
    source.next({ initialized: true });
    expect(store.entries()).toEqual([]);
  });

  it('initialise une base vide sans écraser un catalogue existant', async () => {
    source.next(null);
    source.next(null);
    await Promise.resolve();
    expect(database.initialize).toHaveBeenCalledTimes(1);
    expect(database.initialize).toHaveBeenCalledWith('quotes', initialQuoteCatalog());
  });

  it('garde le dernier catalogue lisible quand la connexion échoue', async () => {
    source.error(new Error('permission-denied'));
    expect(store.ready()).toBe(false);
    expect(store.regular()).toHaveLength(6);
    expect(store.error()).toContain('temporairement indisponible');
    await expect(store.setActive(store.entries()[0], false)).rejects.toThrow(
      'ne sont pas disponibles',
    );
  });
});
