import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { FOURCHETTE_ID } from '../riddles/riddle-pages';

@Component({
  selector: 'app-fourchette-page',
  imports: [RiddlePage],
  templateUrl: './fourchette-page.html',
  styleUrl: './fourchette-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FourchettePage {
  protected readonly riddleId = FOURCHETTE_ID;
}
