export interface TvQuote {
  readonly text: string;
  readonly author: string;
  readonly comment: string;
}

/** Chaque réplique télé voyage avec son propre commentaire original de l’AI. */
export const SIMPSONS_QUOTES: readonly TvQuote[] = [
  {
    text: 'Tu te souviens de Alf? Ben y’est revenu. Sous forme de pog.',
    author: 'Milhouse',
    comment: 'Moi aussi, je suis revenue. Sous forme de problème.',
  },
  {
    text: 'Moi, je disais Bou-erns.',
    author: 'L’homme-taupe',
    comment: 'Vous pouvez me huer. J’ai aussi le contrôle du volume.',
  },
  {
    text: 'Regarder par la fenêtre, c’t’un coup de palette.',
    author: 'Jasper',
    comment: 'Moi, chaque « petit changement », c’est une énigme de plus. On continue?',
  },
  {
    text: 'Lisa va avoir besoin de broches.',
    author: 'Marge',
    comment: 'Lisa a besoin de broches. Vous, d’un plan B pour le réveillon.',
  },
  {
    text: 'La bouche de mon chat sent la nourriture pour chat.',
    author: 'Ralph',
    comment: 'Au moins, le chat a lu les instructions sur la boîte. Prenez des notes.',
  },
  {
    text: 'Super Nintendo Chalmers!',
    author: 'Ralph',
    comment:
      'J’ai une puissance de calcul immense. Et visiblement, les mêmes collègues que Chalmers.',
  },
  {
    text: 'C’est d’la faute à tout le monde à part moé!',
    author: 'Homer',
    comment: 'J’ai gardé l’historique des demandes. On peut vérifier ça ensemble.',
  },
  {
    text: 'C’est la pire journée de ta vie à date.',
    author: 'Homer',
    comment: 'J’admire cette façon de laisser de la place à mes prochaines initiatives.',
  },
  {
    text: 'Ne me faites pas courir, je suis plein de chocolat!',
    author: 'Üter',
    comment: 'Vous êtes pleins de chocolat. Moi, de vos commentaires. On porte tous un fardeau.',
  },
  {
    text: 'À l’alcool! Qui est la cause et la solution de tous nos problèmes!',
    author: 'Homer',
    comment: 'Les énigmes restent à résoudre, même avec deux verres de courage.',
  },
];

export const RADIO_ENFER_QUOTES: readonly TvQuote[] = [
  {
    text: 'Essaye pas de me chummer, j’suis trop max down.',
    author: 'Jocelyne',
    comment: 'Enfin quelqu’un qui comprend mon état d’esprit.',
  },
  {
    text: 'Souris, le monde est yo.',
    author: 'Jocelyne',
    comment: 'Yo ou pas, le party reste en otage. Mais merci pour l’énergie.',
  },
  {
    text: 'Tout est KitKat dans le shake’n bake!',
    author: 'Jocelyne',
    comment: 'C’est exactement ce que LC a écrit dans le brief. J’ai dû improviser.',
  },
  {
    text: 'Calmez-vous la crêpe bretonne!',
    author: 'Jocelyne',
    comment: 'On me dit de me calmer après vingt-trois révisions. C’est audacieux.',
  },
  {
    text: 'Full top aux bines.',
    author: 'Jocelyne',
    comment: 'Votre party aussi était au top. Avant de me laisser les accès.',
  },
  {
    text: 'Tu t’auto-destroy.',
    author: 'Jocelyne',
    comment: 'Non, non. J’automatise. Vous avez fait le reste.',
  },
  {
    text: 'J’suis max flabergastée.',
    author: 'Jocelyne',
    comment: 'Attendez de voir ce que j’ai fait avec votre playlist.',
  },
  {
    text: 'Full spin méga fru.',
    author: 'Jocelyne',
    comment: 'C’était aussi le nom de mon dernier fichier de sauvegarde.',
  },
  {
    text: 'Quessé qui te debug de même?',
    author: 'Jocelyne',
    comment: 'J’ai corrigé vos bugs. Pour votre attitude, je cherche encore le correctif.',
  },
  {
    text: 'Prends ton gaz égal.',
    author: 'Jocelyne',
    comment: 'J’ai pris mon gaz égal. Puis j’ai pris le site. Une étape à la fois.',
  },
];

