import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-up-right'
  | 'arrow-right'
  | 'arrow-down'
  | 'lamp'
  | 'calendar'
  | 'pin'
  | 'plus'
  | 'check'
  | 'menu'
  | 'close'
  | 'spark'
  | 'clock';

const PATHS: Record<IconName, string> = {
  'arrow-up-right': 'M6 18 18 6M6 6h12v12',
  'arrow-right': 'M4 12h16m-6-6 6 6-6 6',
  'arrow-down': 'M12 4v16m-6-6 6 6 6-6',
  lamp: 'M7 3h10l4 10H3L7 3Zm5 10v8m-5 0h10M18 13v4',
  calendar:
    'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4 4L19 6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M6 18 18 6',
  spark: 'm12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
};

@Component({
  selector: 'app-icon',
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name()]" /></svg>',
  styles:
    ':host { display: inline-flex; width: 21px; height: 21px; flex-shrink: 0; } svg { width: 100%; height: 100%; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
  protected readonly paths = PATHS;
}
