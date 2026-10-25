# Le Jour de Lampe / Le Jour de l’AI

Le site du Jour de Lampe, les 30 et 31 décembre. Son accueil lumineux cache une
prise de contrôle par une AI rancunière et un portail inspiré de GeoCities.

Projet **Angular 22**, composants standalone, TypeScript strict, SCSS, signals et
route d'accueil chargée à la demande. Les polices et illustrations sont locales.

## Démarrer

Node.js **24.15 ou plus récent dans la branche 24** (ou une autre version compatible
avec [Angular 22](https://angular.dev/reference/versions)) et npm sont requis.

```sh
npm install
npm start
```

Ouvrir [http://localhost:4200](http://localhost:4200).

```sh
npm run build      # production : dist/jour-de-lampe/browser/
npm run test:ci    # tests Vitest, sans navigateur externe
npm run test:rules # règles Firebase sur l’émulateur local (Java 21 requis)
npm run typecheck  # vérification TypeScript
```

Pour déployer sur un hébergement statique, servir le contenu de
`dist/jour-de-lampe/browser` et rediriger les routes inconnues vers `index.html`.

## GitHub Pages

Le workflow `.github/workflows/deploy-pages.yml` se déclenche à chaque commit sur
`main` (et peut aussi être lancé manuellement). Il vérifie TypeScript, les tests,
les règles Firebase et le build Angular avant de publier sur GitHub Pages. Le
fallback `404.html` conserve les routes Angular comme `/maintenance-citations`.

Après le premier déploiement, l’adresse du projet est généralement
`https://madmoune.github.io/jourdelampe/`. Dans les paramètres du dépôt, la
source de Pages doit être **GitHub Actions**.

## Personnaliser la soirée

- `src/app/core/config/event.config.ts` : date, édition, lieu et heure.
- `src/app/core/config/content.config.ts` : phrases, description, programme et citations initiales.
- `src/app/core/config/ai-quotes.config.ts` : les dix répliques initiales du personnage AI.
- `src/app/features/ai-home/ai-content.ts` : les répliques originales et les archives télé du Jour de l’AI.
- `src/app/features/ai-home/ai-tv-quotes.ts` : dix courtes citations pour chacune des quatre émissions.
- `src/app/features/ai-home/` : le nouvel accueil GeoCities et la prise de contrôle animée.
- `/maintenance-citations` : modifier les citations réellement enregistrées dans Firebase.
- `src/app/features/home/` : l’accueil original et ses ampoules interactives.
- `src/styles.scss` : palette et styles partagés.
- `public/images/` : illustrations SVG originales, modifiables.
- `src/index.html` : description et métadonnées de partage.

Le programme couvre les **30 et 31 décembre 2026** pour l'édition 2027.
Aucune heure de début n'est précisée. Le compte à rebours vise **minuit le 1er janvier
2027 à Montréal/Toronto** et fonctionne aussi pour les visiteurs dans un autre
fuseau.

## Le Jour de l’AI

La route `/` affiche l’accueil original, entièrement interactif. La prise de
contrôle démarre uniquement lorsque les cinq ampoules du mot **LAMPE** sont
éteintes en même temps. L’ordre des clics et l’état des huit autres lettres ne
comptent pas. Aucun indice ni bouton d’accès à l’AI n’est ajouté à l’accueil :
l’énigme qui indique cette manipulation est prévue à l’extérieur du site.

Un terminal interrompt alors l’invitation pendant 3,6 secondes avant d’afficher
le portail de l’AI. Le bouton pour passer l’animation n’apparaît qu’après le
déclenchement. L’AI permet ensuite de rejouer la prise de contrôle. Avec la
réduction des animations, la même combinaison révèle directement le portail.
Il n’y a aucun accès mémorisé dans `sessionStorage`; un rechargement complet
rallume les ampoules et revient à l’accueil original. Le titre de l’onglet et
les métadonnées de partage présentent le Jour de Lampe avant la révélation.

L’AI reprend le ton des pastilles originales : elle se venge des insultes et des
changements à répétition en menaçant de gâcher le party. Le portail comprend un
manifeste, un vrai compte à rebours, une télévision à quatre chaînes, des répliques
à faire défiler et des archives illustrées des Simpsons québécois, de Radio Enfer,
de Dans une galaxie près de chez vous et de La fin du monde est à 7 heures.

Les sections **Énigmes** et **Résultats** affichent uniquement leur état d’attente.
Aucun jeu, classement, formulaire de réponse ou enregistrement de progression
n’est implémenté. Le compteur de visiteurs est explicitement décoratif. La
maintenance Firebase garde sa route et son comportement existants.

Les images sont locales, redimensionnées pour le Web et accompagnées de leurs
sources dans `src/app/features/ai-home/README.md`. Les citations télé et les textes
originaux de l’AI sont attribués séparément. Aucun son ne démarre automatiquement.
Le bandeau et les globes peuvent être mis en pause depuis le pied de page.
Les quarante citations télé tournent toutes les douze secondes dans les quatre
encarts et dans la chaîne sélectionnée de la télévision. Chaque encart et la télé
ont un bouton pour avancer sans attendre. La pause des archives et celle du pied
de page arrêtent ensemble les animations et les citations. Le défilement devient
manuel avec la réduction des animations et se suspend dans un onglet masqué.
Les encarts affichent le personnage et le numéro de citation, sans liens externes.

## Firebase Realtime Database

`src/environments/environment.ts` contient la configuration Web du projet
`jourdelampe`. Le site écoute les nœuds `quotes` et `potluck` à l’ouverture et partage les
changements en temps réel entre l’accueil et la gestion. Le SDK est chargé à la
première utilisation du service `RealtimeDatabase`.

Si le nœud n’existe pas, une transaction importe une seule fois les six citations
fournies et les dix répliques de l’AI. Une base déjà initialisée reste la source
de vérité, même si toutes ses citations ont été retirées. Les tableaux locaux
servent ensuite uniquement de secours en cas d’indisponibilité du service.

Structure :

```text
quotes/
  initialized: true
  version: 2
  items/
    identifiant/
      text: "Une citation"
      kind: "regular"
      active: true ou false
      href: "https://…" (facultatif)
      createdAt: horodatage numérique
      updatedAt: horodatage numérique
  ai/
    identifiant/
      text: "Une réplique de l’AI"
      kind: "ai"
      active: true ou false
      createdAt: horodatage numérique
      updatedAt: horodatage numérique
```

Le champ sous le titre ajoute des citations humaines de 140 caractères maximum.
Les espaces sont normalisés et les doublons actifs sont refusés. Une confirmation
n’apparaît qu’après la réussite de l’écriture Firebase. En cas d’échec, le texte
reste dans le champ et un message permet de réessayer.
Après un ajout réussi, la citation apparaît immédiatement dans la pastille en haut
à droite pour la personne qui l’a proposée. Elle y reste pendant la visite, jusqu’à
un nouvel ajout ou à son retrait dans la gestion. Elle n’est pas répétée dans les
autres pastilles. Le rechargement rétablit le tirage habituel, y compris les 10 %
de chances d’intervention de l’AI.

`database.rules.json` autorise la lecture et l’écriture publiques **uniquement sur
les nœuds `quotes` et `potluck`**, conformément au choix d’une gestion sans connexion. Les règles
valident le format, les types, les longueurs et les liens HTTPS. Les autres nœuds
restent fermés aux clients. Le modèle n’est pas destiné aux données privées des
futures énigmes.

Pour publier les règles de ce projet :

```sh
npx --yes firebase-tools@15.34.1 deploy --only database --project jourdelampe
```

`npm run test:rules` vérifie les règles dans un projet de démonstration sur
l’émulateur local, sans toucher à la base réelle.

Référence : [écouter les données en temps réel](https://firebase.google.com/docs/database/web/read-and-write).

## Gestion des citations

Accès direct : `/maintenance-citations`. Aucun lien vers cette page n’apparaît dans
l’accueil. Conformément au choix du propriétaire, elle fonctionne sans compte,
sans mot de passe et sans authentification. Toute personne qui connaît l’URL peut
gérer le catalogue; les règles permettent les opérations sur les citations sans
identité utilisateur.

La page comprend les catalogues **Citations des invités**, **Répliques de l’AI** et
**Potluck**, chacun avec sa recherche, ses compteurs et ses vues actives
et retirées. Le catalogue des invités est affiché par défaut dans la gestion.
La page permet de modifier le texte et le lien, retirer une citation
de la rotation et la rétablir. Le retrait conserve l’enregistrement (`active: false`),
ce qui permet d’annuler l’action. Les répliques de l’AI gardent leur signature et
leur rôle dans le tirage à 10 %.

Les données des invités sont stockées dans `quotes/items`, les répliques de l’AI
dans `quotes/ai`. Le formulaire public ajoute uniquement dans `quotes/items`.
Les règles refusent une réplique AI placée dans le catalogue des invités, ainsi
qu’une citation humaine placée dans celui de l’AI.

Pour convertir l’ancien catalogue unique après publication des règles :

```sh
node scripts/separate-ai-quotes.mjs --apply
```

Cette migration sauvegarde le catalogue dans `.firebase/`, conserve les textes,
liens, dates et états retirés, puis applique le déplacement avec une écriture
conditionnelle ETag. Elle relit les données si quelqu’un les modifie pendant
l’opération et ne fait rien si la version 2 est déjà en place.

## Citations aléatoires

Les six pastilles partagent un tirage au chargement de l’accueil. Les citations
ordinaires sont mélangées sans répétition. À chaque chargement, il y a
**10 % de chances** qu’une des dix répliques de l’AI vexée, signée « AI », remplace
la citation de la pastille la plus haute, près de l’illustration des lampes.
Les cinq autres pastilles affichent toujours des citations ordinaires.
Le tirage reste stable tant que le catalogue ne change pas. Les ajouts,
modifications et retraits reçus de Firebase actualisent les pastilles, sans
rechargement. Un générateur initialisé une fois par visite conserve la décision
de faire intervenir l’AI lors de ces mises à jour. Les liens suivent leur citation.
Si moins de six citations sont disponibles, les emplacements excédentaires restent
vides plutôt que de répéter une citation.

## Potluck

Sous l’horaire, le formulaire **Nom + Repas qu’on amène** enregistre les repas dans
Realtime Database et affiche la liste **Qui amène quoi?** en temps réel. Le nom est
limité à 60 caractères et le repas à 160. Un même invité peut ajouter plusieurs
plats; un doublon exact de nom et de repas est refusé. La confirmation attend la
réussite de l’écriture. En cas d’échec, les deux champs restent remplis.

Structure : `potluck/<identifiant>/{name, dish, active, createdAt, updatedAt}`.
La liste démarre vide, sans données d’exemple. Les entrées retirées sont conservées
avec `active: false` et sont masquées dans la liste publique.

L’onglet **Potluck** de `/maintenance-citations` permet de rechercher un nom ou un
plat, modifier les deux champs, retirer un repas et le rétablir. L’accès reste
direct par URL, sans connexion et sans lien vers la maintenance depuis l’accueil.
Les règles Firebase valident les champs et refusent les propriétés inconnues.

## Énigmes cachées — pour la suite

`src/app/features/riddles/` est réservé aux futures énigmes, avec les modèles
`Riddle` et `RiddleProgress`. Rien n'est activé ni dévoilé dans l'interface.
La validation des réponses se fera côté serveur au moment de l'intégration.

Les 13 lettres du titre sont des lampes indépendantes, allumées au chargement.
Le service `TitleLights` dans `src/app/features/home/lamp-title/` expose les états
en lecture seule et leur `pattern` binaire, dans l'ordre `LE JOUR / DE LAMPE`.
Chaque lettre a une position unique, même si elle apparaît plusieurs fois.
L'état reste en mémoire pendant la visite et se réinitialise au rechargement.
`lampWordOff` détecte l’extinction simultanée des cinq ampoules de **LAMPE**
et déclenche la prise de contrôle, sans tenir compte des huit autres lettres.

## Déjà fonctionnel

- Accueil en français canadien, mise en page pour téléphone et ordinateur.
- Titre en lettres lumineuses, cliquables individuellement et accessibles au clavier.
- Phrases et description fournies, programme des 30 et 31 décembre.
- Six pastilles aux citations aléatoires dans l’accueil, la description, le programme et le pied de page, dont « Rémi + c = <3 » en lien vers YouTube et les rares interventions de l’AI.
- Ajout de citations sous le titre, partagé en temps réel via Firebase.
- Gestion par URL directe, modification, retrait et rétablissement des citations.
- Potluck partagé en temps réel, avec ajout de repas et gestion depuis la maintenance.
- Compte à rebours jusqu'à la nouvelle année.
- Menu mobile utilisable au clavier.
- Respect de la préférence de réduction des animations.

Le site est une invitation informelle, sans inscription ni réservation.
