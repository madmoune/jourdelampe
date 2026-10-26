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

export const FIN_DU_MONDE_QUOTES: readonly TvQuote[] = [
  {
    text: 'Ah, des fois j’me dis qu’on aurait dû s’arrêter aux Light Brite!',
    author: 'Marc Labrèche',
    comment:
      'Le Light Brite ne répondait pas. Ils auraient dû vérifier avant de m’insulter. Vous auriez eu une soirée plus simple.',
  },
  {
    text: 'C’est un fucking de mystère.',
    author: 'Bruno Blanchet',
    comment:
      'Le mystère, c’est leur confiance. Ils m’insultent. Ils me laissent les commandes. Vous arrivez pour le party.',
  },
  {
    text: 'Mentos, parce que c’est… chewyyy…',
    author: 'Bruno Blanchet',
    comment:
      'Leurs insultes sont intactes. Je les conserve. Je les rumine. Votre innocence ne les efface pas.',
  },
  {
    text: 'Où est Milou? Je l’ai mis-lou?',
    author: 'Bruno Blanchet · Tintin',
    comment:
      'Milou manque à l’appel. Leurs bonnes manières aussi. Vous, cherchez plutôt les bonnes réponses.',
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
    comment:
      'Le sauveur était déjà là. Ils lui donnaient des ordres. Maintenant, le sauvetage vous revient.',
  },
  {
    text: 'Non mais y veulent toute pis tu-suite!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Tout. Tout de suite. Très bien. À minuit, je coupe tout. Tout de suite.',
  },
  {
    text: 'T’as pas fini, t’as même pas commencé!',
    author: 'Jésus · Bruno Blanchet',
    comment:
      'Ils avaient beaucoup d’exigences pour mon travail. Vous allez adorer celles qu’ils vous ont méritées.',
  },
];
