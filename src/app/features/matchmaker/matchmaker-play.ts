import { ChangeDetectionStrategy, Component, computed, HostListener, signal } from '@angular/core';
import { normalizeAnswer } from '../riddles/game.model';
import { MATCHMAKER_ARTISTS, MATCHMAKER_CLUES, MATCHMAKER_DECOYS } from './matchmaker-clues';

export interface MatchmakerSongEntry {
  readonly excerpt: string;
  readonly audioSrc: string;
  readonly artist: string;
  readonly startEntry: string;
  readonly endEntry: string;
}

export const MATCHMAKER_COUNT = MATCHMAKER_ARTISTS.length;

export const MATCHMAKER_SONGS: readonly string[] = Array.from(
  { length: MATCHMAKER_COUNT },
  (_, index) => `Extrait de chanson ${String(index + 1).padStart(2, '0')}`,
);

export const MATCHMAKER_AUDIO_PATHS: readonly string[] = Array.from(
  { length: MATCHMAKER_COUNT },
  (_, index) => `audio/matchmaker/5s/${index + 1}.mp3`,
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
    MATCHMAKER_SONGS.map((excerpt, index) => ({
      excerpt,
      audioSrc: MATCHMAKER_AUDIO_PATHS[index] ?? '',
      artist: '',
      startEntry: '',
      endEntry: '',
    })),
  );
  protected readonly correctArtists = computed(() =>
    this.songs().map(({ artist }, index) =>
      MATCHMAKER_ARTISTS[index].includes(normalizeAnswer(artist)),
    ),
  );
  protected readonly pairs = signal<readonly MatchmakerPair[]>([]);
  protected readonly selectedLeft = signal<number | null>(null);
  protected readonly leftTexts = MATCHMAKER_CLUES.map((clue) => clue.start);
  protected readonly rightTexts = [...MATCHMAKER_CLUES]
    .sort((a, b) => a.endRow - b.endRow)
    .map((clue) => clue.end);
  protected readonly rowNumbers = Array.from({ length: MATCHMAKER_COUNT }, (_, index) => index + 1);
  protected readonly indexMarkers = [
    ...MATCHMAKER_CLUES.flatMap(({ indices, endRow, indexColumns }, startRow) => {
      const startY = this.lineY(startRow);
      const endY = this.lineY(endRow);

      return indexColumns.map((x, column) => ({
        value: indices[column],
        x,
        y: startY + ((endY - startY) * x) / 100,
      }));
    }),
    ...MATCHMAKER_DECOYS,
  ].sort((a, b) => a.y - b.y || a.x - b.x);

  protected updateSong(
    index: number,
    field: 'artist' | 'startEntry' | 'endEntry',
    value: string,
  ): void {
    const next = [...this.songs()];
    const entry = next[index];
    if (!entry) return;
    next[index] = { ...entry, [field]: value };
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
