import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GameStore } from '../riddles/game-store';
import { ParticipantStore } from '../riddles/participant-store';
import { injectMetaUnlocked } from '../riddles/player-progress';
import { RiddlePage } from '../riddles/riddle-page';
import { META_ID } from '../riddles/riddle-pages';
import { MetaGrid } from './meta-grid';

@Component({
  selector: 'app-meta-page',
  imports: [MetaGrid, RiddlePage],
  template: `
    <app-riddle-page
      [riddleId]="riddleId"
      [accessNotice]="accessNotice()"
      flavorText="Place les réponses des huit énigmes dans la grille."
    >
      <ng-template><app-meta-grid /></ng-template>
    </app-riddle-page>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaPage {
  protected readonly riddleId = META_ID;
  private readonly unlocked = injectMetaUnlocked();
  private readonly game = inject(GameStore);
  private readonly participants = inject(ParticipantStore);
  protected readonly accessNotice = computed(() => {
    if (this.unlocked()) return '';
    if (this.game.error()) return this.game.error();
    if (!this.game.ready() || this.participants.loading()) return 'Chargement de l’énigme…';
    return 'Résous les huit énigmes pour ouvrir le dossier final.';
  });
}
