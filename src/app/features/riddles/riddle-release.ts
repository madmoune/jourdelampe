import { computed, DestroyRef, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { EVENT } from '../../core/config/event.config';

export const RIDDLE_PREVIEW = new InjectionToken<boolean>('RIDDLE_PREVIEW', {
  providedIn: 'root',
  factory: () => false,
});
export const RIDDLE_PREVIEW_PATH = '/apercu-ia';

/** L’heure d’ouverture est fixée à Montréal, quel que soit le fuseau du navigateur. */
@Injectable({ providedIn: 'root' })
export class RiddleRelease {
  private readonly now = signal(Date.now());
  readonly released = computed(() => this.now() >= Date.parse(EVENT.riddlesOpenAt));

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}

export const requireRiddleRelease: CanMatchFn = () =>
  inject(RiddleRelease).released() || inject(Router).createUrlTree(['/']);
