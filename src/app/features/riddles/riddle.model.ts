/** Réservé aux futures énigmes. Aucune réponse secrète ne doit être livrée au navigateur. */
export interface Riddle {
  id: string;
  prompt: string;
  hint?: string;
}

export interface RiddleProgress {
  /** Identifiant stable du profil; le nom courant se trouve dans participants/<id>. */
  participantId: string;
  riddleId: string;
  solvedAt: number;
}
