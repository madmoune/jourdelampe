export const PARTICIPANT_NAME_MAX_LENGTH = 60;

export interface Participant {
  readonly id: string;
  readonly name: string;
  readonly updatedAt: number;
}

export function validateParticipantName(value: string): string {
  const name = value.replace(/\s+/gu, ' ').trim();
  if (!name) throw new Error('Entre ton nom pour accéder aux énigmes.');
  if (name.length > PARTICIPANT_NAME_MAX_LENGTH) {
    throw new Error(`Ton nom doit contenir ${PARTICIPANT_NAME_MAX_LENGTH} caractères ou moins.`);
  }
  if (/[\p{Cc}\p{Cf}]/u.test(name)) {
    throw new Error('Ton nom contient un caractère invisible. Retire-le et réessaie.');
  }
  return name;
}

export function parseParticipant(id: string, value: unknown): Participant | null {
  if (value === null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('Profil invalide.');
  const record = value as Record<string, unknown>;
  if (
    typeof record['name'] !== 'string' ||
    typeof record['updatedAt'] !== 'number' ||
    !Number.isFinite(record['updatedAt']) ||
    record['updatedAt'] < 0
  ) {
    throw new Error('Profil invalide.');
  }
  return { id, name: validateParticipantName(record['name']), updatedAt: record['updatedAt'] };
}
