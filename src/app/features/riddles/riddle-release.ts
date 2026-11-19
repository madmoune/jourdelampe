import { computed, DestroyRef, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { EVENT } from '../../core/config/event.config';

export const RIDDLE_PREVIEW = new InjectionToken<boolean>('RIDDLE_PREVIEW', {
  providedIn: 'root',
  factory: () => false,
});
export const RIDDLE_PREVIEW_PATH = '/apercu-ia';

export const RIDDLE_OPEN_EARLY = new InjectionToken<boolean>('RIDDLE_OPEN_EARLY', {
  providedIn: 'root',
  factory: () => EVENT.riddlesOpenEarly,
});

/** L’heure d’ouverture est fixée à Montréal, quel que soit le fuseau du navigateur. */
@Injectable({ providedIn: 'root' })
export class RiddleRelease {
  private readonly openEarly = inject(RIDDLE_OPEN_EARLY);
  private readonly now = signal(Date.now());
  readonly released = computed(() => this.openEarly || this.now() >= Date.parse(EVENT.riddlesOpenAt));

  constructor() {
    if (this.openEarly) return;
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}

export const requireRiddleRelease: CanMatchFn = () =>
  inject(RiddleRelease).released() || inject(Router).createUrlTree(['/']);
