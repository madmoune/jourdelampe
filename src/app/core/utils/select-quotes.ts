import type { Quote } from '../models/quote';

export const AI_QUOTE_CHANCE = 0.1;

/** Mélange une copie du catalogue pour préserver la source locale ou distante. */
function shuffle(quotes: readonly Quote[], random: () => number): Quote[] {
  const shuffled = [...quotes];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }
  return shuffled;
}

/** Un tirage par visite : l’AI a 10 % de chances d’occuper le premier emplacement. */
export function selectQuotes(
  quotes: readonly Quote[],
  aiQuotes: readonly Quote[],
  count: number,
  random: () => number = Math.random,
): readonly Quote[] {
  if (count <= 0) return [];
  const useAi = aiQuotes.length > 0 && random() < AI_QUOTE_CHANCE;
  const regular = shuffle(quotes, random);
  if (!useAi) return regular.slice(0, count);

  const ai = aiQuotes[Math.floor(random() * aiQuotes.length)];
  return [ai, ...regular.slice(0, count - 1)];
}

/** Rejouer le tirage garde la même chance de l’AI pendant toute la visite. */
export function quoteRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
