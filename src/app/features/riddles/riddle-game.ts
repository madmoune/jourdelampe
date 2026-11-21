import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { injectMetaUnlocked, PlayerProgress } from './player-progress';
import { RiddleAnswer } from './riddle-answer';
import { RiddleSpoiler } from './riddle-spoiler';
import {
  ARCADE_ID,
  MANCHETTES_ID,
  META_ID,
  PIGPEN_ID,
  RIDDLE_COUNT,
  RIDDLE_PAGES,
  riddlePage,
  SENS_DESSUS_DESSOUS_ID,
  SUDOKU_ID,
} from './riddle-pages';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from './riddle-release';
import { RiddleResults } from './riddle-results';

const PREVIEW_RIDDLES = [
  {
    id: PIGPEN_ID,
    title: RIDDLE_PAGES[PIGPEN_ID].title,
    prompt:
      'Sept enclos à remplir. Aperçu des grilles; la réponse finale n’est pas encore configurée.',
    order: 3,
  },
  {
    id: SUDOKU_ID,
    title: RIDDLE_PAGES[SUDOKU_ID].title,
    prompt: 'Un sudoku et neuf poses à déchiffrer. Aperçu du dossier.',
    order: 4,
  },
  {
    id: MANCHETTES_ID,
    title: RIDDLE_PAGES[MANCHETTES_ID].title,
    prompt: 'Des mots croisés et un terrain miné. Aperçu du dossier.',
    order: 5,
  },
  {
    id: ARCADE_ID,
    title: RIDDLE_PAGES[ARCADE_ID].title,
    prompt: 'Quatre jeux, quatre objectifs. Aperçu du dossier.',
    order: 6,
  },
  {
    id: SENS_DESSUS_DESSOUS_ID,
    title: RIDDLE_PAGES[SENS_DESSUS_DESSOUS_ID].title,
    prompt: '',
    order: 7,
  },
];

@Component({
  selector: 'app-riddle-game',
  imports: [RouterLink, RiddleAnswer, RiddleSpoiler, RiddleResults],
  templateUrl: './riddle-game.html',
  styleUrl: './riddle-game.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleGame {
  readonly canPlay = input(false);
  private readonly preview = inject(RIDDLE_PREVIEW);
  protected readonly pagePrefix = this.preview ? RIDDLE_PREVIEW_PATH : '';
  protected readonly game = inject(GameStore);
  protected readonly progress = inject(PlayerProgress);
  private readonly participants = inject(ParticipantStore);
  protected readonly pageFor = riddlePage;
  protected readonly metaId = META_ID;
  protected readonly metaPage = RIDDLE_PAGES[META_ID];
  protected readonly metaUnlocked = injectMetaUnlocked();
  protected readonly total = computed(() => Math.max(RIDDLE_COUNT, this.progress.riddles().length));
  protected readonly slots = computed(() => {
    const riddles = this.progress.riddles();
    const slots = Array.from({ length: this.total() }, (_, index) => riddles.at(index) ?? null);
    if (this.preview) {
      for (const draft of PREVIEW_RIDDLES) {
        if (slots.at(-1) !== null || riddles.some((riddle) => riddle.id === draft.id)) continue;
        slots.splice(draft.order, 0, {
          ...draft,
          solutions: [],
          solvedByMe: false,
          infoUnlocked: false,
        });
        slots.pop();
      }
    }
    return slots;
  });
  protected readonly revealContext = computed(
    () => `${this.participants.participant()?.id}:${this.game.round()?.id}:${this.game.mode()}`,
  );
}
