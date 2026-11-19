import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiPortalState } from '../ai-home/ai-portal-state';
import { RiddleAccess } from './riddle-access';
import { RiddleGame } from './riddle-game';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from './riddle-release';

@Component({
  selector: 'app-riddle-hub',
  imports: [RouterLink, RiddleAccess, RiddleGame],
  templateUrl: './riddle-hub.html',
  styleUrls: ['./riddle-page.scss', './riddle-hub.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleHub {
  protected readonly homePath = inject(RIDDLE_PREVIEW) ? RIDDLE_PREVIEW_PATH : '/';
  protected readonly portal = inject(AiPortalState);
}
