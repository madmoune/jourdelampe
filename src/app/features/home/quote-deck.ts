import { computed, inject, Injectable, signal } from '@angular/core';
import type { ManagedQuote } from '../../core/models/quote';
import { QuotesStore } from '../../core/services/quotes-store';
import { quoteTextKey } from '../../core/utils/quote-catalog';
import { quoteRandom, selectQuotes } from '../../core/utils/select-quotes';

/** Tirage partagé par l’accueil, stable tant que le catalogue ne change pas. */
@Injectable()
export class QuoteDeck {
  private readonly store = inject(QuotesStore);
  private readonly seed = signal(Math.floor(Math.random() * 0x100000000));
  private readonly featured = signal<{
    quote: ManagedQuote;
    catalog: readonly ManagedQuote[];
  } | null>(null);

  readonly quotes = computed(() => {
    const regular = this.store.regular();
    const featured = this.featured();
    if (featured) {
      const catalog = this.store.entries();
      const current = catalog.find(
        (quote) => quote.kind === 'regular' && quote.id === featured.quote.id,
      );
      // La confirmation d’écriture peut précéder le prochain événement du catalogue.
      const quote = current
        ? current.active
          ? current
          : null
        : catalog === featured.catalog
          ? featured.quote
          : null;
      if (quote) {
        const remaining = regular.filter(
          (candidate) =>
            candidate.id !== quote.id && quoteTextKey(candidate.text) !== quoteTextKey(quote.text),
        );
        return [quote, ...selectQuotes(remaining, [], 5, quoteRandom(this.seed()))];
      }
    }
    return selectQuotes(regular, this.store.ai(), 6, quoteRandom(this.seed()));
  });

  /** La dernière proposition prend la pastille du haut pour la visite en cours. */
  showAdded(quote: ManagedQuote): void {
    this.featured.set({ quote, catalog: this.store.entries() });
  }

  /** Demande une nouvelle rotation des citations depuis le bouton de l’accueil. */
  redraw(): void {
    this.featured.set(null);
    const previous = this.seed();
    let next = Math.floor(Math.random() * 0x100000000);
    if (next === previous) next = (previous + 1) >>> 0;
    this.seed.set(next);
  }
}
