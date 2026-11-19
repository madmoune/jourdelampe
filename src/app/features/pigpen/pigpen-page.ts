import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { PIGPEN_ID } from '../riddles/riddle-pages';
import { PigpenPlay } from './pigpen-play';

@Component({
  selector: 'app-pigpen-page',
  imports: [RiddlePage, PigpenPlay],
  template: `
    <app-riddle-page
      [riddleId]="riddleId"
      title="La porcherie"
      number="04"
      flavorText="Mes cochons ne parlent pas. Leurs enclos, par contre…"
      answerLabel="Réponse (7 lettres)"
    >
      <ng-template>
        <app-pigpen-play />
      </ng-template>
    </app-riddle-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PigpenPage {
  protected readonly riddleId = PIGPEN_ID;
}
