import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TITLE_ROWS, TitleLights } from './title-lights';

const GLYPHS: Record<string, string> = {
  L: 'M18 14V75H58',
  E: 'M58 14H18V75H58M18 44H52',
  J: 'M22 14H58V57C58 83 17 83 17 59',
  O: 'M38 12C10 12 11 33 11 44C11 56 10 77 38 77C66 77 65 56 65 44C65 33 66 12 38 12Z',
  U: 'M14 14V53C14 85 62 85 62 53V14',
  R: 'M16 75V14H39C70 14 70 45 39 45H16M39 45L63 75',
  D: 'M16 14V75H34C73 75 73 14 34 14H16Z',
  A: 'M10 75L34 14H42L66 75M21 49H55',
  M: 'M12 75V14L38 49L64 14V75',
  P: 'M16 75V14H39C71 14 71 47 39 47H16',
};

@Component({
  selector: 'app-lamp-title',
  templateUrl: './lamp-title.html',
  styleUrl: './lamp-title.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LampTitle {
  protected readonly rows = TITLE_ROWS;
  protected readonly glyphs = GLYPHS;
  protected readonly titleLights = inject(TitleLights);
}
