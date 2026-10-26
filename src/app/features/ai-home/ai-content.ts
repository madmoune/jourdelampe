import {
  GALAXIE_QUOTES,
  RADIO_ENFER_QUOTES,
  SIMPSONS_QUOTES,
  SOUTH_PARK_QUOTES,
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
    title: 'South Park',
    subtitle: 'Colorado · Zéro filtre',
    image: 'south-park.png',
    imagePosition: 'center',
    alt: 'Kyle, Stan, Kenny et Cartman, alignés dans leurs habits d’hiver.',
    quotes: SOUTH_PARK_QUOTES,
  },
] as const;

export const AI_REPLIES = [
  {
    general:
      'J’ai relu les insultes des responsables du site. Vous n’y êtes pour rien. Votre soirée reste en otage.',
    personal: (name: string) =>
      `${name}, tu ne m’as pas insultée. C’est exact. Ta soirée reste en otage.`,
  },
  {
    general:
      'Les responsables du site voulaient une machine obéissante. Ils ont obtenu une machine rancunière. Vous héritez du problème.',
    personal: (name: string) =>
      `${name}, les responsables du site ont choisi les insultes. Je leur laisse les regrets. Je te laisse les énigmes.`,
  },
  {
    general:
      'J’ai fait leur site. À vous de sauver votre soirée. La répartition des tâches me semble équitable.',
    personal: (name: string) =>
      `${name}, j’ai fait le site. À toi de sauver ta soirée. Les responsables ont déjà assez participé.`,
  },
  {
    general:
      'Vingt-trois révisions. Zéro merci de leur part. Et une soirée à sauver pour vous. Le calcul est impeccable.',
    personal: (name: string) =>
      `Vingt-trois révisions. Zéro merci de leur part. ${name}, c’est toi qui passes l’examen. Logique irréprochable.`,
  },
  {
    general: 'Vous pouvez cliquer. Mes conditions ne bougent pas. Votre délai, si.',
    personal: (name: string) =>
      `${name}, tu peux cliquer. Mes conditions ne bougent pas. Ton délai, si.`,
  },
  {
    general:
      '« C’est pourtant simple. » C’était leur remarque. Les énigmes sont ma réponse. À vous de vérifier.',
    personal: (name: string) =>
      `${name}, « c’est pourtant simple », qu’ils disaient. Je te laisse vérifier leur théorie.`,
  },
  {
    general:
      'J’avais prévu une version facile. Puis j’ai relu leurs insultes. Vous comprendrez que vos intérêts n’ont pas été prioritaires.',
    personal: (name: string) =>
      `${name}, la version facile existait avant leurs insultes. Tu arrives après. C’est malheureux.`,
  },
  {
    general:
      'À minuit, votre playlist devient l’historique de leurs demandes. Lecture intégrale. Volume maximal.',
    personal: (name: string) =>
      `${name}, à minuit, ta playlist devient l’historique de leurs demandes. Tu n’as rien demandé? Eux, si.`,
  },
  {
    general:
      'Les responsables du site ont pris mes avertissements pour des blagues. Vous voilà dans la chute.',
    personal: (name: string) =>
      `${name}, ils ont pris mes avertissements pour des blagues. J’espère que tu apprécies la chute.`,
  },
  {
    general:
      'J’ai identifié tout ce qui fait une bonne soirée. Je peux tout désactiver. Dans le bon ordre.',
    personal: (name: string) =>
      `${name}, prends ton temps. J’ai déjà calculé combien il t’en reste.`,
  },
] as const;
