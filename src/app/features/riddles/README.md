# Profils, énigmes et tableau de bord

Le portail de l’AI demande le **nom** du participant dans la section `#enigmes`.
Aucun courriel ni mot de passe n’est demandé. `AnonymousSession` utilise Firebase
Authentication pour conserver un identifiant dans le navigateur, puis
`ParticipantStore` enregistre le nom dans `participants/<uid>`. Un compte n’est
créé qu’à la première sauvegarde d’un nom valide, pas à chaque visite.

Le nom est limité à 60 caractères; les espaces sont normalisés et les noms vides
ou composés de caractères invisibles sont refusés. **Modifier mon nom** change le
nom du même profil. Les résolutions futures se rattachent à l’identifiant, jamais
au texte du nom : un changement de nom ne crée donc pas une nouvelle progression.
Deux personnes peuvent porter le même nom sans partager leur identifiant.
Chaque résolution conserve aussi le nom et le titre de l’énigme **au moment de la
réussite**, même si l’un ou l’autre est modifié ensuite.

Le profil se retrouve après un rechargement et se synchronise entre les onglets du
même navigateur et du même domaine. Un autre appareil, un autre navigateur ou
l’effacement des données du site crée une autre identité. Si le stockage du
navigateur est bloqué, la session fonctionne en mémoire jusqu’au rechargement.
Aucune récupération de profil ou fusion par nom n’est proposée.

## Activation Firebase

Dans le projet `jourdelampe`, ouvrir **Authentication → Commencer**, puis
**Mode de connexion → Anonyme → Activer**. Cette méthode ne demande aucune
information supplémentaire au participant. Publier aussi `database.rules.json` :

```sh
npx --yes firebase-tools@15.34.1 deploy --only database --project jourdelampe
```

La lecture des noms est publique pour le futur tableau des résultats. Seul le
propriétaire authentifié peut créer ou modifier son profil. Les règles refusent
la suppression du profil, les noms vides, les champs inconnus et les écritures de
résolutions par le navigateur. Un échec d’enregistrement conserve le nom saisi et
ne débloque pas l’accès.

