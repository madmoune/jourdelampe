import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Directive, ElementRef, inject, input, output, signal } from '@angular/core';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameKey = Direction | 'a' | 'b';
export interface GameInput {
  key: GameKey;
  source: string;
  pressed: boolean;
  repeat?: boolean;
}

export const DIRECTIONS: Record<Direction, readonly [number, number]> = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0],
};

export function isDirection(key: GameKey): key is Direction {
  return key !== 'a' && key !== 'b';
}

const KEYBOARD: Readonly<Record<string, GameKey | undefined>> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', a: 'left', s: 'down', d: 'right',
  ' ': 'a', Enter: 'a', z: 'a', x: 'b', Escape: 'b',
};

const MOUSE_BUTTONS = [{ mask: 1, key: 'a' }, { mask: 2, key: 'b' }] as const;

export class HeldButtons {
  private readonly sources = new Map<string, GameKey>();
  private readonly taps = new Set<Direction>();

  update(event: GameInput): void {
    if (event.pressed) {
      this.sources.set(event.source, event.key);
      if (isDirection(event.key)) this.taps.add(event.key);
    } else {
      this.sources.delete(event.source);
    }
  }

  has(key: GameKey): boolean {
    return [...this.sources.values()].includes(key);
  }

  axes(): [number, number] {
    const active = (key: Direction) => Number(this.taps.has(key) || this.has(key));
    const x = active('right') - active('left');
    const y = active('down') - active('up');
    this.taps.clear();
    return [x, y];
  }

  clear(): void {
    this.sources.clear();
    this.taps.clear();
  }
}

@Directive({
  selector: '[arcadeControls]',
  host: {
    '(keydown)': 'press($event)',
    '(keyup)': 'release($event)',
    '(pointerdown)': 'pressMouse($event)',
    '(pointermove)': 'moveMouse($event)',
    '(pointerup)': 'releaseMouse($event)',
    '(pointercancel)': 'releaseMouse($event)',
    '(lostpointercapture)': 'releaseMouse($event)',
    '(contextmenu)': 'contextMenu($event)',
    '(focusout)': 'blur($event)',
    '(window:blur)': 'clear()',
  },
})
export class ArcadeControls {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly keys = new Map<string, GameKey>();
  private mousePointer: number | null = null;
  private mouseButtons = 0;
  readonly gameInput = output<GameInput>();

  protected press(event: KeyboardEvent): void {
    const key = KEYBOARD[event.key] ?? KEYBOARD[event.key.toLowerCase()];
    const activation = event.key === 'Enter' || event.key === ' ';
    if (!key || event.altKey || event.ctrlKey || event.metaKey ||
        (activation && (event.target as HTMLElement).closest('button, a'))) return;
    event.preventDefault();
    const source = 'key:' + (event.code || event.key);
    this.keys.set(source, key);
    this.gameInput.emit({ key, source, pressed: true, repeat: event.repeat });
  }

  protected release(event: KeyboardEvent): void {
    const source = 'key:' + (event.code || event.key);
    const key = this.keys.get(source);
    if (!key) return;
    event.preventDefault();
    this.keys.delete(source);
    this.gameInput.emit({ key, source, pressed: false });
  }

  protected pressMouse(event: PointerEvent): void {
    if (event.pointerType !== 'mouse' || (event.button !== 0 && event.button !== 2)) return;
    const field = this.playfield(event);
    if (!field) return;
    event.preventDefault();
    this.host.focus({ preventScroll: true });
    field.setPointerCapture?.(event.pointerId);
    this.mousePointer = event.pointerId;
    this.syncMouseButtons(event.buttons);
  }

  protected moveMouse(event: PointerEvent): void {
    if (this.mousePointer === event.pointerId) this.syncMouseButtons(event.buttons);
  }

  protected releaseMouse(event: PointerEvent): void {
    if (this.mousePointer !== event.pointerId) return;
    this.mousePointer = null;
    this.syncMouseButtons(0);
  }

