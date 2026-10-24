import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { ManagedQuote } from '../../core/models/quote';
import { QuotesStore } from '../../core/services/quotes-store';
import { PotluckStore } from '../../core/services/potluck-store';
import { QUOTE_MAX_LENGTH } from '../../core/utils/quote-catalog';
import { Icon } from '../../shared/icon/icon';
import { PotluckManagement } from './potluck-management/potluck-management';

@Component({
  selector: 'app-maintenance',
  imports: [FormsModule, RouterLink, Icon, PotluckManagement],
  templateUrl: './maintenance.html',
  styleUrl: './maintenance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Maintenance {
  protected readonly store = inject(QuotesStore);
  protected readonly potluck = inject(PotluckStore);
  protected readonly maxLength = QUOTE_MAX_LENGTH;
  protected readonly search = signal('');
  protected readonly filter = signal<'active' | 'removed'>('active');
  protected readonly kind = signal<'regular' | 'ai' | 'potluck'>('regular');
  protected readonly editing = signal<string | null>(null);
  protected readonly draft = signal('');
  protected readonly link = signal('');
  protected readonly busy = signal<string | null>(null);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly humanCount = computed(
    () => this.store.entries().filter((quote) => quote.active && quote.kind === 'regular').length,
  );
  protected readonly aiCount = computed(
    () => this.store.entries().filter((quote) => quote.active && quote.kind === 'ai').length,
  );
  protected readonly category = computed(() =>
    this.store.entries().filter((quote) => quote.kind === this.kind()),
  );
  protected readonly activeCount = computed(
    () => this.category().filter((quote) => quote.active).length,
  );
  protected readonly removedCount = computed(
    () => this.category().filter((quote) => !quote.active).length,
  );
  protected readonly visible = computed(() => {
    const search = this.search().trim().toLocaleLowerCase('fr');
    return this.category().filter(
      (quote) =>
        quote.active === (this.filter() === 'active') &&
        quote.text.toLocaleLowerCase('fr').includes(search),
    );
  });

  protected selectKind(kind: 'regular' | 'ai' | 'potluck'): void {
    this.kind.set(kind);
    this.filter.set('active');
    this.search.set('');
    this.editing.set(null);
    this.message.set('');
    this.error.set('');
  }

  protected quoteKey(quote: ManagedQuote): string {
    return `${quote.kind}:${quote.id}`;
  }

  protected edit(quote: ManagedQuote): void {
    this.editing.set(this.quoteKey(quote));
    this.draft.set(quote.text);
    this.link.set(quote.href ?? '');
    this.error.set('');
    this.message.set('');
  }

  protected async save(quote: ManagedQuote): Promise<void> {
    await this.perform(quote, async () => {
      await this.store.edit(quote, this.draft(), this.link());
      this.editing.set(null);
      this.message.set('Citation modifiée.');
    });
  }

  protected async toggle(quote: ManagedQuote): Promise<void> {
    await this.perform(quote, async () => {
      await this.store.setActive(quote, !quote.active);
      if (this.editing() === this.quoteKey(quote)) this.editing.set(null);
      this.message.set(
        quote.active ? 'Citation retirée de la rotation.' : 'Citation rétablie dans la rotation.',
      );
    });
  }

  private async perform(quote: ManagedQuote, action: () => Promise<void>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(this.quoteKey(quote));
    this.error.set('');
    this.message.set('');
    try {
      await action();
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'La modification a échoué.');
    } finally {
      this.busy.set(null);
    }
  }
}
