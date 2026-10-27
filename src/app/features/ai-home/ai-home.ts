import { DOCUMENT } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { EVENT } from '../../core/config/event.config';
import { countdownUntil } from '../../core/utils/countdown';
import { AiTakeover } from './ai-takeover';
import { AiDirectory } from './ai-directory';
import { AiTransmission } from './ai-transmission';
import { AiArchives } from './ai-archives';
import { AiQuoteRotation } from './ai-quote-rotation';
import { TitleLights } from '../home/lamp-title/title-lights';
import { RiddleAccess } from '../riddles/riddle-access';
import { RiddleGame } from '../riddles/riddle-game';
import { RiddleResults } from '../riddles/riddle-results';
import { AiPortalState } from './ai-portal-state';

type TakeoverStage = 'original' | 'intrusion' | 'complete';

@Component({
  selector: 'app-ai-home',
  imports: [
    AiTakeover,
    AiDirectory,
    AiTransmission,
    AiArchives,
    RiddleAccess,
    RiddleGame,
    RiddleResults,
  ],
  providers: [AiQuoteRotation],
  templateUrl: './ai-home.html',
  styleUrl: './ai-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiHome {
  private readonly portal = inject(AiPortalState);
  private readonly quoteRotation = inject(AiQuoteRotation);
  private readonly titleLights = inject(TitleLights);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly timers: ReturnType<typeof setTimeout>[] = [];
  private readonly pageTitle = viewChild<ElementRef<HTMLHeadingElement>>('pageTitle');
  private readonly riddleAccess = viewChild(RiddleAccess);
  private readonly riddleResults = viewChild(RiddleResults);
  private focusAfterTakeover = false;
  private readonly now = signal(Date.now());
  protected readonly event = EVENT;
  protected readonly stage = signal<TakeoverStage>(
    this.portal.revealed() ? 'complete' : 'original',
  );
  protected readonly animationsPaused = signal(false);
  protected readonly participantName = computed(
    () => this.riddleAccess()?.participantName() ?? null,
  );
  protected readonly gameHasRiddles = computed(() => this.riddleResults()?.hasRiddles() ?? false);
  protected readonly remaining = computed(() => countdownUntil(EVENT.newYearAt, this.now()));
  protected readonly units = computed(() => {
    const value = this.remaining();
    return [
      { label: 'jours', value: String(value.days).padStart(2, '0') },
      { label: 'heures', value: String(value.hours).padStart(2, '0') },
      { label: 'minutes', value: String(value.minutes).padStart(2, '0') },
      { label: 'secondes', value: String(value.seconds).padStart(2, '0') },
    ];
  });

  constructor() {
    effect(() => {
      if (this.stage() === 'original' && this.titleLights.lampWordOff()) {
        this.beginTakeover();
      }
    });
    effect(() => {
      const captured = this.stage() === 'complete';
      this.title.setTitle(
        captured ? 'Le Jour de l’AI — Votre party est en sursis' : 'Le Jour de Lampe — 2027',
      );
      this.meta.updateTag({ name: 'theme-color', content: captured ? '#100c23' : '#181c19' });
    });
    effect(() =>
      this.quoteRotation.paused.set(this.animationsPaused() || this.stage() !== 'complete'),
    );
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      this.clearTakeoverTimers();
    });

    afterRenderEffect(() => {
      if (this.stage() === 'complete' && this.focusAfterTakeover) {
        this.pageTitle()?.nativeElement.focus({ preventScroll: true });
        this.focusAfterTakeover = false;
      }
    });
  }

  protected beginTakeover(): void {
    if (!this.titleLights.lampWordOff() || this.stage() === 'intrusion') return;
    this.clearTakeoverTimers();
    this.focusAfterTakeover = true;
    this.stage.set('intrusion');
    this.browser?.scrollTo({ top: 0, behavior: 'instant' });
    if (this.prefersReducedMotion()) {
      this.finishTakeover();
      return;
    }
    this.timers.push(setTimeout(() => this.finishTakeover(), 3600));
  }

  protected finishTakeover(): void {
    if (this.stage() !== 'intrusion') return;
    this.clearTakeoverTimers();
    this.portal.revealed.set(true);
    this.stage.set('complete');
  }

  private clearTakeoverTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers.length = 0;
  }

  private prefersReducedMotion(): boolean {
    return this.browser?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
