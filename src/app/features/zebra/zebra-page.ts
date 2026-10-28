import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiPortalState } from '../ai-home/ai-portal-state';
import { ParticipantStore } from '../riddles/participant-store';
import { ZebraPlay } from './zebra-play';
import { RIDDLE_PREVIEW, RIDDLE_PREVIEW_PATH } from '../riddles/riddle-release';

@Component({
  selector: 'app-zebra-page',
  imports: [RouterLink, ZebraPlay],
  templateUrl: './zebra-page.html',
  styleUrl: './zebra-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZebraPage {
  protected readonly homePath = inject(RIDDLE_PREVIEW) ? RIDDLE_PREVIEW_PATH : '/';
  protected readonly portal = inject(AiPortalState);
  protected readonly participants = inject(ParticipantStore);
}
