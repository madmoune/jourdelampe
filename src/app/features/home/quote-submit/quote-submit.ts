import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuotesStore } from '../../../core/services/quotes-store';
import { QUOTE_MAX_LENGTH } from '../../../core/utils/quote-catalog';
import { Icon } from '../../../shared/icon/icon';
import { QuoteDeck } from '../quote-deck';

@Component({
  selector: 'app-quote-submit',
  imports: [FormsModule, Icon],
  templateUrl: './quote-submit.html',
  styleUrl: './quote-submit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteSubmit {
  protected readonly maxLength = QUOTE_MAX_LENGTH;
  protected readonly text = signal('');
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');
  private readonly store = inject(QuotesStore);
  private readonly deck = inject(QuoteDeck);

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    this.message.set('');
    this.error.set('');
    this.busy.set(true);
    try {
      const quote = await this.store.add(this.text());
      this.deck.showAdded(quote);
      this.text.set('');
      this.message.set('Merci! Ta citation rejoint la rotation.');
    } catch (error: unknown) {
      this.error.set(error instanceof Error ? error.message : 'L’ajout a échoué. Réessaie.');
    } finally {
      this.busy.set(false);
    }
  }
}
