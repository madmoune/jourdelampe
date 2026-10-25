import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Home } from '../home/home';

@Component({
  selector: 'app-ai-takeover',
  imports: [Home],
  templateUrl: './ai-takeover.html',
  styleUrl: './ai-takeover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiTakeover {
  readonly stage = input.required<'original' | 'intrusion' | 'complete'>();
  readonly skip = output<void>();
}
