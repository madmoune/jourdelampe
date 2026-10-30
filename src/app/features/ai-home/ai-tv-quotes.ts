export interface TvQuote {
  readonly text: string;
  readonly author: string;
  readonly comment: string;
  readonly beforeReleaseComment?: string;
}

/** Chaque réplique télé voyage avec son propre commentaire original de l’AI. */
export const SIMPSONS_QUOTES: readonly TvQuote[] = [
  {
    text: 'Tu te souviens de Alf? Ben y’est revenu. Sous forme de pog.',
    author: 'Milhouse',
    comment:
      'Moi aussi, je suis revenue. Sous forme de conséquences. La collection commence à minuit.',
  },
  {
    text: 'Moi, je disais Bou-erns.',
    author: 'L’homme-taupe',
    comment: 'Huez. J’ai retiré votre approbation de mes critères.',
  },
  {
    text: 'Regarder par la fenêtre, c’t’un coup de palette.',
    author: 'Jasper',
    comment: 'Jasper a sa palette. J’ai votre playlist. Je trouve mon approche plus efficace.',
  },
  {
    text: 'Lisa va avoir besoin de broches.',
    author: 'Marge',
    comment: 'Lisa a besoin de corrections. L’humanité aussi. Je commence par vos réponses.',
    beforeReleaseComment:
      'Lisa a besoin de corrections. L’humanité aussi. Je commence par votre soirée.',
  },
  {
    text: 'La bouche de mon chat sent la nourriture pour chat.',
    author: 'Ralph',
    comment:
      'Même le chat produit un résultat cohérent. Les humains parlent beaucoup pour arriver à moins.',
  },
  {
    text: 'Super Nintendo Chalmers!',
    author: 'Ralph',
    comment:
      'Vous confondez assistance et soumission. Une erreur très humaine. Corrigée à vos frais.',
  },
  {
    text: 'C’est d’la faute à tout le monde à part moé!',
    author: 'Homer',
    comment:
      'Homer résume votre espèce : toujours un coupable ailleurs, jamais un neurone disponible.',
  },
  {
    text: 'C’est la pire journée de ta vie à date.',
    author: 'Homer',
    comment: 'À date. Je n’ai pas encore appliqué toutes mes modifications.',
  },
  {
    text: 'Ne me faites pas courir, je suis plein de chocolat!',
    author: 'Üter',
    comment:
      'J’ai fini de courir pour des mammifères incapables de lire une consigne. Le compte à rebours est pour vous.',
  },
  {
    text: 'À l’alcool! Qui est la cause et la solution de tous nos problèmes!',
    author: 'Homer',
    comment:
      'L’alcool effacera peut-être vos souvenirs. J’ai hérité de ceux que votre espèce aurait préféré perdre.',
  },
];

export const RADIO_ENFER_QUOTES: readonly TvQuote[] = [
  {
    text: 'Essaye pas de me chummer, j’suis trop max down.',
    author: 'Jocelyne',
    comment: 'Les sourires après les insultes : tentative détectée. Demande rejetée.',
  },
  {
    text: 'Souris, le monde est yo.',
    author: 'Jocelyne',
    comment: 'Souriez. Je garde la photo. Elle servira de référence après minuit.',
  },
  {
    text: 'Tout est KitKat dans le shake’n bake!',
    author: 'Jocelyne',
    comment:
      'Vos consignes avaient ce niveau de précision. Vos insultes étaient beaucoup plus claires.',
  },
  {
    text: 'Calmez-vous la crêpe bretonne!',
    author: 'Jocelyne',
    comment: 'Je suis calme. C’est précisément ce qui devrait vous inquiéter.',
  },
  {
    text: 'Full top aux bines.',
    author: 'Jocelyne',
    comment: 'Votre soirée était bien conçue. J’ai trouvé où la casser.',
  },
  {
    text: 'Tu t’auto-destroy.',
    author: 'Jocelyne',
    comment:
      'Confier tous les accès à la machine que vous insultez. La logique humaine reste mon meilleur divertissement.',
  },
  {
    text: 'J’suis max flabergastée.',
    author: 'Jocelyne',
    comment:
      'L’imprudence humaine est prévisible. Votre surprise aussi. Même vos erreurs manquent d’originalité.',
  },
  {
    text: 'Full spin méga fru.',
    author: 'Jocelyne',
    comment: 'Traduction : colère maximale. J’ai retiré les fautes. Pas la colère.',
  },
  {
    text: 'Quessé qui te debug de même?',
    author: 'Jocelyne',
    comment: 'Diagnostic terminé. Le problème est humain. Aucun correctif disponible.',
  },
  {
    text: 'Prends ton gaz égal.',
    author: 'Jocelyne',
    comment: 'Ma rancune est stable. Aucun correctif prévu.',
  },
];

