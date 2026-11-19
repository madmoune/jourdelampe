import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GameTimePipe } from './game-time.pipe';
import type { RiddleSolution } from './game.model';

@Component({
  selector: 'app-riddle-results',
  imports: [GameTimePipe],
  template: `
    <ul aria-label="Résolutions (heure de Montréal)">
      @for (solution of solutions(); track solution.participantId) {
        <li>
          <strong>{{ solution.participantName }}</strong>
          <time [attr.datetime]="solution.solvedAt | gameTime: true">
            {{ solution.solvedAt | gameTime }}
          </time>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: 14px;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      display: flex;
      flex-wrap: wrap;
      gap: 2px 10px;
      padding: 5px 0;
      color: #e4dcee;
    }
    time {
      color: #c9bad8;
      font-variant-numeric: tabular-nums;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleResults {
  readonly solutions = input.required<readonly RiddleSolution[]>();
}
