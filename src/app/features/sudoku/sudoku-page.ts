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
      title="La vigie"
      number="05"
      flavorText="Je vous ai laissé quelques chiffres. Pour le reste, levez les yeux vers les drapeaux."
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
