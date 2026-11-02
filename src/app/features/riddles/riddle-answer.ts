import { DOCUMENT } from '@angular/common';
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
import { ParticipantStore } from './participant-store';
import { RiddleAttempts } from './riddle-attempts';
import { RiddleSubmissions } from './riddle-submissions';
import { RiddleReplies } from './riddle-replies';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from './riddle-release';

@Component({
  selector: 'app-riddle-answer',
  imports: [FormsModule, RouterLink],
  templateUrl: './riddle-answer.html',
  styleUrl: './riddle-answer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleAnswer {
  readonly riddleId = input.required<string>();
  readonly hint = input('');
  private readonly browser = inject(DOCUMENT).defaultView;
  protected readonly game = inject(GameStore);
  protected readonly portal = inject(AiPortalState);
  protected readonly homePath = inject(RIDDLE_PREVIEW) ? RIDDLE_PREVIEW_PATH : '/';
  private readonly participants = inject(ParticipantStore);
  private readonly attempts = inject(RiddleAttempts);
  private readonly submissions = inject(RiddleSubmissions);
  private readonly replies = inject(RiddleReplies);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('successDialog');
  private readonly answerInput = viewChild<ElementRef<HTMLInputElement>>('answerInput');
  private readonly answerSection = viewChild<ElementRef<HTMLElement>>('answerSection');
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
  private readonly context = computed(
    () => `${this.riddleId()}:${this.game.round()?.id}:${this.participants.participant()?.id}`,
  );
  private readonly answerStorageKey = computed(
    () =>
      `jdl-riddle-answer-v1:${this.riddleId()}:${this.participants.participant()?.id ?? 'anonymous'}:${this.game.round()?.id ?? 'preview'}`,
  );
  private readonly storedAnswerState = signal<{ key: string; value: string | null }>({
    key: '',
    value: null,
  });
  protected readonly solvedAnswer = computed(() => {
    const state = this.storedAnswerState();
    if (state.key === this.answerStorageKey() && state.value) return state.value;
    const roundId = this.game.round()?.id;
    return (
      this.attempts
        .attempts()
        .find(
          (attempt) =>
            attempt.riddleId === this.riddleId() &&
            attempt.roundId === roundId &&
            attempt.kind === 'answer' &&
            attempt.correct,
        )?.answer ?? null
    );
  });

  constructor() {
    effect(() => {
      const key = this.answerStorageKey();
      this.storedAnswerState.set({ key, value: this.readStoredAnswer(key) });
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
    (this.answerInput()?.nativeElement ?? this.answerSection()?.nativeElement)?.focus();
  }
  protected async submit(): Promise<void> {
    if (this.busy() || !this.canEnterAnswer() || this.solved() || !this.draft().trim()) return;
    const context = this.context();
    const answer = this.draft().trim();
    this.busy.set(true);
    this.feedback.set(null);
    try {
      const correct = await this.submissions.submit(this.riddleId(), answer);
      if (context !== this.context()) return;
      if (correct) this.saveAnswer(answer);
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

  private saveAnswer(answer: string): void {
    const key = this.answerStorageKey();
    try {
      this.browser?.localStorage.setItem(key, answer);
    } catch {
      /* Mémoire de la page seulement. */
    }
    this.storedAnswerState.set({ key, value: answer });
  }

  private readStoredAnswer(key: string): string | null {
    try {
      const value = this.browser?.localStorage.getItem(key)?.trim() ?? '';
      return value || null;
    } catch {
      return null;
    }
  }
}
