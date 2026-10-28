import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'aside[appAiDirectory]',
  imports: [RouterLink],
  templateUrl: './ai-directory.html',
  styleUrl: './ai-directory.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'left-sidebar', 'aria-label': 'Répertoire et état du site' },
})
export class AiDirectory {
  readonly riddlesVisible = input(true);
}
