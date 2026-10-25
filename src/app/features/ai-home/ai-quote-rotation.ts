import { DOCUMENT } from '@angular/common';
import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { AI_ARCHIVES } from './ai-content';

export const QUOTE_ROTATION_MS = 12_000;

/** Une seule horloge pour les encarts d’archives et la télévision. */
@Injectable()
export class AiQuoteRotation {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.(
    '(prefers-reduced-motion: reduce)',
  );
  private readonly reducedMotion = signal(this.media?.matches ?? false);
  private readonly hidden = signal(this.document.hidden);
  private readonly indexes = signal(AI_ARCHIVES.map(() => 0));
  readonly paused = signal(false);
  readonly autoPlaying = computed(() => !this.paused() && !this.reducedMotion() && !this.hidden());
  readonly archives = computed(() =>
    AI_ARCHIVES.map((archive, index) => ({
      ...archive,
      quote: archive.quotes[this.indexes()[index]],
      quoteNumber: this.indexes()[index] + 1,
    })),
  );

  constructor() {
    const onVisibilityChange = () => this.hidden.set(this.document.hidden);
    const onMotionChange = (event: MediaQueryListEvent) => this.reducedMotion.set(event.matches);
    this.document.addEventListener('visibilitychange', onVisibilityChange);
    this.media?.addEventListener?.('change', onMotionChange);
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener('visibilitychange', onVisibilityChange);
      this.media?.removeEventListener?.('change', onMotionChange);
    });

    effect((onCleanup) => {
      if (!this.autoPlaying()) return;
      const timer = setInterval(() => this.advance(), QUOTE_ROTATION_MS);
      onCleanup(() => clearInterval(timer));
    });
  }

  advance(archiveIndex?: number): void {
    this.indexes.update((indexes) =>
      indexes.map((value, index) =>
        archiveIndex === undefined || archiveIndex === index
          ? (value + 1) % AI_ARCHIVES[index].quotes.length
          : value,
      ),
    );
  }
}
