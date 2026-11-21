import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  TemplateRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GameStore } from './game-store';
import { ParticipantStore } from './participant-store';
import { RiddleAnswer } from './riddle-answer';
import { riddlePage, RIDDLE_LIST_PATH } from './riddle-pages';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from './riddle-release';

/** Gabarit commun aux titres, textes d’ambiance et formulaires de réponse. */
@Component({
  selector: 'app-riddle-page',
  imports: [NgTemplateOutlet, RouterLink, RiddleAnswer],
  templateUrl: './riddle-page.html',
  styleUrls: ['./riddle-layout.scss', './riddle-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddlePage {
  readonly riddleId = input.required<string>();
  readonly title = input('');
  readonly flavorText = input('');
  readonly flavorTextHtml = input('');
  readonly answerLabel = input('Réponse');
  readonly answerHint = input('');
  readonly accessNotice = input('');
  protected readonly pageTitle = computed(
    () => this.title() || riddlePage(this.riddleId())?.title || 'Énigme',
  );
  protected readonly content = contentChild.required(TemplateRef<unknown>);
  protected readonly listPath =
    (inject(RIDDLE_PREVIEW) ? RIDDLE_PREVIEW_PATH : '') + RIDDLE_LIST_PATH;
  protected readonly participants = inject(ParticipantStore);
  protected readonly game = inject(GameStore);
  protected readonly router = inject(Router);
}
