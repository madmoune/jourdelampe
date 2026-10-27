export interface GameRiddle {
  readonly id: string;
  readonly title: string;
  readonly prompt: string;
  readonly order: number;
  readonly answerReady?: boolean;
  readonly gridReady?: boolean;
}

export interface RiddleSolution {
  readonly participantId: string;
  readonly participantName: string;
  readonly riddleId: string;
  readonly riddleTitle: string;
  readonly roundId: string;
  readonly solvedAt: number;
}

export interface GameRound {
  readonly id: string;
  readonly resetAt: number;
}

export interface RiddleSecret {
  readonly answer: string;
  readonly normalizedAnswer: string;
  readonly gridAnswer?: string;
}

export type GameSolutions = Record<string, Record<string, RiddleSolution>>;

export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toUpperCase()
    .replace(/Œ/gu, 'OE')
    .replace(/Æ/gu, 'AE')
    .replace(/[^A-Z0-9]/gu, '');
}

export function gameId(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/u.test(value);
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Données de jeu invalides.');
  return value as Record<string, unknown>;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function parseCatalog(value: unknown): readonly GameRiddle[] {
  if (value === null) return [];
  return Object.entries(record(value))
    .map(([id, raw]) => {
      const riddle = record(raw);
      if (
        !gameId(id) ||
        typeof riddle['title'] !== 'string' ||
        !riddle['title'].trim() ||
        typeof riddle['prompt'] !== 'string' ||
        !finite(riddle['order']) ||
        (riddle['answerReady'] !== undefined && typeof riddle['answerReady'] !== 'boolean') ||
        (riddle['gridReady'] !== undefined && typeof riddle['gridReady'] !== 'boolean')
      )
        throw new Error('Énigme invalide.');
      return {
        id,
        title: riddle['title'],
        prompt: riddle['prompt'],
        order: riddle['order'],
        ...(riddle['answerReady'] === undefined
          ? {}
          : { answerReady: riddle['answerReady'] as boolean }),
        ...(riddle['gridReady'] === undefined ? {} : { gridReady: riddle['gridReady'] as boolean }),
      };
    })
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function parseRound(value: unknown): GameRound | null {
  if (value === null) return null;
  const round = record(value);
  if (typeof round['id'] !== 'string' || !gameId(round['id']) || !finite(round['resetAt']))
    throw new Error('Partie invalide.');
  return { id: round['id'], resetAt: round['resetAt'] };
}

export function parseSolutions(value: unknown): GameSolutions {
  if (value === null) return {};
  const result: GameSolutions = {};
  for (const [riddleId, raw] of Object.entries(record(value))) {
    if (!gameId(riddleId)) throw new Error('Résolution invalide.');
    result[riddleId] = {};
    for (const [participantId, entry] of Object.entries(record(raw))) {
      const solution = record(entry);
      if (
        !gameId(participantId) ||
        solution['participantId'] !== participantId ||
        solution['riddleId'] !== riddleId ||
        typeof solution['participantName'] !== 'string' ||
        !solution['participantName'].trim() ||
        typeof solution['riddleTitle'] !== 'string' ||
        typeof solution['roundId'] !== 'string' ||
        !gameId(solution['roundId']) ||
        !finite(solution['solvedAt'])
      )
        throw new Error('Résolution invalide.');
      result[riddleId][participantId] = solution as unknown as RiddleSolution;
    }
  }
  return result;
}

export function parseSecrets(value: unknown): Record<string, RiddleSecret> {
  if (value === null) return {};
  const result: Record<string, RiddleSecret> = {};
  for (const [id, raw] of Object.entries(record(value))) {
    const secret = record(raw);
    if (
      !gameId(id) ||
      typeof secret['answer'] !== 'string' ||
      typeof secret['normalizedAnswer'] !== 'string'
    )
      throw new Error('Réponse invalide.');
    result[id] = {
      answer: secret['answer'],
      normalizedAnswer: secret['normalizedAnswer'],
      ...(typeof secret['gridAnswer'] === 'string' ? { gridAnswer: secret['gridAnswer'] } : {}),
    };
  }
  return result;
}
