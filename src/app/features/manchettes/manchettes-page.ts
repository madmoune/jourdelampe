import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { MANCHETTES_ID } from '../riddles/riddle-pages';
import { ManchettesPlay } from './manchettes-play';

@Component({
  selector: 'app-manchettes-page',
  imports: [RiddlePage, ManchettesPlay],
  template: `
    <app-riddle-page
      [riddleId]="riddleId"
      title="En manchettes"
      number="06"
      flavorText="Actualité, culture, sport et divertissement : des références à retrouver. Attention où tu mets les pieds."
      answerLabel="Réponse (14 lettres)"
    >
      <ng-template>
        <app-manchettes-play />
      </ng-template>
    </app-riddle-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManchettesPage {
  protected readonly riddleId = MANCHETTES_ID;
}
