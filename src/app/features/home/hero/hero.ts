import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CONTENT } from '../../../core/config/content.config';
import { EVENT } from '../../../core/config/event.config';
import { Icon } from '../../../shared/icon/icon';
import { LampTitle } from '../lamp-title/lamp-title';
import { QuoteBadge } from '../../../shared/quote-badge/quote-badge';
import { QuoteDeck } from '../quote-deck';
import { QuoteSubmit } from '../quote-submit/quote-submit';

@Component({
  selector: 'app-hero',
  imports: [Icon, LampTitle, QuoteBadge, QuoteSubmit],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly event = EVENT;
  protected readonly content = CONTENT;
  protected readonly quotes = inject(QuoteDeck).quotes;
}
