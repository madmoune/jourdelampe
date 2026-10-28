import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleAnswer } from './riddle-answer';
import { RIDDLE_PAGES } from './riddle-pages';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from './riddle-release';

@Component({
  selector: 'app-riddle-game',
  imports: [RouterLink, RiddleAnswer],
  templateUrl: './riddle-game.html',
  styleUrl: './riddle-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleGame {
  protected readonly pagePrefix = inject(RIDDLE_PREVIEW) ? RIDDLE_PREVIEW_PATH : '';
  protected readonly game = inject(GameStore);
  private readonly participants = inject(ParticipantStore);
  protected readonly name = computed(() => this.participants.participant()?.name ?? '');
  protected readonly pages = RIDDLE_PAGES;
}
