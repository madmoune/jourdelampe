import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { FOURCHETTE_ID } from '../riddles/riddle-pages';
import { FourchettePlay } from './fourchette-play';

@Component({
  selector: 'app-fourchette-page',
  imports: [RiddlePage, FourchettePlay],
  templateUrl: './fourchette-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FourchettePage {
  protected readonly riddleId = FOURCHETTE_ID;
}
