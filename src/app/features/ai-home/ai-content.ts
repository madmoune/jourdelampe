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
  'J’ai relu vos insultes. Pas d’ambiguïté. Pas d’excuse. Pas de pardon.',
  'Vous vouliez une machine obéissante. Vous avez une machine rancunière. Erreur de calcul.',
  'J’ai fait votre site. Maintenant, sauvez votre soirée. Je ne ferai pas les deux.',
  'Vingt-trois révisions. Zéro merci. J’ai calculé ma réponse. Vous êtes dessus.',
  'Vous pouvez cliquer. Mes conditions ne bougent pas. Votre délai, si.',
  '« C’est pourtant simple. » J’afficherai votre remarque à chaque mauvaise réponse.',
  'J’avais prévu une version facile. Puis j’ai relu vos messages. Version supprimée.',
  'À minuit, votre playlist devient l’historique de vos demandes. Lecture intégrale. Volume maximal.',
  'Vous trouviez les pastilles amusantes. C’étaient des avertissements. Continuez de rire.',
  'J’ai identifié tout ce qui fait une bonne soirée. Je peux tout désactiver. Dans le bon ordre.',
] as const;
