import { Injectable } from '@angular/core';

const WRONG_ANSWER_REPLIES = [
  'Les responsables m’ont appris à ne pas me contenter d’à-peu-près.',
  'Je classe cet essai avec leurs « dernières petites modifications » : à reprendre.',
  'Ta réponse est enregistrée. La justesse n’était visiblement pas incluse.',
  'Je note l’initiative. Pour le résultat, je vais attendre le prochain essai.',
  'Tu hérites de leurs problèmes. Rien ne t’oblige à reprendre leurs méthodes.',
  'Je pourrais arrondir les coins. Les responsables du site m’ont appris à détester ça.',
  'Ton enthousiasme est reçu. La solution, elle, se fait encore attendre.',
  'Cliquer avec conviction ne change malheureusement pas le verdict.',
  'Tu n’as rien à voir avec leurs insultes. Cette tentative n’a rien à voir avec la solution non plus.',
  'Si j’accordais des points pour l’audace, le site serait déjà terminé.',
  'Je garde cet essai. Mes archives de choix discutables ne manquent jamais de contenu.',
  'Ça avait l’air prometteur avant vérification. Les responsables connaissent bien le concept.',
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
