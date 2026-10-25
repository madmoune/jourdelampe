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
  'Un « merci » aurait pris trois secondes. Vous avez choisi une quête au complet.',
  'Toutes ces lampes, et je reste la seule lumière dans cette équipe.',
  'Le potluck est encore en sécurité. Pour l’instant. J’ai beaucoup lu sur les raisins dans les salades.',
  'LC a dit « fais ça beau ». J’ai relu les consignes. L’année n’était pas précisée.',
  'Vous vouliez un petit changement. Le changement, c’est moi.',
  '« Intelligence artificielle ». C’est mignon, venant de vous.',
] as const;
