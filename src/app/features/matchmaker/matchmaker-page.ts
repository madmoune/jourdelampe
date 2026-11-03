import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { MATCHMAKER_ID } from '../riddles/riddle-pages';
import { MatchmakerPlay } from './matchmaker-play';

@Component({
  selector: 'app-matchmaker-page',
  imports: [RiddlePage, MatchmakerPlay],
  templateUrl: './matchmaker-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchmakerPage {
  protected readonly riddleId = MATCHMAKER_ID;
}
