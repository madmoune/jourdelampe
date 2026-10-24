import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import type { Quote } from '../../core/models/quote';

@Component({
  selector: 'app-quote-badge',
  imports: [Icon],
  templateUrl: './quote-badge.html',
  styleUrl: './quote-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-shape]': 'shape()',
    '[attr.data-tone]': 'tone()',
    '[class.long-quote]': 'longQuote()',
    '[class.very-long-quote]': 'veryLongQuote()',
  },
})
export class QuoteBadge {
  readonly quote = input.required<Quote>();
  readonly shape = input<'circle' | 'note' | 'pill'>('circle');
  readonly tone = input<'yellow' | 'olive' | 'lilac' | 'peach'>('yellow');
  protected readonly longQuote = computed(() => this.quote().text.length > 55);
  protected readonly veryLongQuote = computed(() => this.quote().text.length > 85);
}
