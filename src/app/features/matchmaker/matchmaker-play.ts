import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { GameStore } from '../riddles/game-store';
import { normalizeAnswer } from '../riddles/game.model';
import { ParticipantStore } from '../riddles/participant-store';
import { MATCHMAKER_ID } from '../riddles/riddle-pages';
import {
  MATCHMAKER_ARTIST_INDICES,
  MATCHMAKER_ARTIST_NAMES,
  MATCHMAKER_ARTISTS,
  MATCHMAKER_CLUES,
  MATCHMAKER_DECOYS,
} from './matchmaker-clues';

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

interface MatchmakerProgress {
  readonly songs: readonly MatchmakerSongEntry[];
  readonly pairs: readonly MatchmakerPair[];
}

const MATCHMAKER_SOLUTION_PAIRS: readonly MatchmakerPair[] = MATCHMAKER_CLUES.map(
  ({ endRow }, left) => ({ left, right: endRow }),
);

@Component({
  selector: 'app-matchmaker-play',
  templateUrl: './matchmaker-play.html',
  styleUrl: './matchmaker-play.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchmakerPlay {
  private readonly browser = inject(DOCUMENT).defaultView;
  private readonly game = inject(GameStore);
  private readonly participants = inject(ParticipantStore);
  private readonly storageKey = computed(
    () =>
      `jdl-matchmaker-v1:${this.participants.participant()?.id ?? 'anonymous'}:${this.game.round()?.id ?? 'preview'}`,
  );
  private readonly progress = linkedSignal({
    source: this.storageKey,
    computation: (key) => this.restore(key),
  });
  protected readonly solved = computed(() => {
    const riddle = this.game.riddles().find((item) => item.id === MATCHMAKER_ID);
    if (!riddle) return false;
    if (this.game.mode() === 'team') return riddle.solutions.length > 0;
    const participantId = this.participants.participant()?.id;
    return (
      !!participantId &&
      riddle.solutions.some((solution) => solution.participantId === participantId)
    );
  });
  private readonly solutionSongs = MATCHMAKER_SONGS.map((excerpt, index) => {
    const artist = MATCHMAKER_ARTISTS[index]?.[0] ?? '';
    const [startIndex, endIndex] = MATCHMAKER_ARTIST_INDICES[index] ?? [0, 0];
    return {
      excerpt,
      audioSrc: MATCHMAKER_AUDIO_PATHS[index] ?? '',
      artist: MATCHMAKER_ARTIST_NAMES[index] ?? artist,
      startEntry: artist[startIndex - 1] ?? '',
      endEntry: artist[artist.length - endIndex] ?? '',
    };
  });
  protected readonly songs = computed(() =>
    this.solved() ? this.solutionSongs : this.progress().songs,
  );
  protected readonly pairs = computed(() =>
    this.solved() ? MATCHMAKER_SOLUTION_PAIRS : this.progress().pairs,
  );
  protected readonly correctArtists = computed(() =>
    this.songs().map(({ artist }, index) =>
      MATCHMAKER_ARTISTS[index].includes(normalizeAnswer(artist)),
    ),
  );
  private readonly correctLetterPairs = computed(() =>
    this.songs().map(({ startEntry, endEntry }, index) => ({
      start: matchesArtistIndex(
        startEntry,
        MATCHMAKER_ARTISTS[index]?.[0] ?? '',
        MATCHMAKER_ARTIST_INDICES[index]?.[0] ?? 0,
        false,
      ),
      end: matchesArtistIndex(
        endEntry,
        MATCHMAKER_ARTISTS[index]?.[0] ?? '',
        MATCHMAKER_ARTIST_INDICES[index]?.[1] ?? 0,
        true,
      ),
    })),
  );
  protected readonly correctStarts = computed(() =>
    this.correctLetterPairs().map(({ start, end }) => start && end),
  );
  protected readonly correctEnds = computed(() =>
    this.correctLetterPairs().map(({ start, end }) => start && end),
  );
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
    if (this.solved()) return;
    const next = [...this.progress().songs];
    const entry = next[index];
    if (!entry) return;
    next[index] = { ...entry, [field]: value };
    this.save({ ...this.progress(), songs: next });
  }

  protected selectLeft(index: number): void {
    if (this.solved()) return;
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
    if (this.solved()) return;
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
    this.save({
      ...this.progress(),
      pairs: [
        ...this.progress().pairs.filter((pair) => pair.left !== left && pair.right !== index),
        { left, right: index },
      ],
    });
    this.selectedLeft.set(null);
  }

  @HostListener('document:click', ['$event'])
  protected clearSelectionOutsideMatchItem(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('.match-item')) this.selectedLeft.set(null);
  }

  private removePair(left: number): void {
    this.save({
      ...this.progress(),
      pairs: this.progress().pairs.filter((pair) => pair.left !== left),
    });
  }

  protected clearPairs(): void {
    if (this.solved()) return;
    this.save({ ...this.progress(), pairs: [] });
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

  private save(progress: MatchmakerProgress): void {
    this.progress.set(progress);
    try {
      this.browser?.localStorage.setItem(this.storageKey(), JSON.stringify(progress));
    } catch {
      /* Les réponses restent disponibles en mémoire. */
    }
  }

  private restore(key: string): MatchmakerProgress {
    const songs = MATCHMAKER_SONGS.map((excerpt, index) => ({
      excerpt,
      audioSrc: MATCHMAKER_AUDIO_PATHS[index] ?? '',
      artist: '',
      startEntry: '',
      endEntry: '',
    }));
    try {
      const raw = JSON.parse(this.browser?.localStorage.getItem(key) ?? 'null') as Record<
        string,
        unknown
      > | null;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { songs, pairs: [] };
      const savedSongs = Array.isArray(raw['songs']) ? raw['songs'] : [];
      const restoredSongs = songs.map((song, index) => {
        const saved = savedSongs[index];
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return song;
        const entry = saved as Record<string, unknown>;
        return {
          ...song,
          artist: typeof entry['artist'] === 'string' ? entry['artist'] : '',
          startEntry: typeof entry['startEntry'] === 'string' ? entry['startEntry'] : '',
          endEntry: typeof entry['endEntry'] === 'string' ? entry['endEntry'] : '',
        };
      });
      const pairs: MatchmakerPair[] = [];
      const usedLeft = new Set<number>();
      const usedRight = new Set<number>();
      const savedPairs = Array.isArray(raw['pairs']) ? raw['pairs'] : [];
      for (const value of savedPairs) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
        const pair = value as Record<string, unknown>;
        const left = pair['left'];
        const right = pair['right'];
        if (
          typeof left !== 'number' ||
          !Number.isInteger(left) ||
          left < 0 ||
          left >= MATCHMAKER_COUNT ||
          typeof right !== 'number' ||
          !Number.isInteger(right) ||
          right < 0 ||
          right >= MATCHMAKER_COUNT ||
          usedLeft.has(left) ||
          usedRight.has(right)
        )
          continue;
        usedLeft.add(left);
        usedRight.add(right);
        pairs.push({ left, right });
      }
      return { songs: restoredSongs, pairs };
    } catch {
      return { songs, pairs: [] };
    }
  }
}

function matchesArtistIndex(
  value: string,
  artist: string,
  index: number,
  fromEnd: boolean,
): boolean {
  const normalized = normalizeAnswer(value);
  if (!normalized || index < 1) return false;
  const position = fromEnd ? artist.length - index : index - 1;
  return normalized === artist[position];
}
