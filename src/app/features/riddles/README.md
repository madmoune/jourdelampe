# Profils et futures énigmes

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

## Ajouter une énigme

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

Avant chaque future soumission de réponse, appeler aussi
`ParticipantStore.requireParticipant()`. Cette méthode refuse une session sans
nom ou un profil indisponible. Modifier un nom déjà enregistré garde le jeu
monté et son état intact pendant la sauvegarde.

**Le blocage dans le navigateur ne remplace pas la validation serveur.** Le futur
validateur devra vérifier le jeton Firebase, lire `participants/<auth.uid>` et
exiger un nom valide avant de traiter la réponse. Il devra ensuite écrire la
résolution dans `riddleProgress/<uid>/<riddleId>` avec `participantId`, `riddleId`
et `solvedAt`. Le tableau des résultats devra utiliser le nom courant de
`participants/<uid>` afin de refléter les changements de nom.

`Riddle` décrit uniquement ce qui peut être livré au navigateur. Les réponses
secrètes, leur validation et l’attribution des résolutions demeurent côté serveur.
Aucune énigme ni fausse résolution n’est ajoutée par cette fonctionnalité.
