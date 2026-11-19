import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { PlayerProgress } from './player-progress';
import { RiddleAnswer } from './riddle-answer';
import { RiddleSpoiler } from './riddle-spoiler';
import { META_ID, RIDDLE_COUNT, RIDDLE_PAGES } from './riddle-pages';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from './riddle-release';
import { RiddleResults } from './riddle-results';

@Component({
  selector: 'app-riddle-game',
  imports: [RouterLink, RiddleAnswer, RiddleSpoiler, RiddleResults],
  templateUrl: './riddle-game.html',
  styleUrl: './riddle-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleGame {
  readonly canPlay = input(false);
  protected readonly pagePrefix = inject(RIDDLE_PREVIEW) ? RIDDLE_PREVIEW_PATH : '';
  protected readonly game = inject(GameStore);
  protected readonly progress = inject(PlayerProgress);
  private readonly participants = inject(ParticipantStore);
  protected readonly pages = RIDDLE_PAGES;
  protected readonly metaId = META_ID;
  protected readonly total = computed(() => Math.max(RIDDLE_COUNT, this.progress.riddles().length));
  protected readonly slots = computed(() =>
    Array.from({ length: this.total() }, (_, index) => this.progress.riddles().at(index) ?? null),
  );
  protected readonly revealContext = computed(
    () => `${this.participants.participant()?.id}:${this.game.round()?.id}:${this.game.mode()}`,
  );
}
