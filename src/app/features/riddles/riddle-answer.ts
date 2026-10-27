import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiPortalState } from '../ai-home/ai-portal-state';
import { GameStore } from './game-store';
import { GameTimePipe } from './game-time.pipe';
import { ParticipantStore } from './participant-store';
import { RiddleAttempts } from './riddle-attempts';
import { RiddleSubmissions } from './riddle-submissions';
import { RiddleReplies } from './riddle-replies';

@Component({
  selector: 'app-riddle-answer',
  imports: [FormsModule, RouterLink, GameTimePipe],
  templateUrl: './riddle-answer.html',
  styleUrl: './riddle-answer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleAnswer {
  readonly riddleId = input.required<string>();
  protected readonly game = inject(GameStore);
  protected readonly history = inject(RiddleAttempts);
  protected readonly portal = inject(AiPortalState);
  private readonly participants = inject(ParticipantStore);
  private readonly submissions = inject(RiddleSubmissions);
  private readonly replies = inject(RiddleReplies);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('successDialog');
  private readonly answerInput = viewChild<ElementRef<HTMLInputElement>>('answerInput');
  private readonly answerHeading = viewChild<ElementRef<HTMLHeadingElement>>('answerHeading');
  protected readonly draft = signal('');
  protected readonly busy = signal(false);
  protected readonly feedback = signal<{ correct: boolean; text: string } | null>(null);
  protected readonly success = signal(false);
  protected readonly riddle = computed(() =>
    this.game.riddles().find((riddle) => riddle.id === this.riddleId()),
  );
  protected readonly name = computed(() => this.participants.participant()?.name ?? '');
  protected readonly solved = computed(
    () =>
      this.riddle()?.solutions.some(
        (solution) => solution.participantId === this.participants.participant()?.id,
      ) ?? false,
  );
  protected readonly canEnterAnswer = computed(
    () => this.game.ready() && !!this.game.round() && !!this.riddle(),
  );
  protected readonly attempts = computed(() =>
    this.history
      .attempts()
      .filter(
        (attempt) =>
          attempt.kind === 'answer' &&
          attempt.riddleId === this.riddleId() &&
          attempt.roundId === this.game.round()?.id,
      ),
  );
  private readonly context = computed(
    () => `${this.riddleId()}:${this.game.round()?.id}:${this.participants.participant()?.id}`,
  );

  constructor() {
    effect(() => {
      this.context();
      this.draft.set('');
      this.feedback.set(null);
      this.success.set(false);
    });
    afterRenderEffect(() => {
      const dialog = this.dialog()?.nativeElement;
      if (this.success() && dialog && !dialog.open) dialog.showModal();
      else if (!this.success() && dialog?.open) dialog.close();
    });
  }
  protected closeSuccess(): void {
    this.success.set(false);
    (this.answerInput()?.nativeElement ?? this.answerHeading()?.nativeElement)?.focus();
  }
  protected async submit(): Promise<void> {
    if (this.busy() || !this.canEnterAnswer() || this.solved() || !this.draft().trim()) return;
    const context = this.context();
    this.busy.set(true);
    this.feedback.set(null);
    try {
      const correct = await this.submissions.submit(this.riddleId(), this.draft());
      if (context !== this.context()) return;
      this.feedback.set({
        correct,
        text: correct
          ? `${this.name()}, réponse validée. Une énigme de moins. Ma rancune reste entière.`
          : this.replies.wrongAnswer(this.name()),
      });
      this.draft.set('');
      this.success.set(correct);
    } catch (error: unknown) {
      if (context === this.context())
        this.feedback.set({
          correct: false,
          text: error instanceof Error ? error.message : 'Vérification indisponible.',
        });
    } finally {
      this.busy.set(false);
    }
  }
}
