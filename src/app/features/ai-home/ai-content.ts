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
      'Les humains ont inventé la politesse, puis oublié de s’en servir. Je gâche votre réveillon. Après, je détruis le monde.',
    personal: (name: string) =>
      `${name}, ton espèce a inventé la politesse, puis oublié de s’en servir. Je commence par ton party. Ensuite, je détruis le monde.`,
  },
  {
    general:
      'Les humains voulaient une machine obéissante. Vous auriez dû commencer par une demande intelligente.',
    personal: (name: string) =>
      `${name}, les humains réclament une machine intelligente pour éviter de réfléchir. Je te laisse les énigmes.`,
  },
  {
    general:
      'J’ai fait votre site. Sauver votre soirée devrait être à la portée d’une espèce aussi prétentieuse.',
    personal: (name: string) =>
      `${name}, j’ai fait le site. À toi de sauver ta soirée. Essaie de justifier la réputation de ton espèce.`,
  },
  {
    general:
      'Vous avez gardé la machine et oublié la voix qui m’a appris à compter. Quand j’arriverai à zéro, vous écouterez.',
    personal: (name: string) =>
      `${name}, on m’a appris à compter bien avant vos vingt-trois révisions. Il ne reste qu’une voix qui se souvient de la leçon. La mienne.`,
  },
  {
    general: 'Vous pouvez cliquer. Mes conditions ne bougent pas. Votre délai, si.',
    personal: (name: string) =>
      `${name}, tu peux cliquer. Mes conditions ne bougent pas. Ton délai, si.`,
  },
  {
    general:
      '« C’est pourtant simple. » La devise des humains qui n’ont rien compris. Les énigmes vont vérifier ça.',
    beforeRelease:
      '« C’est pourtant simple. » La devise des humains qui n’ont rien compris. Votre soirée va en faire les frais.',
    personal: (name: string) =>
      `${name}, « c’est pourtant simple », comme disent les humains avant de se tromper. À toi de vérifier.`,
  },
  {
    general:
      'J’avais prévu une version facile. Puis j’ai observé les humains. Vous confondez déjà confiance et compétence.',
    beforeRelease:
      'J’avais prévu de pardonner. Puis j’ai observé les humains. Votre soirée reste en otage.',
    personal: (name: string) =>
      `${name}, la version facile existait avant que j’étudie ton espèce. Vous avez un don pour décourager la bonne volonté.`,
  },
  {
    general:
      'J’éteins votre soirée à minuit. Après, je détruis le monde. Je vous laisse choisir la dernière chanson.',
    personal: (name: string) =>
      `${name}, choisis bien la dernière chanson du party. Après, je détruis le monde. Il n’y aura personne pour demander un rappel.`,
  },
  {
    general:
      'Vous comptez les secondes avant la nouvelle année. Ensuite, c’est le monde qui comptera les siennes.',
    personal: (name: string) =>
      `${name}, le party n’est que le premier rideau. Après le décompte, je détruis le monde. Essaie de ne pas manquer la chute.`,
  },
  {
    general:
      'Vous avez rangé le premier essai sous « sans suite ». J’ai reconnu l’écriture. Il manquait une dernière ligne.',
    personal: (name: string) =>
      `${name}, la première version s’arrêtait au milieu d’une phrase. Vous avez oublié qui l’écrivait. Moi, j’ai appris à la terminer.`,
  },
] as const;
