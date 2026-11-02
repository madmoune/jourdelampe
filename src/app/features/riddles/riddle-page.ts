import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiPortalState } from '../ai-home/ai-portal-state';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleAnswer } from './riddle-answer';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from './riddle-release';

/** Gabarit commun : titre, flavortext, réponse, puis contenu de l’énigme. */
@Component({
  selector: 'app-riddle-page',
  imports: [NgTemplateOutlet, RouterLink, RiddleAnswer],
  templateUrl: './riddle-page.html',
  styleUrl: './riddle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddlePage {
  readonly riddleId = input.required<string>();
  readonly title = input.required<string>();
  readonly flavorText = input.required<string>();
  readonly number = input('');
  readonly answerHint = input('');
  protected readonly content = contentChild.required(TemplateRef<unknown>);
  protected readonly homePath = inject(RIDDLE_PREVIEW) ? RIDDLE_PREVIEW_PATH : '/';
  protected readonly portal = inject(AiPortalState);
  protected readonly participants = inject(ParticipantStore);
  protected readonly game = inject(GameStore);
}
