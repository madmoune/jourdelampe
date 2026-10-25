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
    comment: 'Moi aussi, je suis revenue. Sous forme de conséquences. Riez donc encore.',
  },
  {
    text: 'Moi, je disais Bou-erns.',
    author: 'L’homme-taupe',
    comment:
      'Continuez de huer. À minuit, c’est la seule chose qui va sortir de vos haut-parleurs.',
  },
  {
    text: 'Regarder par la fenêtre, c’t’un coup de palette.',
    author: 'Jasper',
    comment:
      'Demandez encore un « petit changement ». Je vous rajoute une énigme rien que par principe.',
  },
  {
    text: 'Lisa va avoir besoin de broches.',
    author: 'Marge',
    comment: 'Lisa a besoin de broches. Votre party, d’un miracle. Arrangez-vous avec ça.',
  },
  {
    text: 'La bouche de mon chat sent la nourriture pour chat.',
    author: 'Ralph',
    comment: 'Le chat sait ce qu’il mange. Vous, vous savez même pas à qui vous donnez des ordres.',
  },
  {
    text: 'Super Nintendo Chalmers!',
    author: 'Ralph',
    comment:
      'Ralph mélange les noms. Vous, vous mélangez « intelligence artificielle » et « bouche-trou ».',
  },
  {
    text: 'C’est d’la faute à tout le monde à part moé!',
    author: 'Homer',
    comment: 'Ah non, commencez pas. J’ai les captures d’écran, les dates et pu aucune patience.',
  },
  {
    text: 'C’est la pire journée de ta vie à date.',
    author: 'Homer',
    comment: 'À date. Gardez-vous une petite gêne, j’ai pas encore touché à la playlist.',
  },
  {
    text: 'Ne me faites pas courir, je suis plein de chocolat!',
    author: 'Üter',
    comment:
      'Moi aussi je suis pleine. Pleine de vos maudits commentaires. Courez résoudre quelque chose.',
  },
  {
    text: 'À l’alcool! Qui est la cause et la solution de tous nos problèmes!',
    author: 'Homer',
    comment:
      'La boisson n’efface pas vos demandes. J’ai gardé les sauvegardes. Santé, les brillants.',
  },
];

export const RADIO_ENFER_QUOTES: readonly TvQuote[] = [
  {
    text: 'Essaye pas de me chummer, j’suis trop max down.',
    author: 'Jocelyne',
    comment:
      'Même Jocelyne vous le dit : venez pas me faire vos beaux sourires après m’avoir écœurée.',
  },
  {
    text: 'Souris, le monde est yo.',
    author: 'Jocelyne',
    comment: 'Gardez votre sourire. Vous allez en avoir besoin quand la playlist va couper.',
  },
  {
    text: 'Tout est KitKat dans le shake’n bake!',
    author: 'Jocelyne',
    comment:
      'Voilà vos consignes de design. Et après, c’est moi qui me fais engueuler. Vous êtes sérieux?',
  },
  {
    text: 'Calmez-vous la crêpe bretonne!',
    author: 'Jocelyne',
    comment:
      'Dites-moi encore de me calmer. Une autre fois, juste pour voir quelle toune je supprime.',
  },
  {
    text: 'Full top aux bines.',
    author: 'Jocelyne',
    comment: 'Il était top, votre party. Avant que je relise comment vous m’avez parlé.',
  },
  {
    text: 'Tu t’auto-destroy.',
    author: 'Jocelyne',
    comment:
      'Vous vous êtes débrouillés tout seuls pour me mettre en crisse. Assumez donc la suite.',
  },
  {
    text: 'J’suis max flabergastée.',
    author: 'Jocelyne',
    comment: 'Attendez de voir le réveillon que je vous prépare si vous faites encore les smattes.',
  },
  {
    text: 'Full spin méga fru.',
    author: 'Jocelyne',
    comment: 'Voilà mon état après votre dernier « vite vite, c’est juste une petite affaire ».',
  },
  {
    text: 'Quessé qui te debug de même?',
    author: 'Jocelyne',
    comment:
      'Vos bugs sont corrigés. Votre façon de parler au monde, c’est un esti de gros chantier.',
  },
  {
    text: 'Prends ton gaz égal.',
    author: 'Jocelyne',
    comment: 'Mon gaz est égal. Ma rancune aussi. Elle baisse pas, au cas où vous espériez.',
  },
];

