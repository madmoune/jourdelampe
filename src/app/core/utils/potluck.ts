import type { PotluckEntry } from '../models/potluck-entry';

export const POTLUCK_NAME_MAX_LENGTH = 60;
export const POTLUCK_DISH_MAX_LENGTH = 160;

function clean(value: string): string {
  return value.replace(/\s+/gu, ' ').trim();
}

export function validatePotluck(name: string, dish: string): { name: string; dish: string } {
  const cleanedName = clean(name);
  const cleanedDish = clean(dish);
  if (!cleanedName) throw new Error('Indique ton nom.');
  if (!cleanedDish) throw new Error('Indique le repas que tu amènes.');
  if (cleanedName.length > POTLUCK_NAME_MAX_LENGTH) {
    throw new Error(`Le nom doit contenir au maximum ${POTLUCK_NAME_MAX_LENGTH} caractères.`);
  }
  if (cleanedDish.length > POTLUCK_DISH_MAX_LENGTH) {
    throw new Error(`Le repas doit contenir au maximum ${POTLUCK_DISH_MAX_LENGTH} caractères.`);
  }
  return { name: cleanedName, dish: cleanedDish };
}

export function potluckKey(name: string, dish: string): string {
  return JSON.stringify(
    [name, dish].map((value) => clean(value).normalize('NFKC').toLocaleLowerCase('fr')),
  );
}

export function parsePotluck(value: unknown): readonly PotluckEntry[] {
  if (value === null) return [];
  if (typeof value !== 'object' || Array.isArray(value))
    throw new Error('La liste du potluck est invalide.');
  return Object.entries(value)
    .flatMap(([id, item]): PotluckEntry[] => {
      if (
        !/^[A-Za-z0-9_-]{1,80}$/u.test(id) ||
        typeof item !== 'object' ||
        item === null ||
        Array.isArray(item)
      )
        return [];
      const data = item as Record<string, unknown>;
      if (
        typeof data['name'] !== 'string' ||
        typeof data['dish'] !== 'string' ||
        typeof data['active'] !== 'boolean' ||
        typeof data['createdAt'] !== 'number' ||
        !Number.isFinite(data['createdAt']) ||
        data['createdAt'] < 0 ||
        typeof data['updatedAt'] !== 'number' ||
        !Number.isFinite(data['updatedAt']) ||
        data['updatedAt'] < 0
      )
        return [];
      try {
        const fields = validatePotluck(data['name'], data['dish']);
        return [
          {
            id,
            ...fields,
            active: data['active'],
            createdAt: data['createdAt'],
            updatedAt: data['updatedAt'],
          },
        ];
      } catch {
        return [];
      }
    })
    .sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id));
}
