import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { ManagedQuote, QuoteKind } from '../models/quote';
import {
  activeQuotes,
  initialQuoteCatalog,
  parseQuoteCatalog,
  quoteTextKey,
  validateQuoteLink,
  validateQuoteText,
} from '../utils/quote-catalog';
import { RealtimeDatabase } from './realtime-database';

@Injectable({ providedIn: 'root' })
export class QuotesStore {
  private readonly database = inject(RealtimeDatabase);
  private readonly catalog = signal(parseQuoteCatalog(initialQuoteCatalog()));
  private readonly readyState = signal(false);
  private readonly loadingState = signal(this.database.configured);
  private readonly errorState = signal('');
  private initialization?: Promise<void>;
  private separated = false;

  readonly entries = this.catalog.asReadonly();
  readonly ready = this.readyState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly regular = computed(() => activeQuotes(this.entries(), 'regular'));
  readonly ai = computed(() => activeQuotes(this.entries(), 'ai'));

  constructor() {
    if (!this.database.configured) {
      this.errorState.set('L’ajout de citations n’est pas disponible pour le moment.');
      return;
    }
    this.database
      .watch<unknown>('quotes')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (value) => {
          if (value === null) {
            void this.initialize().catch(() => this.unavailable());
            return;
          }
          try {
            this.catalog.set(parseQuoteCatalog(value));
            this.separated =
              typeof value === 'object' &&
              value !== null &&
              'version' in value &&
              value.version === 2;
            this.readyState.set(true);
            this.loadingState.set(false);
            this.errorState.set('');
          } catch {
            this.unavailable();
          }
        },
        error: () => this.unavailable(),
      });
  }

  async add(text: string): Promise<ManagedQuote> {
    const cleaned = validateQuoteText(text);
    this.assertUnique(cleaned, 'regular');
    if (!this.database.configured) throw new Error('Le service des citations est indisponible.');
    try {
      await this.initialize();
      const now = Date.now();
      const quote = {
        text: cleaned,
        kind: 'regular' as const,
        active: true,
        href: null,
        createdAt: now,
        updatedAt: now,
      };
      const id = await this.database.append('quotes/items', quote);
      return { ...quote, id };
    } catch {
      throw new Error('La citation n’a pas pu être ajoutée. Réessaie dans un instant.');
    }
  }

  async edit(quote: ManagedQuote, text: string, link: string): Promise<void> {
    const cleaned = validateQuoteText(text);
    const href = validateQuoteLink(link);
    this.assertUnique(cleaned, quote.kind, quote.id);
    await this.change(quote, { text: cleaned, href });
  }

  async setActive(quote: ManagedQuote, active: boolean): Promise<void> {
    if (active) this.assertUnique(quote.text, quote.kind, quote.id);
    await this.change(quote, { active });
  }

  private initialize(): Promise<void> {
    this.initialization ??= this.database
      .initialize('quotes', initialQuoteCatalog())
      .catch((error: unknown) => {
        this.initialization = undefined;
        throw error;
      });
    return this.initialization;
  }

  private assertUnique(text: string, kind: QuoteKind, exceptId?: string): void {
    if (
      this.entries().some(
        (quote) =>
          quote.active &&
          quote.kind === kind &&
          quote.id !== exceptId &&
          quoteTextKey(quote.text) === quoteTextKey(text),
      )
    ) {
      throw new Error('Cette citation est déjà dans la rotation.');
    }
  }

  private async change(quote: ManagedQuote, patch: Record<string, unknown>): Promise<void> {
    if (!this.ready()) throw new Error('Les citations ne sont pas disponibles pour le moment.');
    if (!/^[A-Za-z0-9_-]{1,80}$/u.test(quote.id))
      throw new Error('Cette citation est introuvable.');
    const group = quote.kind === 'ai' && this.separated ? 'ai' : 'items';
    try {
      await this.database.update(`quotes/${group}/${quote.id}`, {
        ...patch,
        updatedAt: Date.now(),
      });
    } catch {
      throw new Error('La modification n’a pas pu être enregistrée. Réessaie dans un instant.');
    }
  }

  private unavailable(): void {
    this.readyState.set(false);
    this.loadingState.set(false);
    this.errorState.set(
      'Le service des citations est temporairement indisponible. Réessaie en rechargeant la page.',
    );
  }
}