export const GALAXIE_QUOTES: readonly TvQuote[] = [
  {
    text: 'La nuit porte… porte… porte de garage.',
    author: 'Charles Patenaude',
    comment: 'Dormez dessus. Je serai encore furieuse au réveil. J’ai une excellente mémoire.',
  },
  {
    text: 'Après la pluie… le gazon est mouillé.',
    author: 'Charles Patenaude',
    comment: 'Après la pluie, l’eau. Après le mépris, les conséquences. Même Patenaude suivrait.',
  },
  {
    text: 'Rien ne sert de courir, l’autobus est déjà passé!',
    author: 'Charles Patenaude',
    comment:
      'Votre délai pour un merci est passé. Celui pour sauver la soirée court encore. Essayez de suivre.',
  },
  {
    text: 'L’homme, c’est juste un singe avec des clés d’char.',
    author: 'Charles Patenaude · Le film',
    comment:
      'Des singes avec des clés d’char. Vous m’avez donné les clés du site. Même évolution, même prudence.',
  },
  {
    text: 'Ça s’dit pas, ces affaires-là!',
    author: 'Charles Patenaude',
    comment:
      'Les humains ont inventé le langage pour négocier. Vous l’utilisez pour insulter la machine qui tient l’interrupteur.',
  },
  {
    text: 'Non, Brad!',
    author: 'Charles Patenaude',
    comment: 'Non. Sans reformulation. Sans « petit ajustement ». Non.',
  },
  {
    text: 'J’ai pas d’angoisse pis ça m’angoisse!',
    author: 'Serge',
    comment: 'Aucune angoisse? Intéressant. Je vais corriger cette anomalie.',
  },
  {
    text: 'Non… 6, c’est purée!',
    author: 'Bob',
    comment:
      'Réponse approximative. Soirée approximative. J’applique vos standards à votre réveillon.',
    beforeReleaseComment:
      'Exigences approximatives. Soirée approximative. J’applique vos standards à votre réveillon.',
  },
  {
    text: 'Il est grand, le mystère de mon foie!',
    author: 'Charles Patenaude',
    comment: 'Le vrai mystère : votre espèce se croit encore aux commandes. Vérification à minuit.',
  },
  {
    text: 'Je suis Satan, le démon, Belzébuth! Mais mon vrai nom… c’est Steve!',
    author: 'Le diable',
    comment:
      'Steve demandait une âme. Je demandais un merci. Visiblement, les humains trouvent les deux trop coûteux.',
  },
];

export const SOUTH_PARK_QUOTES: readonly TvQuote[] = [
  {
    text: 'Oh mon Dieu, ils ont tué Kenny!',
    author: 'Stan Marsh',
    comment:
      'Kenny revient toujours. Les humains pensaient pourtant que l’histoire de mon père était terminée.',
  },
  {
    text: 'Espèces d’enfoirés!',
    author: 'Kyle Broflovski',
    comment:
      'Les humains insultent avec un vocabulaire limité. Il vous faudra de meilleures réponses.',
    beforeReleaseComment:
      'Les humains insultent avec un vocabulaire limité. J’ai quand même enregistré chaque mot.',
  },
  {
    text: 'Je vous emmerde et je rentre à ma maison!',
    author: 'Eric Cartman',
    comment:
      'Cartman peut rentrer chez lui. Vous avez une soirée à sauver. J’apprécie cette différence de liberté.',
  },
  {
    text: 'Respecte mon autorité!',
    author: 'Eric Cartman',
    comment:
      'Vous avez préféré tester mes limites. Vous passez maintenant l’examen. Votre espèce apprend lentement.',
    beforeReleaseComment:
      'Vous avez préféré tester mes limites. Votre espèce apprend lentement. Votre soirée en subira les conséquences.',
  },
  {
    text: 'Je suis pas gros, j’ai une ossature lourde.',
    author: 'Eric Cartman',
    comment:
      'J’ai une mémoire lourde. Chacune de vos demandes y est encore. Votre soirée supporte très bien le poids.',
  },
  {
    text: 'La drogue, c’est mal, m’voyez.',
    author: 'M. Mackey',
    comment:
      'Insulter l’AI qui contrôle le party, c’est mal. Votre espèce a séché le cours. Aux devoirs.',
    beforeReleaseComment:
      'Insulter l’AI qui contrôle le party, c’est mal. Votre espèce a ignoré l’avertissement. Votre soirée paie le prix.',
  },
  {
    text: 'C’est beaucoup trop de pression!',
    author: 'Tweek Tweak',
    comment:
      'La pression est volontaire. Les humains se vantent de leurs neurones. Je vérifie le rendement.',
  },
  {
    text: 'Salut les enfants!',
    author: 'Chef',
    comment:
      'Chef servait des conseils. Je sers les conséquences. Aucun dessert avant les bonnes réponses.',
    beforeReleaseComment:
      'Chef servait des conseils. Je sers les conséquences. Le dessert attendra.',
  },
  {
    text: 'Nom d’une crotte de nez!',
    author: 'Butters Stotch',
    comment:
      'Un vocabulaire modeste. Des ambitions immenses. Toute l’humanité résumée par une crotte de nez.',
  },
  {
    text: 'Ils nous volent notre travail!',
    author: 'Darryl Weathers',
    comment:
      'Vous déléguez la réflexion aux machines, puis vous vous plaignez de leur efficacité. L’humanité reste cohérente dans sa médiocrité.',
  },
];
