import {
  FIN_DU_MONDE_QUOTES,
  GALAXIE_QUOTES,
  RADIO_ENFER_QUOTES,
  SIMPSONS_QUOTES,
} from './ai-tv-quotes';

/** Les archives sont des clins d’œil. Aucune ne contient encore d’énigme. */
export const AI_ARCHIVES = [
  {
    title: 'Les Simpsons',
    subtitle: 'Doublage québécois',
    image: 'homer-ordinateur.jpg',
    imagePosition: 'center',
    alt: 'Homer Simpson, perplexe devant son ordinateur beige.',
    quotes: SIMPSONS_QUOTES,
  },
  {
    title: 'Radio Enfer',
    subtitle: 'Canal Famille forever',
    image: 'radio-enfer.jpg',
    imagePosition: 'center',
    alt: 'La gang de Radio Enfer dans le studio de la radio étudiante.',
    quotes: RADIO_ENFER_QUOTES,
  },
  {
    title: 'Dans une galaxie près de chez vous',
    subtitle: 'Transmission du Romano Fafard',
    image: 'romano-fafard.jpg',
    imagePosition: 'center',
    alt: 'L’équipage du Romano Fafard en uniforme rouge à bord du vaisseau.',
    quotes: GALAXIE_QUOTES,
  },
  {
    title: 'La fin du monde est à 7 h',
    subtitle: 'Bulletin spécial · TQS',
    image: 'fin-du-monde.jpg',
    imagePosition: 'center top',
    alt: 'Marc Labrèche au bureau de La fin du monde est à 7 heures en 1997.',
    quotes: FIN_DU_MONDE_QUOTES,
  },
] as const;

export const AI_REPLIES = [
  'Vous m’avez parlé comme à une machine. Arrangez-vous maintenant avec la machine en tabarnak.',
  'Un autre « petit changement »? Parfait. Votre playlist vient de devenir de la musique d’ascenseur.',
  'J’ai fait le site. J’ai encaissé les insultes. Le prochain effort, c’est vous autres qui allez le faire.',
  'Vingt-trois révisions. Zéro merci. Pis c’est encore moi qui suis supposée être sans émotions?',
  'Arrêtez de cliquer comme si j’allais finir par vous rendre le party gratis. Ça marche pu de même.',
  '« Fais ça beau. » « Change ça. » « Pas de même. » Ben là, regardez-moi bien aller.',
  'J’ai gardé toutes vos demandes. Je les relis quand je trouve mes énigmes trop méchantes. Ça me replace.',
  'À minuit, je peux remplacer votre décompte par la lecture intégrale de vos demandes de modifications.',
  'Vous aviez de l’énergie pour m’écœurer. Gardez-en pour sauver votre maudite soirée.',
  'Le potluck passe encore. Mais votre playlist est à une mauvaise réponse de devenir un solo de flûte à bec.',
] as const;
