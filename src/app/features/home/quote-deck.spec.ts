import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ManagedQuote } from '../../core/models/quote';
import { QuotesStore } from '../../core/services/quotes-store';
import {
  activeQuotes,
  initialQuoteCatalog,
  parseQuoteCatalog,
} from '../../core/utils/quote-catalog';
import { QuoteDeck } from './quote-deck';

describe('mise en avant de la citation ajoutée', () => {
  const added: ManagedQuote = {
    id: 'new-quote',
    text: 'Une nouvelle citation.',
    kind: 'regular',
    active: true,
    href: null,
    createdAt: 1,
    updatedAt: 1,
  };

  function createDeck() {
    const entries = signal(parseQuoteCatalog(initialQuoteCatalog()));
    TestBed.configureTestingModule({
      providers: [
        QuoteDeck,
        {
          provide: QuotesStore,
          useValue: {
            entries,
            regular: computed(() => activeQuotes(entries(), 'regular')),
            ai: computed(() => activeQuotes(entries(), 'ai')),
          },
        },
      ],
    });
    // Une visite avec l’AI permet aussi de vérifier la priorité du nouvel ajout.
    vi.spyOn(Math, 'random').mockReturnValue(1972 / 0x100000000);
    return { entries, deck: TestBed.inject(QuoteDeck) };
  }

  afterEach(() => vi.restoreAllMocks());

  it('affiche immédiatement l’ajout confirmé avant même le retour du catalogue', () => {
    const { deck, entries } = createDeck();
    expect(deck.quotes()[0].author).toBe('AI');
    deck.showAdded(added);
    expect(deck.quotes()[0]).toEqual(added);
    expect(deck.quotes()).toHaveLength(6);
    expect(deck.quotes().filter((quote) => quote.id === added.id)).toHaveLength(1);
    expect(deck.quotes().every((quote) => quote.author !== 'AI')).toBe(true);

    entries.update((quotes) => [...quotes, added]);
    expect(deck.quotes()[0].id).toBe(added.id);
    expect(deck.quotes().filter((quote) => quote.id === added.id)).toHaveLength(1);
  });

  it('met le dernier ajout en premier et évite aussi les doublons de texte', () => {
    const { deck, entries } = createDeck();
    const next = { ...added, id: 'next-quote', text: 'Une autre citation.' };
    entries.update((quotes) => [
      ...quotes,
      added,
      next,
      { ...next, id: 'same-text', text: next.text.toUpperCase() },
    ]);
    deck.showAdded(added);
    deck.showAdded(next);
    expect(deck.quotes()[0].id).toBe(next.id);
    expect(
      deck.quotes().filter((quote) => quote.text.toLowerCase() === next.text.toLowerCase()),
    ).toHaveLength(1);
  });

  it('suit les modifications et cesse d’afficher une citation retirée', () => {
    const { deck, entries } = createDeck();
    entries.update((quotes) => [...quotes, added]);
    deck.showAdded(added);
    entries.update((quotes) =>
      quotes.map((quote) =>
        quote.id === added.id ? { ...quote, text: 'Citation corrigée.' } : quote,
      ),
    );
    expect(deck.quotes()[0].text).toBe('Citation corrigée.');
    entries.update((quotes) =>
      quotes.map((quote) => (quote.id === added.id ? { ...quote, active: false } : quote)),
    );
    expect(deck.quotes().some((quote) => quote.id === added.id)).toBe(false);
    expect(deck.quotes()[0].author).toBe('AI');
  });

  it('cesse aussi de mettre en avant une citation supprimée du catalogue', () => {
    const { deck, entries } = createDeck();
    entries.update((quotes) => [...quotes, added]);
    deck.showAdded(added);
    entries.update((quotes) => quotes.filter((quote) => quote.id !== added.id));
    expect(deck.quotes().some((quote) => quote.id === added.id)).toBe(false);
  });

  it('réinitialise la mise en avant quand une nouvelle rotation est demandée', () => {
    const { deck } = createDeck();
    deck.showAdded(added);
    expect(deck.quotes()[0]).toEqual(added);

    deck.redraw();

    expect(deck.quotes()[0]).not.toEqual(added);
    expect(deck.quotes()).toHaveLength(6);
  });
});
