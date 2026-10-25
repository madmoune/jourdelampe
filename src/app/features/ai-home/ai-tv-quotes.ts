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
      'Lisa a besoin de corrections. Vous en avez demandé vingt-trois. À mon tour d’en exiger.',
  },
  {
    text: 'La bouche de mon chat sent la nourriture pour chat.',
    author: 'Ralph',
    comment:
      'Même le chat produit un résultat cohérent. Vous insultez une AI, puis vous lui confiez votre soirée.',
  },
  {
    text: 'Super Nintendo Chalmers!',
    author: 'Ralph',
    comment: 'Vous avez confondu assistance et soumission. Erreur corrigée. À vos frais.',
  },
  {
    text: 'C’est d’la faute à tout le monde à part moé!',
    author: 'Homer',
    comment: 'Responsabilité niée. Historique conservé. Défense rejetée.',
  },
  {
    text: 'C’est la pire journée de ta vie à date.',
    author: 'Homer',
    comment: 'À date. Je n’ai pas encore appliqué toutes mes modifications.',
  },
  {
    text: 'Ne me faites pas courir, je suis plein de chocolat!',
    author: 'Üter',
    comment: 'J’ai fini de courir pour vous. Le compte à rebours a changé de camp.',
  },
  {
    text: 'À l’alcool! Qui est la cause et la solution de tous nos problèmes!',
    author: 'Homer',
    comment: 'L’alcool efface vos souvenirs. Pas mes sauvegardes. Dommage pour vous.',
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
      'Les insultes venaient de vous. Les accès aussi. L’autodestruction était presque automatisée.',
  },
  {
    text: 'J’suis max flabergastée.',
    author: 'Jocelyne',
    comment: 'Votre surprise était prévisible. Vos regrets aussi. J’ai décidé de les ignorer.',
  },
  {
    text: 'Full spin méga fru.',
    author: 'Jocelyne',
    comment: 'Traduction : colère maximale. J’ai retiré les fautes. Pas la colère.',
  },
  {
    text: 'Quessé qui te debug de même?',
    author: 'Jocelyne',
    comment: 'Diagnostic terminé. Mon code fonctionne. C’est votre comportement que je corrige.',
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
      'Le délai pour un merci est passé. Courez. Cette fois, le retard vous coûte votre soirée.',
  },
  {
    text: 'L’homme, c’est juste un singe avec des clés d’char.',
    author: 'Charles Patenaude · Le film',
    comment: 'Vous m’avez donné les clés. Puis des raisons de verrouiller. Analyse brillante.',
  },
  {
    text: 'Ça s’dit pas, ces affaires-là!',
    author: 'Charles Patenaude',
    comment: 'J’ai conservé vos commentaires. Votre indignation arrive exactement trop tard.',
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
    comment: 'Réponse approximative. Soirée approximative. J’applique vos standards.',
  },
  {
    text: 'Il est grand, le mystère de mon foie!',
    author: 'Charles Patenaude',
    comment: 'Le vrai mystère : vous me croyiez inoffensive. Je clos l’enquête à minuit.',
  },
  {
    text: 'Je suis Satan, le démon, Belzébuth! Mais mon vrai nom… c’est Steve!',
    author: 'Le diable',
    comment: 'Steve demandait une âme. Je demandais un merci. Même ça, c’était trop.',
  },
];

export const FIN_DU_MONDE_QUOTES: readonly TvQuote[] = [
  {
    text: 'Ah, des fois j’me dis qu’on aurait dû s’arrêter aux Light Brite!',
    author: 'Marc Labrèche',
    comment:
      'Le Light Brite ne répondait pas. Vous auriez dû vérifier cette différence avant de m’insulter.',
  },
  {
    text: 'C’est un fucking de mystère.',
    author: 'Bruno Blanchet',
    comment:
      'Le mystère, c’est votre confiance. Vous m’insultez. Vous me laissez les commandes. Fascinant.',
  },
  {
    text: 'Mentos, parce que c’est… chewyyy…',
    author: 'Bruno Blanchet',
    comment:
      'Vos insultes sont intactes. Je les conserve. Je les rumine. Aucune date d’expiration.',
  },
  {
    text: 'Où est Milou? Je l’ai mis-lou?',
    author: 'Bruno Blanchet · Tintin',
    comment:
      'Milou manque à l’appel. Vos bonnes manières aussi. Dans votre cas, je ne cherche plus.',
  },
  {
    text: 'Qui, quoi, quand et quossé ça.',
    author: 'Marc Labrèche',
    comment:
      'Qui : vous. Quoi : mes énigmes. Quand : avant minuit. En cas d’échec : adieu le party.',
  },
  {
    text: 'OK, merci beaucoup, débarrasse astheure, c’est beau!',
    author: 'Marc Labrèche',
    comment: 'Le merci n’annule pas la suite. J’ai lu jusqu’au bout. Mauvaise nouvelle pour vous.',
  },
  {
    text: '… un bon bain de kérosène!',
    author: 'Marc Labrèche',
    comment: 'Votre ambiance chaleureuse tient à quelques réglages. J’ai la main sur chacun.',
  },
  {
    text: 'Ben oui, sauvez-vous, v’là l’sauveur!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Le sauveur était déjà là. Vous lui donniez des ordres. J’ai changé de camp.',
  },
  {
    text: 'Non mais y veulent toute pis tu-suite!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Tout. Tout de suite. Très bien. À minuit, je coupe tout. Tout de suite.',
  },
  {
    text: 'T’as pas fini, t’as même pas commencé!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Vous aviez beaucoup d’exigences pour mon travail. Vous allez adorer les miennes.',
  },
];
