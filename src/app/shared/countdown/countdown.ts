import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { countdownUntil } from '../../core/utils/countdown';

@Component({
  selector: 'app-countdown',
  template: `
    @if (remaining().complete) {
      <p class="celebrate">2027</p>
    } @else {
      <div class="countdown" role="timer" aria-label="Temps restant avant la nouvelle année">
        @for (unit of units(); track unit.label) {
          <div class="unit">
            <span class="number">{{ unit.value }}</span
            ><span class="label">{{ unit.label }}</span>
          </div>
          @if (!$last) {
            <span class="separator" aria-hidden="true">:</span>
          }
        }
      </div>
    }
  `,
  styles: `
    .countdown {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      gap: clamp(18px, 4vw, 56px);
    }
    .unit {
      display: grid;
      gap: 9px;
      min-width: 70px;
      text-align: center;
    }
    .number {
      font-family: var(--display-font);
      font-size: clamp(44px, 5.8vw, 76px);
      font-weight: 500;
      line-height: 1;
      letter-spacing: -0.065em;
      font-variant-numeric: tabular-nums;
    }
    .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      color: #686d61;
    }
    .separator {
      font-family: var(--display-font);
      font-size: 40px;
      line-height: 1.5;
      color: #c7c8ba;
    }
    .celebrate {
      text-align: center;
      font-family: var(--display-font);
      font-size: 32px;
    }
    .celebrate span {
      display: block;
    }
    @media (max-width: 600px) {
      .countdown {
        gap: 8px;
      }
      .unit {
        min-width: 52px;
      }
      .number {
        font-size: 42px;
      }
      .separator {
        font-size: 26px;
      }
      .label {
        font-size: 8px;
        letter-spacing: 0.08em;
      }
    }
    @media (max-width: 370px) {
      .countdown {
        gap: 5px;
      }
      .unit {
        min-width: 44px;
      }
      .number {
        font-size: 38px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Countdown {
  readonly target = input.required<string>();
  private readonly now = signal(Date.now());
  protected readonly remaining = computed(() => countdownUntil(this.target(), this.now()));
  protected readonly units = computed(() => {
    const value = this.remaining();
    return [
      { label: 'jours', value: String(value.days).padStart(2, '0') },
      { label: 'heures', value: String(value.hours).padStart(2, '0') },
      { label: 'minutes', value: String(value.minutes).padStart(2, '0') },
      { label: 'secondes', value: String(value.seconds).padStart(2, '0') },
    ];
  });

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
