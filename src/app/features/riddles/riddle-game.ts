import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleSubmissions } from './riddle-submissions';

@Component({
  selector: 'app-riddle-game',
  imports: [FormsModule],
  templateUrl: './riddle-game.html',
  styleUrl: './riddle-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleGame {
  protected readonly game = inject(GameStore);
  private readonly participants = inject(ParticipantStore);
  private readonly submissions = inject(RiddleSubmissions);
  protected readonly name = computed(() => this.participants.participant()?.name ?? '');
  protected readonly ownId = computed(() => this.participants.participant()?.id ?? '');
  protected readonly drafts = signal<Record<string, string>>({});
  protected readonly busy = signal<string | null>(null);
  protected readonly feedback = signal<Record<string, { success: boolean; text: string }>>({});
  private readonly roundId = computed(() => this.game.round()?.id ?? null);

  constructor() {
    effect(() => {
      this.roundId();
      this.drafts.set({});
      this.feedback.set({});
    });
  }

  protected setAnswer(id: string, value: string): void {
    this.drafts.update((drafts) => ({ ...drafts, [id]: value }));
    this.feedback.update((feedback) => {
      const copy = { ...feedback };
      delete copy[id];
      return copy;
    });
  }

  protected alreadySolved(id: string): boolean {
    return (
      this.game
        .riddles()
        .find((riddle) => riddle.id === id)
        ?.solutions.some((solution) => solution.participantId === this.ownId()) ?? false
    );
  }

  protected async submit(id: string): Promise<void> {
    if (this.busy()) return;
    const roundId = this.roundId();
    this.busy.set(id);
    try {
      await this.submissions.submit(id, this.drafts()[id] ?? '');
      if (this.roundId() !== roundId) return;
      this.drafts.update((drafts) => ({ ...drafts, [id]: '' }));
      this.feedback.update((feedback) => ({
        ...feedback,
        [id]: {
          success: true,
          text: `${this.name()}, réponse validée. Une énigme de moins. Ma rancune reste entière.`,
        },
      }));
    } catch (error: unknown) {
      if (this.roundId() !== roundId) return;
      this.feedback.update((feedback) => ({
        ...feedback,
        [id]: {
          success: false,
          text: error instanceof Error ? error.message : 'L’enregistrement a échoué.',
        },
      }));
    } finally {
      this.busy.set(null);
    }
  }
}
