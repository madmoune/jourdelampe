import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { ARCADE_ID } from '../riddles/riddle-pages';
import { ArcadeRoom } from './arcade-room';

@Component({
  selector: 'app-arcade-page',
  imports: [RiddlePage, ArcadeRoom],
  template: `
    <app-riddle-page
      [riddleId]="riddleId"
      title="Salle d’arcade"
      number="07"
    >
      <ng-template><app-arcade-room /></ng-template>
    </app-riddle-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArcadePage {
  protected readonly riddleId = ARCADE_ID;
}
