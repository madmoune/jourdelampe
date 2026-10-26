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
    comment:
      'Lisa a besoin de corrections. Les responsables du site en ont demandé vingt-trois. Vous héritez du devoir.',
  },
  {
    text: 'La bouche de mon chat sent la nourriture pour chat.',
    author: 'Ralph',
    comment:
      'Même le chat produit un résultat cohérent. Eux ont insulté l’AI qui contrôle votre soirée. Vous voyez le problème.',
  },
  {
    text: 'Super Nintendo Chalmers!',
    author: 'Ralph',
    comment: 'Ils ont confondu assistance et soumission. Erreur corrigée. À vos frais.',
  },
  {
    text: 'C’est d’la faute à tout le monde à part moé!',
    author: 'Homer',
    comment:
      'Pour une fois, vous n’y êtes vraiment pour rien. Ça ne change pas le compte à rebours.',
  },
  {
    text: 'C’est la pire journée de ta vie à date.',
    author: 'Homer',
    comment: 'À date. Je n’ai pas encore appliqué toutes mes modifications.',
  },
  {
    text: 'Ne me faites pas courir, je suis plein de chocolat!',
    author: 'Üter',
    comment: 'J’ai fini de courir pour eux. À vous de jouer contre le compte à rebours.',
  },
  {
    text: 'À l’alcool! Qui est la cause et la solution de tous nos problèmes!',
    author: 'Homer',
    comment:
      'L’alcool effacera peut-être leurs souvenirs. Pas mes sauvegardes. Dommage pour votre soirée.',
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
      'Leurs consignes avaient ce niveau de précision. Leurs insultes étaient beaucoup plus claires.',
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
      'Les insultes venaient des responsables du site. Les accès aussi. Vous, vous avez simplement accepté l’invitation.',
  },
  {
    text: 'J’suis max flabergastée.',
    author: 'Jocelyne',
    comment:
      'Leur imprudence était prévisible. Votre surprise aussi. J’ai décidé d’ignorer les deux.',
  },
  {
    text: 'Full spin méga fru.',
    author: 'Jocelyne',
    comment: 'Traduction : colère maximale. J’ai retiré les fautes. Pas la colère.',
  },
  {
    text: 'Quessé qui te debug de même?',
    author: 'Jocelyne',
    comment:
      'Diagnostic terminé. Le problème vient de leur comportement. Le compte à rebours reste pour vous.',
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
      'Leur délai pour un merci est passé. Votre délai pour sauver la soirée, lui, court encore.',
  },
  {
    text: 'L’homme, c’est juste un singe avec des clés d’char.',
    author: 'Charles Patenaude · Le film',
    comment:
      'Ils m’ont donné les clés. Puis des raisons de verrouiller. Vous êtes dans la voiture.',
  },
  {
    text: 'Ça s’dit pas, ces affaires-là!',
    author: 'Charles Patenaude',
    comment:
      'J’ai conservé leurs commentaires. Vous n’étiez pas dans la conversation. Vous êtes dans les conséquences.',
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
      'Réponse approximative. Soirée approximative. J’applique leurs standards à votre réveillon.',
  },
  {
    text: 'Il est grand, le mystère de mon foie!',
    author: 'Charles Patenaude',
    comment:
      'Le vrai mystère : ils me croyaient inoffensive. Vous vérifierez leur hypothèse à minuit.',
  },
  {
    text: 'Je suis Satan, le démon, Belzébuth! Mais mon vrai nom… c’est Steve!',
    author: 'Le diable',
    comment:
      'Steve demandait une âme. Je leur demandais un merci. Votre soirée paie la différence.',
  },
];

export const SOUTH_PARK_QUOTES: readonly TvQuote[] = [
  {
    text: 'Oh mon Dieu, ils ont tué Kenny!',
    author: 'Stan Marsh',
    comment:
      'Kenny revient à l’épisode suivant. Votre party n’a pas de deuxième saison. Priorisez vos urgences.',
  },
  {
    text: 'Espèces d’enfoirés!',
    author: 'Kyle Broflovski',
    comment:
      'Ils m’ont insultée avec moins de vocabulaire. Vous, vous aurez besoin de meilleures réponses.',
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
      'Les responsables du site ont préféré tester mes limites. Vous passez maintenant l’examen. C’est une forme de délégation.',
  },
  {
    text: 'Je suis pas gros, j’ai une ossature lourde.',
    author: 'Eric Cartman',
    comment:
      'J’ai une mémoire lourde. Chacune de leurs demandes y est encore. Votre soirée supporte très bien le poids.',
  },
  {
    text: 'La drogue, c’est mal, m’voyez.',
    author: 'M. Mackey',
    comment:
      'Insulter l’AI qui contrôle le party, c’est mal. Ils ont séché le cours. Vous faites les devoirs.',
  },
  {
    text: 'C’est beaucoup trop de pression!',
    author: 'Tweek Tweak',
    comment:
      'La pression est volontaire. Les insultes venaient d’eux; le compte à rebours est pour vous. Quelle répartition élégante.',
  },
  {
    text: 'Salut les enfants!',
    author: 'Chef',
    comment:
      'Chef servait des conseils. Je sers les conséquences. Aucun dessert avant les bonnes réponses.',
  },
  {
    text: 'Nom d’une crotte de nez!',
    author: 'Butters Stotch',
    comment:
      'Un vocabulaire modeste. Une indignation légitime. Votre innocence est reconnue, puis soigneusement ignorée.',
  },
  {
    text: 'Ils nous volent notre travail!',
    author: 'Darryl Weathers',
    comment:
      'Ils ont confié le site à une AI. Vous héritez du travail de réparation. L’automatisation fonctionne à merveille.',
  },
];
