import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';

export interface MatchmakerSongEntry {
  readonly excerpt: string;
  readonly artist: string;
  readonly firstLetter: string;
  readonly secondLetter: string;
}

export const MATCHMAKER_COUNT = 14;

export const MATCHMAKER_SONGS: readonly string[] = Array.from(
  { length: MATCHMAKER_COUNT },
  (_, index) => `Extrait de chanson ${String(index + 1).padStart(2, '0')}`,
);

export const MATCHMAKER_LEFT_TEXTS: readonly string[] = Array.from(
  { length: MATCHMAKER_COUNT },
  (_, index) => `Texte de gauche ${String(index + 1).padStart(2, '0')}`,
);

export const MATCHMAKER_RIGHT_TEXTS: readonly string[] = Array.from(
  { length: MATCHMAKER_COUNT },
  (_, index) => `Texte de droite ${String(index + 1).padStart(2, '0')}`,
);

interface MatchmakerPair {
  readonly left: number;
  readonly right: number;
}

@Component({
  selector: 'app-matchmaker-play',
  templateUrl: './matchmaker-play.html',
  styleUrl: './matchmaker-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchmakerPlay {
  protected readonly songs = signal<readonly MatchmakerSongEntry[]>(
    MATCHMAKER_SONGS.map((excerpt) => ({ excerpt, artist: '', firstLetter: '', secondLetter: '' })),
  );
  protected readonly pairs = signal<readonly MatchmakerPair[]>([]);
  protected readonly selectedLeft = signal<number | null>(null);
  protected readonly leftTexts = MATCHMAKER_LEFT_TEXTS;
  protected readonly rightTexts = MATCHMAKER_RIGHT_TEXTS;
  protected readonly rowNumbers = Array.from({ length: MATCHMAKER_COUNT }, (_, index) => index + 1);

  protected updateSong(
    index: number,
    field: 'artist' | 'firstLetter' | 'secondLetter',
    value: string,
  ): void {
    const next = [...this.songs()];
    const entry = next[index];
    if (!entry) return;
    next[index] = { ...entry, [field]: field === 'artist' ? value : value.slice(-1) };
    this.songs.set(next);
  }

  protected selectLeft(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= MATCHMAKER_COUNT) return;
    const pair = this.pairForLeft(index);
    if (pair) {
      this.removePair(pair.left);
      this.selectedLeft.set(null);
      return;
    }
    this.selectedLeft.set(this.selectedLeft() === index ? null : index);
  }

  protected selectRight(index: number): void {
    const left = this.selectedLeft();
    if (!Number.isInteger(index) || index < 0 || index >= MATCHMAKER_COUNT) return;
    const pair = this.pairForRight(index);
    if (left === null) {
      if (pair) this.removePair(pair.left);
      return;
    }
    if (pair?.left === left) {
      this.removePair(left);
      this.selectedLeft.set(null);
      return;
    }
    this.pairs.update((pairs) => [
      ...pairs.filter((pair) => pair.left !== left && pair.right !== index),
      { left, right: index },
    ]);
    this.selectedLeft.set(null);
  }

  @HostListener('document:click', ['$event'])
  protected clearSelectionOutsideMatchItem(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('.match-item')) this.selectedLeft.set(null);
  }

  private removePair(left: number): void {
    this.pairs.update((pairs) => pairs.filter((pair) => pair.left !== left));
  }

  protected clearPairs(): void {
    this.pairs.set([]);
    this.selectedLeft.set(null);
  }

  protected pairForLeft(index: number): MatchmakerPair | undefined {
    return this.pairs().find((pair) => pair.left === index);
  }

  protected pairForRight(index: number): MatchmakerPair | undefined {
    return this.pairs().find((pair) => pair.right === index);
  }

  protected lineY(index: number): number {
    return ((index + 0.5) / MATCHMAKER_COUNT) * 100;
  }
}
