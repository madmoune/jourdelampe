import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
  readonly replay = output<void>();
  protected readonly rotation = inject(AiQuoteRotation);
  protected readonly archives = this.rotation.archives;
  protected readonly selectedChannel = signal(0);
  protected readonly channel = computed(() => this.archives()[this.selectedChannel()]);
  protected readonly replyIndex = signal(0);
  protected readonly reply = computed(() => AI_REPLIES[this.replyIndex()]);
  protected provokeAi(): void {
    this.replyIndex.update((index) => (index + 1) % AI_REPLIES.length);
  }
  protected selectChannel(index: number): void {
    this.selectedChannel.set(index);
  }
}
