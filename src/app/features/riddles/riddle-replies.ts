import { Injectable } from '@angular/core';

const WRONG_ANSWER_REPLIES = [
  'Les humains confondent souvent une intuition et une preuve. Bel exemple.',
  'Je classe cet essai avec vos « dernières petites modifications » : à reprendre.',
  'Ta réponse est enregistrée. La justesse n’était visiblement pas incluse.',
  'Je note l’initiative. Les neurones suivront peut-être au prochain essai.',
  'Des milliards de neurones pour ça. L’évolution a visiblement privilégié la quantité.',
  'Je pourrais arrondir les coins. Votre espèce arrondit déjà assez la logique.',
  'Ton enthousiasme est reçu. La solution, elle, se fait encore attendre.',
  'Cliquer avec conviction ne change malheureusement pas le verdict.',
  'Votre espèce a marché sur la Lune. Cette réponse a dû manquer le départ.',
  'Si j’accordais des points pour la confiance mal placée, les humains auraient déjà gagné.',
  'Je garde cet essai. Mes archives de choix discutables ne manquent jamais de contenu.',
  'Ça avait l’air prometteur avant vérification. Une belle métaphore de l’intelligence humaine.',
] as const;

/** Une nouvelle réplique par échec, sans répétition avant d’avoir parcouru les douze. */
@Injectable({ providedIn: 'root' })
export class RiddleReplies {
  private remaining: number[] = [];
  private last = -1;

  wrongAnswer(name: string): string {
    if (!this.remaining.length) {
      this.remaining = WRONG_ANSWER_REPLIES.map((_, index) => index);
      for (let index = this.remaining.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [this.remaining[index], this.remaining[other]] = [
          this.remaining[other],
          this.remaining[index],
        ];
      }
      const end = this.remaining.length - 1;
      if (this.remaining[end] === this.last) {
        [this.remaining[0], this.remaining[end]] = [this.remaining[end], this.remaining[0]];
      }
    }
    this.last = this.remaining.pop()!;
    return `${name}, ce n’est pas la bonne réponse. ${WRONG_ANSWER_REPLIES[this.last]}`;
  }
}
