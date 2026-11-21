import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { SUDOKU_ID } from '../riddles/riddle-pages';
import { SudokuPlay } from './sudoku-play';

@Component({
  selector: 'app-sudoku-page',
  imports: [RiddlePage, SudokuPlay],
  template: `
    <app-riddle-page
      [riddleId]="riddleId"
      title="Sudoquoi?"
      flavorTextHtml="Quand on est dans de beaux <strong>draps</strong>, faut pas y laisser sa <strong>peau</strong>."
      answerLabel="Réponse (9 lettres)"
    >
      <ng-template>
        <app-sudoku-play />
      </ng-template>
    </app-riddle-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SudokuPage {
  protected readonly riddleId = SUDOKU_ID;
}