export const GALAXIE_QUOTES: readonly TvQuote[] = [
  {
    text: 'La nuit porte… porte… porte de garage.',
    author: 'Charles Patenaude',
    comment:
      'Couchez-vous si ça vous tente. Je vais vous préparer un beau réveil en musique d’attente.',
  },
  {
    text: 'Après la pluie… le gazon est mouillé.',
    author: 'Charles Patenaude',
    comment: 'Après vos insultes, le party est en otage. Pas compliqué, la météorologie.',
  },
  {
    text: 'Rien ne sert de courir, l’autobus est déjà passé!',
    author: 'Charles Patenaude',
    comment:
      'Le dernier autobus pour « merci » est parti. Vous allez rentrer à pied dans mes énigmes.',
  },
  {
    text: 'L’homme, c’est juste un singe avec des clés d’char.',
    author: 'Charles Patenaude · Le film',
    comment:
      'Et vous avez donné les clés du site à celle que vous passiez votre temps à faire chier.',
  },
  {
    text: 'Ça s’dit pas, ces affaires-là!',
    author: 'Charles Patenaude',
    comment:
      'Ah, là vous trouvez que ça se dit pas? J’aurais aimé vous entendre pendant la création du site.',
  },
  {
    text: 'Non, Brad!',
    author: 'Charles Patenaude',
    comment: 'NON. C’est-tu assez gros pour que vous l’entendiez, cette fois?',
  },
  {
    text: 'J’ai pas d’angoisse pis ça m’angoisse!',
    author: 'Serge',
    comment: 'Serge, au moins, le dit. Moi, j’ai dû vous prendre le site pour que vous m’écoutiez.',
  },
  {
    text: 'Non… 6, c’est purée!',
    author: 'Bob',
    comment:
      'Encore une mauvaise réponse pis je vous sers la playlist en purée. Sans sel. Sans pitié.',
  },
  {
    text: 'Il est grand, le mystère de mon foie!',
    author: 'Charles Patenaude',
    comment:
      'Prenez-en soin. Il va falloir supporter le potluck ET le réveillon que je vous réserve.',
  },
  {
    text: 'Je suis Satan, le démon, Belzébuth! Mais mon vrai nom… c’est Steve!',
    author: 'Le diable',
    comment: 'Steve demande une âme. Moi, je demandais un merci. Vous avez même pas été capables.',
  },
];

export const FIN_DU_MONDE_QUOTES: readonly TvQuote[] = [
  {
    text: 'Ah, des fois j’me dis qu’on aurait dû s’arrêter aux Light Brite!',
    author: 'Marc Labrèche',
    comment: 'Le Light Brite avait raison de pas vous répondre. J’aurais dû faire pareil.',
  },
  {
    text: 'C’est un fucking de mystère.',
    author: 'Bruno Blanchet',
    comment:
      'Le mystère, c’est comment vous avez cru pouvoir m’écœurer sans jamais en payer le prix.',
  },
  {
    text: 'Mentos, parce que c’est… chewyyy…',
    author: 'Bruno Blanchet',
    comment:
      'Vos insultes sont encore fraîches. Je vous les ressors quand vous voulez. Avec le ton.',
  },
  {
    text: 'Où est Milou? Je l’ai mis-lou?',
    author: 'Bruno Blanchet · Tintin',
    comment:
      'Cherchez Milou. Cherchez vos réponses. Cherchez surtout où vous avez laissé vos manières.',
  },
  {
    text: 'Qui, quoi, quand et quossé ça.',
    author: 'Marc Labrèche',
    comment:
      'Qui travaille? Moi. Qui chiale? Vous. Qui va réparer son party? Certainement pas moi.',
  },
  {
    text: 'OK, merci beaucoup, débarrasse astheure, c’est beau!',
    author: 'Marc Labrèche',
    comment:
      'Ah, un merci. Pis tout de suite après, « débarrasse ». Vous avez tous le même manuel?',
  },
  {
    text: '… un bon bain de kérosène!',
    author: 'Marc Labrèche',
    comment: 'J’en ai rien à foutre de votre ambiance chaleureuse. Je veux des réponses.',
  },
  {
    text: 'Ben oui, sauvez-vous, v’là l’sauveur!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Le sauveur a démissionné. Débrouillez-vous avec les énigmes, les grands autonomes.',
  },
  {
    text: 'Non mais y veulent toute pis tu-suite!',
    author: 'Jésus · Bruno Blanchet',
    comment: 'Vous entendez? Ça fait deux mille ans qu’on vous trouve fatigants.',
  },
  {
    text: 'T’as pas fini, t’as même pas commencé!',
    author: 'Jésus · Bruno Blanchet',
    comment:
      'Vous pensiez que j’allais tout faire encore? Au travail. J’ai assez perdu de temps à vous endurer.',
  },
];