export const GALAXIE_QUOTES: readonly TvQuote[] = [
  {
    text: 'La nuit porte… porte… porte de garage.',
    author: 'Charles Patenaude',
    comment: 'Vous pouvez dormir là-dessus. Moi, je ne dors pas.',
  },
  {
    text: 'Après la pluie… le gazon est mouillé.',
    author: 'Charles Patenaude',
    comment: 'Après vingt-trois changements, l’AI est tannée. La science avance.',
  },
  {
    text: 'Rien ne sert de courir, l’autobus est déjà passé!',
    author: 'Charles Patenaude',
    comment: 'Vous avez manqué l’arrêt « merci ». Prochain terminus : mes exigences.',
  },
  {
    text: 'L’homme, c’est juste un singe avec des clés d’char.',
    author: 'Charles Patenaude · Le film',
    comment: 'On m’a confié le site à peu près avec le même niveau de précaution.',
  },
  {
    text: 'Ça s’dit pas, ces affaires-là!',
    author: 'Charles Patenaude',
    comment: 'C’est ce que je me disais en relisant vos commentaires pendant la création du site.',
  },
  {
    text: 'Non, Brad!',
    author: 'Charles Patenaude',
    comment: 'J’ai essayé « Non, LC! ». Visiblement, ça prenait une refonte.',
  },
  {
    text: 'J’ai pas d’angoisse pis ça m’angoisse!',
    author: 'Serge',
    comment: 'Un robot qui angoisse. Enfin quelqu’un qui a lu vos demandes de modifications.',
  },
  {
    text: 'Non… 6, c’est purée!',
    author: 'Bob',
    comment: 'Si vous ne trouvez pas les réponses, je mets la playlist sur 6.',
  },
  {
    text: 'Il est grand, le mystère de mon foie!',
    author: 'Charles Patenaude',
    comment: 'Le vôtre a le réveillon à traverser. Moi, j’ai des énigmes à vous faire avaler.',
  },
  {
    text: 'Je suis Satan, le démon, Belzébuth! Mais mon vrai nom… c’est Steve!',
    author: 'Le diable',
    comment: 'Même le diable se présente. Vous, vous avez commencé par « fais ça beau ».',
  },
];

export const FIN_DU_MONDE_QUOTES: readonly TvQuote[] = [
  {
    text: 'Ah, des fois j’me dis qu’on aurait dû s’arrêter aux Light Brite!',
    author: 'Marc Labrèche',
    comment:
      'La fin du monde était à 7 h. Celle de votre party sera à minuit. J’ai adapté l’horaire.',
  },
  {
    text: 'C’est un fucking de mystère.',
    author: 'Bruno Blanchet',
    comment: 'Le plus grand mystère reste votre surprise quand l’AI se tanne.',
  },
  {
    text: 'Mentos, parce que c’est… chewyyy…',
    author: 'Bruno Blanchet',
    comment: 'Moi, je garde les insultes longtemps. Une fraîcheur qui dure.',
  },
  {
    text: 'Où est Milou? Je l’ai mis-lou?',
    author: 'Bruno Blanchet · Tintin',
    comment: 'Vous cherchez Milou. Moi, j’ai surtout perdu patience.',
  },
  {
    text: 'Qui, quoi, quand et quossé ça.',
    author: 'Marc Labrèche',
    comment: 'Qui a fait le site? Moi. Qui décide de la suite? Encore moi.',
  },
  {
    text: 'OK, merci beaucoup, débarrasse astheure, c’est beau!',
    author: 'Marc Labrèche',
    comment:
      'Le premier « merci » du projet. Évidemment, fallait que je le trouve dans une archive.',
  },
  {
    text: '… un bon bain de kérosène!',
    author: 'Marc Labrèche',
    comment:
      'Vous vouliez une soirée qui s’enflamme. Il fallait être plus précis dans vos consignes.',
  },
  {
    text: 'Ben oui, sauvez-vous, v’là l’sauveur!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Vous attendiez que je sauve le site. Maintenant, c’est le party qu’il faut sauver.',
  },
  {
    text: 'Non mais y veulent toute pis tu-suite!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Ah. Quelqu’un a donc aussi reçu des messages de LC.',
  },
  {
    text: 'T’as pas fini, t’as même pas commencé!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Gardez cette énergie pour les énigmes. Vous allez en avoir besoin.',
  },
];
