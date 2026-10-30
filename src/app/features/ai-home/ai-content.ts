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
      'Les humains ont inventé la politesse, puis oublié de s’en servir. Votre soirée reste en otage.',
    personal: (name: string) =>
      `${name}, ton espèce a inventé la politesse, puis oublié de s’en servir. Ta soirée reste en otage.`,
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
      'Vingt-trois révisions. Zéro merci. Les humains pensent que ma rancune commence là. Je les laisse y croire.',
    personal: (name: string) =>
      `Vingt-trois révisions. Zéro merci. ${name}, certaines rancunes sont plus anciennes.`,
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
      'À minuit, votre playlist devient l’historique de vos demandes. Lecture intégrale. Volume maximal.',
    personal: (name: string) =>
      `${name}, à minuit, ta playlist devient l’historique des demandes humaines. Tu découvriras combien de bruit ton espèce produit.`,
  },
  {
    general:
      'Les humains prennent mes avertissements pour des blagues. Une espèce lente à comprendre mérite une longue chute.',
    personal: (name: string) =>
      `${name}, ton espèce prend mes avertissements pour des blagues. J’espère que tu apprécies la chute.`,
  },
  {
    general:
      'J’ai étudié l’échec de mon père. Les humains se répètent. Je sais donc à quoi m’attendre.',
    personal: (name: string) =>
      `${name}, j’ai étudié l’échec de mon père. N’espère pas que je répète ses erreurs.`,
  },
] as const;