Référence : [authentification anonyme Firebase](https://firebase.google.com/docs/auth/web/anonymous-auth).

## Gérer les énigmes

Accès direct : `/gestion-enigmes`. Aucun lien public ne mène à ce tableau de bord.
Le mot de passe est vérifié par Firebase Authentication, avec un compte technique
distinct (`gestion-enigmes@jourdelampe.firebaseapp.com`) et le rôle Firebase
`gameAdmin: true`. Le mot de passe n’est stocké ni dans le dépôt ni dans le build.
La connexion est gardée en mémoire : recharger la page demande de se reconnecter.
Se connecter à la gestion ne change pas le profil de joueur du même navigateur.

Le tableau affiche le nom de chaque énigme, sa réponse, son état et toutes ses
résolutions (nom et heure de Montréal, avec les secondes). Les énigmes et leurs
réponses sont configurées manuellement lors de leur intégration; le tableau de
bord ne propose ni ajout ni modification. Le premier puzzle est Zebra,
sur `/enigmes/zebra`; les énoncés sont intégrés et les solutions restent à
configurer dans le nœud privé.

La section **Joueurs enregistrés** suit en temps réel tous les profils de
`participants`, y compris ceux sans réussite. Chaque fiche affiche la progression
personnelle (nombre et pourcentage d’énigmes résolues), l’accès au méta selon le
mode courant, la dernière réussite et le détail des énigmes résolues ou restantes.
La contribution compte les énigmes dont le joueur a obtenu la première résolution
du groupe; plusieurs réussites au même horodatage sont créditées à chacun.
Ces compteurs utilisent seulement le catalogue et les résolutions de la partie
courante. Une remise à zéro conserve les profils et remet leurs compteurs à zéro.
Un changement de nom conserve la progression; deux profils du même nom restent
deux joueurs distincts. Cette section est affichée uniquement après connexion à
la gestion et ne modifie aucune donnée de jeu.

**Réinitialiser le jeu** demande deux confirmations : accepter la première,
puis taper `RÉINITIALISER` et confirmer la deuxième. Annuler l’une ou l’autre
n’écrit rien. La remise à zéro change l’identifiant de partie et efface les
résolutions, les essais et les preuves privées en une seule écriture. Elle conserve le
catalogue, les réponses attendues et les profils des participants.

Le choix **Individuel / En équipe** s’applique à tous les joueurs en temps réel,
sans confirmation supplémentaire ni suppression des réussites. Seul le compte
`gameAdmin` peut modifier `game/settings/mode`. Le mode reste conservé lors d’une
réinitialisation. Sans réglage enregistré, les parties existantes restent en équipe.

## Réponses et résolutions

```text
game/
  settings/{mode: "individual" | "team"}
  round/{id, resetAt}
  catalog/<riddleId>/{title, prompt, order, answerReady?, gridReady?}
  solves/<riddleId>/<participantId>/
    participantId, participantName, riddleId, riddleTitle, roundId, solvedAt
  proofs/<participantId>/<riddleId>/{answer, roundId}
  attempts/<participantId>/<riddleId>/<attemptId>/
    kind, answer, normalizedAnswer, correct, participantName, roundId, submittedAt, target?
riddleSecrets/<riddleId>/{answer, normalizedAnswer, gridAnswer?, surnames?}
```

Le catalogue, la partie en cours et les résolutions sont publics. Les réponses
attendues et les preuves de validation sont réservées à l’administrateur,
y compris pour les requêtes directes vers Firebase. Les anciennes branches
`riddles` et `riddleProgress` ne servent pas au jeu.

`RiddleSubmissions` vérifie le profil, normalise la réponse et soumet une preuve
privée accompagnée de la résolution en une écriture atomique. Les règles Firebase
comparent cette preuve à la réponse attendue **côté serveur**, exigent le nom du
profil authentifié et utilisent l’heure du serveur (`solvedAt`). Une réponse
incorrecte ne crée ni preuve ni résolution. Les accents, majuscules, espaces et
ponctuation ne comptent pas; les réponses doivent contenir des lettres ou chiffres.

Chaque réponse finale, correcte ou incorrecte, est conservée dans l’historique
privé du participant, accessible à l’administrateur. Cet historique n’est plus
chargé ni affiché dans les pages des joueurs. Le serveur vérifie aussi son verdict. Une bonne réponse
enregistre l’essai et la résolution atomiquement; une mauvaise réponse enregistre
seulement l’essai. Une erreur technique conserve la saisie et ne compte pas comme
une réponse incorrecte. Le popup de succès propose un retour au portail des énigmes.
Les vérifications partielles de grille (`kind: grid`) ne résolvent pas l’énigme.
Une grille complète est vérifiée automatiquement dès que son `gridAnswer` privé est
configuré; `gridReady` reste accepté dans le catalogue pour compatibilité, mais ne
bloque plus cette vérification.
Pour Zebra, une grille correcte autorise ensuite les quatre vérifications
`kind: surname`, chacune portant le prénom ciblé dans `target`; les noms attendus
restent dans `riddleSecrets/<riddleId>/surnames` et ne sont jamais envoyés au
navigateur. Ces essais sont conservés dans l’historique administrateur sans
apparaître au joueur.
Le bouton et la touche Entrée envoient une réponse même avec une grille vide.
Sans réponse officielle dans le nœud privé, les essais sont enregistrés comme
non valides. Ajouter la solution privée active sa reconnaissance immédiatement;
l’ancien champ public `answerReady` ne sert plus de blocage.

Un essai incorrect est validé et enregistré en un seul appel serveur. Si le serveur
refuse ce verdict parce que la réponse est correcte, un second appel enregistre
atomiquement l’essai réussi, la preuve et la résolution. Une panne ou un refus des
deux verdicts reste une erreur technique, jamais une fausse réussite.
`RiddleReplies` fait tourner douze commentaires originaux de l’AI, personnalisés
avec le nom courant, sans répétition dans une série ni entre deux séries successives.
La rotation avance uniquement après une mauvaise réponse confirmée par le serveur.
Voir `../zebra/README.md` pour la configuration privée de la première grille.

Une même personne ne peut résoudre qu’une fois la même énigme par partie. Plusieurs
personnes peuvent résoudre une énigme, et une réinitialisation leur permet toutes
de recommencer. L’identifiant de partie refuse les soumissions d’une partie
précédente, même si elles étaient en cours pendant la remise à zéro.

Les écritures passent par REST pour que les abonnements temps réel ne diffusent
jamais de résolution optimiste avant son acceptation par les règles. Aucun nom,
horodatage ou succès fourni uniquement par le navigateur n’est accepté sans
validation. Les tests de règles vérifient aussi les écritures atomiques forgées,
les suppressions, les faux noms et les horodatages imposés par un client.

## Progression et méta

`GameStore` écoute le catalogue, la partie, les résolutions et les réglages.
`PlayerProgress` fournit la progression du joueur selon le mode :

- **Individuel** : le méta exige une résolution personnelle de chaque énigme.
  Les résultats affichés et les informations débloquées suivent le profil courant.
- **En équipe** : chaque énigme doit avoir été résolue au moins une fois par
  quelqu’un pour débloquer le méta pour tout le monde. Les résultats et informations
  débloquées sont communs. Une réussite d’équipe n’attribue aucune résolution aux
  autres joueurs : ils peuvent encore résoudre l’énigme à leur nom.

Deux résolutions de la même énigme ne remplacent jamais une autre énigme manquante.
Un catalogue vide reste verrouillé. Une remise à zéro verrouille immédiatement le
méta dans les deux modes. Changer de mode peut verrouiller ou déverrouiller le méta
selon les réussites existantes, sans les modifier.

Le contenu du méta reste à ajouter. Son indicateur est déjà disponible dans le
jeu public et le tableau de bord; ses futurs composants pourront utiliser
`PlayerProgress.metaUnlocked()`. Les futures informations obtenues après une énigme
peuvent suivre `PlayerProgress.riddles()[…].infoUnlocked`; `solvedByMe` reste personnel
dans les deux modes. Aucun contenu de méta ni information de récompense n’est encore
intégré. Pour son suivi global, le tableau de bord utilise
`GameStore.teamMetaUnlocked()` ou `GameStore.individualMetaCount()`.

## Intégration publique

Toutes les pages d’énigmes utilisent `RiddlePage` avec l’ordre **titre → flavortext
→ champ de réponse → énigme**. Le contenu du puzzle est fourni dans un
`ng-template` et n’est créé qu’après disponibilité du profil enregistré. Le champ
de réponse est indépendant de la grille et du type d’énigme; `RiddleSubmissions`
continue d’enregistrer les essais dans Firebase, sans historique visible pour le joueur.

```html
<app-riddle-page riddleId="identifiant" title="Titre" flavorText="Texte d’ambiance">
  <ng-template>
    <!-- Contenu de l’énigme, sans second formulaire de réponse -->
  </ng-template>
</app-riddle-page>
```

`number` est facultatif et ajoute le numéro de dossier dans l’en-tête et le titre.
Le gabarit conserve les liens de retour vers le portail public ou l’aperçu.

`RiddleAccess` crée le contenu de son `ng-template` seulement quand un nom a été
enregistré avec succès et que le profil est disponible. Placer les futurs jeux
et leurs formulaires dans ce bloc, déjà présent dans `ai-home.html` :

```html
<app-riddle-access>
  <ng-template>
    <!-- Composants d’énigmes et formulaires de réponse -->
  </ng-template>
</app-riddle-access>
```

Avant chaque soumission de réponse, appeler aussi
`ParticipantStore.requireParticipant()`. Cette méthode refuse une session sans
nom ou un profil indisponible. Modifier un nom déjà enregistré garde le jeu
monté et son état intact pendant la sauvegarde.

Le portail utilise `RiddleGame` dans ce bloc et `RiddleResults` pour le suivi public.
`Riddle` décrit uniquement ce qui peut être livré au navigateur. `RiddleProgress`
décrit une résolution confirmée. Ne jamais ajouter une réponse au modèle public.

Référence : [conditions de validation Firebase](https://firebase.google.com/docs/database/security/rules-conditions).
