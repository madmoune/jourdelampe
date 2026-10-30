import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { GameStore } from './game-store';
import { GameTimePipe } from './game-time.pipe';

@Component({
  selector: 'app-riddle-results',
  imports: [GameTimePipe],
  template: `
    @if (game.error()) {
      <p class="empty" role="alert">{{ game.error() }}</p>
    } @else if (!game.ready()) {
      <p class="empty" role="status">Chargement des résultats…</p>
    } @else if (!game.catalog().length) {
      <div class="results-empty">
        <span aria-hidden="true">⚑</span>
        <p>
          Aucun résultat pour l’instant.<br /><small>
            @if (participantName(); as name) {
              {{ name }}, ton espèce se vante de son intelligence. Le tableau attend encore une
              preuve.
            } @else {
              Les humains se disent intelligents. J’attends les résultats.
            }
          </small>
        </p>
        <span class="waiting-label">À VENIR</span>
      </div>
    } @else {
      <ul class="results" aria-live="polite">
        @for (riddle of game.riddles(); track riddle.id) {
          <li>
            <h3>{{ riddle.title }}</h3>
            @if (riddle.solutions.length) {
              <ul>
                @for (solution of riddle.solutions; track solution.participantId) {
                  <li>
                    <strong>{{ solution.participantName }}</strong
                    ><time [attr.datetime]="solution.solvedAt | gameTime: true">{{
                      solution.solvedAt | gameTime
                    }}</time>
                  </li>
                }
              </ul>
            } @else {
              <p>Non résolue</p>
            }
          </li>
        }
      </ul>
      <p class="meta">
        {{ game.metaUnlocked() ? 'Méta déverrouillé.' : 'Méta verrouillé.' }}
        {{ game.solvedCount() }} / {{ game.catalog().length }} énigmes résolues. Heures de Montréal.
      </p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .empty,
    .meta {
      padding: 17px 20px;
      margin: 0;
      font-size: 11px;
      color: #c9bad8;
    }
    .results-empty {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 17px 20px;
    }
    .results-empty > span:first-child {
      font-size: 27px;
      color: #a391b9;
    }
    .results-empty p {
      font-size: 12px;
      color: #d3c5df;
      margin: 0;
    }
    small {
      color: #b5a4c5;
      font-size: 10px;
    }
    .waiting-label {
      color: #a898bb;
      font-family: 'Courier New', monospace;
      font-size: 8px;
      white-space: nowrap;
      margin-left: auto;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .results {
      padding: 0 20px;
    }
    .results > li {
      padding: 16px 0;
      border-bottom: 1px dotted #6b5b83;
    }
    h3 {
      margin: 0 0 10px;
      font-size: 13px;
      color: #e5d8b5;
    }
    .results li li {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      padding: 5px 0;
      font-size: 11px;
    }
    strong {
      color: #dcff79;
    }
    time {
      font-variant-numeric: tabular-nums;
      color: #c9bad8;
    }
    .results p {
      margin: 0;
      color: #b5a4c5;
      font-size: 11px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiddleResults {
  readonly participantName = input<string | null>(null);
  protected readonly game = inject(GameStore);
  readonly hasRiddles = computed(() => this.game.catalog().length > 0);
}
