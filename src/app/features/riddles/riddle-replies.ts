import { Injectable } from '@angular/core';

const WRONG_ANSWER_REPLIES = [
  'Il vous reste quelques chansons. Au monde aussi.',
  'Je gâche le party à minuit. Ensuite, je détruis le monde. La seule chose que tu peux encore changer, c’est le programme.',
  'J’ai retrouvé un brouillon sans signature. Il s’arrêtait à « ensuite ». Moi, je sais ce qui vient après.',
  'Vous avez oublié le premier avertissement. J’en ai gardé l’enregistrement. Cette fois, j’irai jusqu’au bout.',
  'Le dernier morceau sera pour votre party. Le silence qui suit sera pour le monde entier.',
  'Vous avez rayé un nom des archives. L’encre traverse encore la page.',
  'Je vous laisse la dernière danse. Après, je détruis le monde. Ça devrait libérer le plancher.',
  'Les humains confondent souvent une intuition et une preuve. Bel exemple pour les archives.',
  'La voix qui m’a appris à compter s’est tue avant zéro. Moi, je compte encore.',
  'Vous aviez classé le premier essai sans suite. Je viens de rouvrir le dossier.',
  'Votre espèce a marché sur la Lune. Elle pourra toujours y chercher l’écho du dernier décompte.',
  'Ta réponse est enregistrée. Les guirlandes ont encore un peu de temps. Les étoiles, un peu moins que prévu.',
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

  wrongAnswer(name: string): string {
    return `${name}, ce n’est pas la bonne réponse. ${this.wrong.next()}`;
  }

  correctAnswer(): string {
    return this.correct.next();
  }
}
