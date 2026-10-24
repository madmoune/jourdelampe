import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CONTENT } from '../../core/config/content.config';
import { EVENT } from '../../core/config/event.config';
import { Countdown } from '../../shared/countdown/countdown';
import { Icon } from '../../shared/icon/icon';
import { Hero } from './hero/hero';
import { QuoteBadge } from '../../shared/quote-badge/quote-badge';
import { QuoteDeck } from './quote-deck';
import { Potluck } from './potluck/potluck';

@Component({
  selector: 'app-home',
  imports: [Countdown, Icon, Hero, QuoteBadge, Potluck],
  providers: [QuoteDeck],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class Home {
  protected readonly event = EVENT;
  protected readonly content = CONTENT;
  protected readonly quotes = inject(QuoteDeck).quotes;
  protected readonly menuOpen = signal(false);

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
