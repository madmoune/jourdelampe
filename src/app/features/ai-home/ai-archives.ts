import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AiQuoteRotation } from './ai-quote-rotation';

@Component({
  selector: 'section[appAiArchives]',
  templateUrl: './ai-archives.html',
  styleUrl: './ai-archives.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'archive-section', id: 'archives', 'aria-labelledby': 'archives-title' },
})
export class AiArchives {
  readonly paused = input(false);
  readonly pauseToggle = output<void>();
  protected readonly rotation = inject(AiQuoteRotation);
  protected readonly archives = this.rotation.archives;
}
