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
      flavorText="J’adore ces jeux presque autant que j’ai aimé Cypherpunk 2077."
    >
      <ng-template><app-arcade-room /></ng-template>
    </app-riddle-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArcadePage {
  protected readonly riddleId = ARCADE_ID;
}
