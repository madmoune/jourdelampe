import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RiddlePage } from '../riddles/riddle-page';
import { ZEBRA_ID } from '../riddles/riddle-pages';
import { ZebraPlay } from './zebra-play';

@Component({
  selector: 'app-zebra-page',
  imports: [RiddlePage, ZebraPlay],
  templateUrl: './zebra-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZebraPage {
  protected readonly riddleId = ZEBRA_ID;
  protected readonly flavorText =
    "Le nom de famille d'une personne nous dit bien des choses sur celle-ci, surtout lorsqu'on connait sa position.";
}
