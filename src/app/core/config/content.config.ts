import type { Quote } from '../models/quote';

/** Textes fournis pour le Jour de Lampe. */
export const CONTENT = {
  phrases: {
    theme: 'Une thématique éclairée!',
    light: 'Un thème lumineux!',
    lumens: "Lumens-en d'la lumière!",
  },
  description:
    "Cette année, c’est facile, amenez de la lumière! Que ce soit la lampe-table à Max, votre encastrée préférée ou encore les 700,000 frontales de LC qui donnent le goût d’être Ray Charles quand on les reçoit dans face, faisons comme si Jean-Marc Parent était dans place et flashons ça jusqu’à temps que l'épilepsie prenne le dessus!",
  quotes: [
    { id: 'dream', text: 'Le plus grand rêve de Louis-Charles', href: null },
    { id: 'photon', text: "J'y crois pas! Photon chez l'yable!", href: null },
    { id: 'wave', text: 'Onde-vrait pas manquer ça!', href: null },
    {
      id: 'ultraviolet',
      text: "Si y'a trop de lumière on va voir que mon visage est ultra-vio-laid.",
      href: null,
    },
    {
      id: 'infrared',
      text: "Comment t'appelle ça un rongeur bourgogne? Un f-rat rouge.",
      href: null,
    },
    {
      id: 'remi',
      text: 'Rémi + c = <3',
      href: 'https://www.youtube.com/watch?v=pv1kirNU8n4',
    },
  ] satisfies readonly Quote[],
  schedule: [
    {
      day: '30',
      month: 'décembre',
      activities: [
        'Glissade',
        'Chocolat chaud',
        'Café baileys',
        'Bottes humide',
        'Souper chez Roy et Dianne',
        'Bruit excessif',
      ],
    },
    {
      day: '31',
      month: 'décembre',
      activities: [
        'Amener une lampe pour vrai',
        'Amener de la nourriture pour le potluck',
        "S’habiller propre parce qu'avec autant de lumière on veut pas avoir l'air fou",
        'Dancefloor, décompte, alcool, maux de ventre',
        'Bruit excessif',
      ],
    },
  ],
} as const;
