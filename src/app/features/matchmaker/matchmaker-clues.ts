import { normalizeAnswer } from '../riddles/game.model';

interface TrackClue {
  readonly artists: readonly string[];
  readonly start: string;
  readonly end: string;
  readonly indices: readonly [number, number];
}

// Dans l’ordre des extraits.
// Pour la fin, seuls les mots du chant principal sont retenus.
const TRACK_CLUES: readonly TrackClue[] = [
  // Juste pour voir le monde
  // https://www.paroles.net/la-chicane/paroles-juste-pour-voir-le-monde
  {
    artists: ['La Chicane'],
    start: 'C’est plus l’temps de reculer',
    end: 'juste pour voir le monde',
    indices: [3, 1],
  },
  // Original Prankster
  // https://www.lyricdown.com/lrc/the-offspring-original-prankster-official-music-video-16397183
  {
    artists: ['The Offspring'],
    start: 'You can do it! Until',
    end: 'what the main man say',
    indices: [4, 6],
  },
  // Quand?
  // https://www.paroles-musique.com/paroles-Martin-Deschamps-Quand-lyrics,p356033
  {
    artists: ['Martin Deschamps'],
    start: 'Tu m’regardes d’une drôle de',
    end: 'moé qui va te retenir',
    indices: [1, 12],
  },
  // Makes No Difference
  // https://sum41.fandom.com/wiki/Makes_No_Difference
  {
    artists: ['Sum 41'],
    start: 'You’re running fast and missing',
    end: 'makes no difference to me',
    indices: [3, 4],
  },
  // Oops!... I Did It Again
  // https://www.lyricdown.com/lrc/spears-britney-oops-i-did-it-again-1778062
  {
    artists: ['Britney Spears'],
    start: 'I think I did it again',
    end: 'above, I’m not that innocent',
    indices: [6, 10],
  },
  // Seul
  // https://garouofficiel.com/musique/seul/
  {
    artists: ['Garou'],
    start: 'Tant de fois j’ai tenté',
    end: 'seulement aimer? Peut-il jamais aimer',
    indices: [5, 2],
  },
  // The Real Slim Shady (version clean)
  // https://readdork.com/lyrics/eminem-the-real-slim-shady-clean
  {
    artists: ['Eminem'],
    start: 'May I have your attention',
    end: 'us? Let’s all stand up',
    indices: [4, 1],
  },
  // Rollin’ (Air Raid Vehicle)
  // https://www.lyricdown.com/lrc/limp-bizkit-rollin-air-raid-vehicle-468159
  {
    artists: ['Limp Bizkit'],
    start: 'Alright, partner, keep on rollin’',
    end: 'Keep rollin’, rollin’, rollin’, rollin’',
    indices: [4, 6],
  },
  // Mon ange
  // https://www.paroles-musique.com/paroles-Eric-Lapointe-Mon-Ange-lyrics,p33528
  {
    artists: ['Éric Lapointe'],
    start: 'Ce monde s’ra jamais beau',
    end: 'du fond de mon armure',
    indices: [8, 12],
  },
  // Kryptonite
  // https://readdork.com/lyrics/3-doors-down-kryptonite
  {
    artists: ['3 Doors Down'],
    start: 'Well, I took a walk',
    end: 'with my superhuman might, Kryptonite',
    indices: [10, 4],
  },
  // Californication
  // https://www.youtube.com/watch?v=YlUKcNNmywk
  {
    artists: ['Red Hot Chili Peppers'],
    start: 'Psychic spies from China try',
    end: 'of Californication, dream of Californication',
    indices: [6, 3],
  },
  // Just Friends (Sunny)
  // https://www.lyricdown.com/lrc/musiq-soulchild-just-friends-sunny-23219973
  {
    artists: ['Musiq', 'Musiq Soulchild'],
    start: 'Girl, I know this might',
    end: 'you need me to, baby',
    indices: [5, 5],
  },
  // Tu dis rien
  // https://www.paroles.net/louise-attaque/paroles-tu-dis-rien
  {
    artists: ['Louise Attaque'],
    start: 'Tu penses quoi toi, tu',
    end: 'penses quoi? Tu dis rien',
    indices: [3, 12],
  },
  // One Step Closer
  // https://www.youtube.com/watch?v=4qlCC1GOwFw
  {
    artists: ['Linkin Park'],
    start: 'I cannot take this anymore',
    end: 'And I’m about to break',
    indices: [2, 6],
  },
];

export const MATCHMAKER_ARTISTS = TRACK_CLUES.map(({ artists }) => artists.map(normalizeAnswer));
export const MATCHMAKER_ARTIST_INDICES = TRACK_CLUES.map(({ indices }) => indices);

export const MATCHMAKER_SONG_CLUES = TRACK_CLUES.map(({ start, end }) => ({ start, end }));

// Ordre des débuts. Les pistes et rangées commencent à 0, et les positions X sont en %.
const BOARD_LAYOUT: readonly {
  readonly track: number;
  readonly endRow: number;
  readonly indexColumns: readonly [number, number];
}[] = [
  { track: 10, endRow: 3, indexColumns: [17, 63] },
  { track: 3, endRow: 7, indexColumns: [28, 64] },
  { track: 1, endRow: 11, indexColumns: [15, 85] },
  { track: 8, endRow: 0, indexColumns: [32, 74] },
  { track: 5, endRow: 9, indexColumns: [21, 81] },
  { track: 0, endRow: 1, indexColumns: [32, 65] },
  { track: 11, endRow: 12, indexColumns: [29, 66] },
  { track: 7, endRow: 2, indexColumns: [23, 76] },
  { track: 13, endRow: 4, indexColumns: [35, 62] },
  { track: 4, endRow: 13, indexColumns: [30, 76] },
  { track: 2, endRow: 5, indexColumns: [27, 67] },
  { track: 12, endRow: 6, indexColumns: [29, 78] },
  { track: 6, endRow: 8, indexColumns: [30, 68] },
  { track: 9, endRow: 10, indexColumns: [21, 67] },
];

export const MATCHMAKER_CLUES = BOARD_LAYOUT.map(({ track, endRow, indexColumns }) => {
  const { start, end, indices } = TRACK_CLUES[track];
  return { start, end, indices, endRow, indexColumns };
});

// Positions en % choisies à l’écart des 14 bonnes lignes, même à la largeur minimale.
export const MATCHMAKER_DECOYS = [
  { x: 36, y: 5, value: 4 },
  { x: 24, y: 15, value: 7 },
  { x: 38, y: 33.5, value: 2 },
  { x: 36, y: 54.5, value: 6 },
  { x: 15, y: 62.5, value: 9 },
  { x: 30, y: 85, value: 3 },
  { x: 78, y: 12.5, value: 5 },
  { x: 85, y: 29.5, value: 8 },
  { x: 65, y: 46.5, value: 2 },
  { x: 85, y: 57.5, value: 11 },
  { x: 62, y: 66.5, value: 3 },
  { x: 73, y: 93, value: 6 },
] as const;
