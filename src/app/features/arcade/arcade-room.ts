import { afterNextRender, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, signal, viewChild } from '@angular/core';
import { PaperMorsio } from './paper-morsio';
import { DiabloTen } from './diablo-ten';
import { GoldBlind } from './gold-blind';
import { FinalFantaceasar } from './final-fantaceasar';

const CABINETS = [
  { id: 'morsio', title: 'Paper Morsio', pattern: '???' },
  { id: 'trainers', title: 'Pokemon Gold & Blind', pattern: '???' },
  { id: 'diablo', title: 'Diablo 10', pattern: '??' },
  { id: 'fantaceasar', title: 'Final Fantaceasar 9', pattern: '???' },
] as const;
type Cabinet = (typeof CABINETS)[number]['id'];

@Component({
  selector: 'app-arcade-room',
  imports: [PaperMorsio, DiabloTen, GoldBlind, FinalFantaceasar],
  templateUrl: './arcade-room.html',
  styleUrl: './arcade-room.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArcadeRoom {
  private readonly injector = inject(Injector);
  private readonly screen = viewChild.required<ElementRef<HTMLElement>>('screen');
  protected readonly cabinets = CABINETS;
  protected readonly selected = signal<Cabinet>('morsio');
  protected readonly current = computed(() => CABINETS.find((item) => item.id === this.selected())!);

  protected select(cabinet: Cabinet): void {
    this.selected.set(cabinet);
    afterNextRender({
      write: () => this.screen().nativeElement.querySelector<HTMLElement>('[arcadeControls]')?.focus({ preventScroll: true }),
    }, { injector: this.injector });
  }
}
