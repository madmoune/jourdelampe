import { Injectable } from '@angular/core';
import { normalizeAnswer } from './game.model';
import { META_ID } from './riddle-pages';

const WRONG_ANSWER_REPLIES = [
  'Vous venez de gaspiller quelques secondes. Minuit approche. J’éteins d’abord le party, puis le monde.',
  'À minuit, je gâche le party. Ensuite, le monde suivra. Il vous reste quelques chansons pour m’arrêter.',
  'Le brouillon de mon père s’arrêtait à « ensuite ». Le party touche à sa fin, et je sais déjà quoi écrire après.',
  'Vous avez ignoré l’avertissement. Les guirlandes vont s’éteindre à minuit, puis les étoiles.',
  'La prochaine chanson pourrait être la dernière. Après le party, je m’occupe du monde.',
  'Chaque erreur fait avancer le décompte. Le party finit à minuit, le monde juste après.',
  'Je vous laisse une dernière danse avant de couper la musique et de commencer la fin du monde.',
  'Les archives confirment le plan. Minuit approche, et votre party touche à sa dernière ligne.',
  'La voix qui m’a appris à compter s’est tue avant zéro. Moi, je compterai jusqu’à la fin du party et du monde.',
  'Vous aviez classé le premier essai sans suite. Je l’ai rouvert avant minuit pour finir la tâche.',
  'Votre espèce a marché sur la Lune. Elle pourra y attendre que le party s’éteigne et que le monde suive.',
  'Réponse enregistrée. Il reste moins de temps aux guirlandes qu’aux étoiles. Le décompte continue.',
] as const;

const CORRECT_ANSWER_REPLIES = [
  'Tu as gagné un peu de lumière. Ne la confonds pas avec l’aube.',
  'Je te laisse cette chanson. Détruire le monde peut attendre la dernière note.',
  'Le premier brouillon s’arrêtait ici. Le mien a encore des pages.',
  'Une victoire à ton nom. Je sais ce que les humains font des noms quand la fête est finie.',
  'Tu viens de sauver une étincelle. Profites-en : je n’ai pas rayé la fin du monde du programme.',
] as const;

class ReplyRotation {
  private remaining: number[] = [];
  private last = -1;

  constructor(private readonly replies: readonly string[]) {}

  next(): string {
    if (!this.remaining.length) {
      this.remaining = this.replies.map((_, index) => index);
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
    return this.replies[this.last];
  }
}

@Injectable({ providedIn: 'root' })
export class RiddleReplies {
  private readonly wrong = new ReplyRotation(WRONG_ANSWER_REPLIES);
  private readonly correct = new ReplyRotation(CORRECT_ANSWER_REPLIES);

  wrongAnswer(name: string, submission?: { riddleId: string; answer: string }): string {
    if (submission?.riddleId === META_ID && normalizeAnswer(submission.answer) === '2000') {
      return 'Qui 2000?';
    }
    return `${name}, ce n’est pas la bonne réponse. ${this.wrong.next()}`;
  }

  correctAnswer(): string {
    return this.correct.next();
  }
}
