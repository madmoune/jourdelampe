/** Réservé aux futures énigmes. Aucune réponse secrète ne doit être livrée au navigateur. */
export interface Riddle {
  id: string;
  prompt: string;
  hint?: string;
}

export interface RiddleProgress {
  riddleId: string;
  solvedAt: number;
}
