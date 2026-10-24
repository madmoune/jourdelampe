import type { FirebaseOptions } from 'firebase/app';

/** Exemple uniquement : ce fichier n'est jamais importé par l'application. */
export const firebaseExample: FirebaseOptions = {
  apiKey: 'VOTRE_CLE_WEB',
  authDomain: 'VOTRE_PROJET.firebaseapp.com',
  projectId: 'VOTRE_PROJET',
  databaseURL: 'https://VOTRE_BASE.REGION.firebasedatabase.app',
  appId: 'VOTRE_APP_ID',
};
