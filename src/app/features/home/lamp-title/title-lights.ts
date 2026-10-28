import { computed, Injectable, signal } from '@angular/core';
import { EVENT } from '../../../core/config/event.config';

const REQUIRED_LIGHTS = [...EVENT.name.replaceAll(' ', '')].map(
  (letter) => letter === letter.toUpperCase(),
);

export const TITLE_ROWS = [
  [
    [
      { id: 0, character: 'L' },
      { id: 1, character: 'E' },
    ],
    [
      { id: 2, character: 'J' },
      { id: 3, character: 'O' },
      { id: 4, character: 'U' },
      { id: 5, character: 'R' },
    ],
  ],
  [
    [
      { id: 6, character: 'D' },
      { id: 7, character: 'E' },
    ],
    [
      { id: 8, character: 'L' },
      { id: 9, character: 'A' },
      { id: 10, character: 'M' },
      { id: 11, character: 'P' },
      { id: 12, character: 'E' },
    ],
  ],
] as const;

/** État partagé des treize ampoules et condition de la prise de contrôle. */
@Injectable({ providedIn: 'root' })
export class TitleLights {
  private readonly state = signal<readonly boolean[]>(TITLE_ROWS.flat(2).map(() => true));
  readonly lights = this.state.asReadonly();
  // Les majuscules de « Le JouR de LAmpe » sont allumées, les minuscules éteintes.
  readonly combinationMatched = computed(() =>
    this.lights().every((on, index) => on === REQUIRED_LIGHTS[index]),
  );
  // Ordre de lecture : LE JOUR / DE LAMPE.
  readonly pattern = computed(() =>
    this.lights()
      .map((on) => (on ? '1' : '0'))
      .join(''),
  );

  toggle(id: number): void {
    this.state.update((lights) => lights.map((on, index) => (index === id ? !on : on)));
  }
}
