import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'aside[appAiDirectory]',
  templateUrl: './ai-directory.html',
  styleUrl: './ai-directory.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'left-sidebar', 'aria-label': 'Répertoire et état du site' },
})
export class AiDirectory {}