  protected contextMenu(event: MouseEvent): void {
    if (event.button === 2 && this.playfield(event)) event.preventDefault();
  }

  protected blur(event: FocusEvent): void {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.clear();
  }

  protected clear(): void {
    for (const [source, key] of this.keys) this.gameInput.emit({ key, source, pressed: false });
    this.keys.clear();
    this.mousePointer = null;
    this.syncMouseButtons(0);
  }

  private playfield(event: MouseEvent): Element | null {
    if (!(event.target instanceof Element) ||
      event.target.closest('button, a, input, select, textarea, [contenteditable]')) return null;
    return event.target.closest('[data-arcade-playfield]');
  }

  private syncMouseButtons(buttons: number): void {
    const changed = this.mouseButtons ^ buttons;
    this.mouseButtons = buttons;
    for (const { mask, key } of MOUSE_BUTTONS) {
      if (changed & mask) this.gameInput.emit({ key, pressed: !!(buttons & mask), source: 'mouse:' + key });
    }
  }
}

@Component({
  selector: 'app-arcade-gamepad',
  templateUrl: './gamepad.html',
  styleUrl: './gamepad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:blur)': 'clear()' },
})
export class Gamepad {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly pointers = new Map<number, { key: GameKey; timer?: number }>();
  private readonly virtual = new Map<GameKey, number>();
  protected readonly active = signal<ReadonlySet<GameKey>>(new Set());
  protected readonly keys = [
    { id: 'up', icon: '▲', label: 'Haut' },
    { id: 'left', icon: '◀', label: 'Gauche' },
    { id: 'right', icon: '▶', label: 'Droite' },
    { id: 'down', icon: '▼', label: 'Bas' },
  ] as const;
  readonly vertical = input(true);
  readonly repeat = input(false);
  readonly labelA = input.required<string>();
  readonly labelB = input.required<string>();
  readonly control = output<GameInput>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  protected begin(event: PointerEvent, key: GameKey): void {
    if (event.button !== 0) return;
    event.preventDefault();
    const id = event.pointerId;
    (event.currentTarget as HTMLButtonElement).setPointerCapture?.(id);
    const press: { key: GameKey; timer?: number } = { key };
    this.pointers.set(id, press);
    this.updateActive();
    this.control.emit({ key, source: 'pointer:' + id, pressed: true });
    if (this.repeat() && isDirection(key)) {
      const repeat = () => {
        if (!this.pointers.has(id)) return;
        this.control.emit({ key, source: 'pointer:' + id, pressed: true, repeat: true });
        press.timer = this.browser?.setTimeout(repeat, 130);
      };
      press.timer = this.browser?.setTimeout(repeat, 230);
    }
  }

  protected end(id: number): void {
    const press = this.pointers.get(id);
    if (!press) return;
    this.browser?.clearTimeout(press.timer);
    this.pointers.delete(id);
    this.updateActive();
    this.control.emit({ key: press.key, source: 'pointer:' + id, pressed: false });
  }

  protected click(event: MouseEvent, key: GameKey): void {
    if (event.detail) return;
    const source = 'button:' + key;
    this.control.emit({ key, source, pressed: true });
    if (this.browser && isDirection(key)) {
      this.browser.clearTimeout(this.virtual.get(key));
      this.virtual.set(key, this.browser.setTimeout(() => this.releaseVirtual(key), 100));
    } else {
      this.control.emit({ key, source, pressed: false });
    }
  }

  protected clear(): void {
    for (const id of this.pointers.keys()) this.end(id);
    for (const key of this.virtual.keys()) this.releaseVirtual(key);
  }

  private releaseVirtual(key: GameKey): void {
    this.browser?.clearTimeout(this.virtual.get(key));
    this.virtual.delete(key);
    this.control.emit({ key, source: 'button:' + key, pressed: false });
  }

  private updateActive(): void {
    this.active.set(new Set([...this.pointers.values()].map(({ key }) => key)));
  }
}
