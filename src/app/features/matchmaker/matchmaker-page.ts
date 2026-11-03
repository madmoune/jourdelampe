import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { MATCHMAKER_ID } from '../riddles/riddle-pages';

@Component({
  selector: 'app-matchmaker-page',
  imports: [RiddlePage],
  templateUrl: './matchmaker-page.html',
  styleUrl: './matchmaker-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchmakerPage {
  protected readonly riddleId = MATCHMAKER_ID;
}
