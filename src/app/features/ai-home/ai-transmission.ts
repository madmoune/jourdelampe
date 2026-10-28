import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AI_REPLIES } from './ai-content';
import { AiQuoteRotation } from './ai-quote-rotation';

@Component({
  selector: 'aside[appAiTransmission]',
  templateUrl: './ai-transmission.html',
  styleUrl: './ai-transmission.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'right-sidebar', 'aria-label': 'Transmissions de l’AI' },
})
export class AiTransmission {
  readonly riddlesVisible = input(true);
  readonly participantName = input<string | null>(null);
  readonly replay = output<void>();
  protected readonly rotation = inject(AiQuoteRotation);
  protected readonly archives = this.rotation.archives;
  protected readonly selectedChannel = signal(0);
  protected readonly channel = computed(() => this.archives()[this.selectedChannel()]);
  protected readonly replyIndex = signal(0);
  protected readonly reply = computed(() => {
    const reply = AI_REPLIES[this.replyIndex()];
    if (!this.riddlesVisible()) {
      return 'beforeRelease' in reply ? reply.beforeRelease : reply.general;
    }
    const name = this.participantName();
    return name ? reply.personal(name) : reply.general;
  });
  protected provokeAi(): void {
    this.replyIndex.update((index) => (index + 1) % AI_REPLIES.length);
  }
  protected selectChannel(index: number): void {
    this.selectedChannel.set(index);
  }
}
