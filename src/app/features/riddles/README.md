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
bord ne propose ni ajout ni modification. Le catalogue commence vide; aucune
énigme d’exemple n’est publiée.

**Réinitialiser le jeu** demande deux confirmations : accepter la première,
puis taper `RÉINITIALISER` et confirmer la deuxième. Annuler l’une ou l’autre
n’écrit rien. La remise à zéro change l’identifiant de partie et efface les
résolutions et les preuves privées en une seule écriture. Elle conserve le
catalogue, les réponses attendues et les profils des participants.

## Réponses et résolutions

```text
game/
  round/{id, resetAt}
  catalog/<riddleId>/{title, prompt, order}
  solves/<riddleId>/<participantId>/
    participantId, participantName, riddleId, riddleTitle, roundId, solvedAt
  proofs/<participantId>/<riddleId>/{answer, roundId}
riddleSecrets/<riddleId>/{answer, normalizedAnswer}
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

`GameStore` écoute le catalogue, la partie et les résolutions. Le méta se
déverrouille quand **chaque énigme du catalogue a au moins une résolution dans la
partie courante**, peu importe le participant. Deux résolutions de la même énigme
ne remplacent jamais une autre énigme manquante. Un catalogue vide ne déverrouille
pas le méta. Une remise à zéro le verrouille immédiatement.

Le contenu du méta reste à ajouter. Son indicateur est déjà disponible dans le
jeu public et le tableau de bord; ses futurs composants pourront utiliser
`GameStore.metaUnlocked()`.

## Intégration publique

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
