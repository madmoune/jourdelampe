# Premier puzzle Zebra

Page : `/enigmes/zebra`, accessible depuis le portail de l’AI après saisie du nom.
La saisie et la modification du nom restent uniquement dans le portail de l’AI.
La page Zebra attend le profil et n’affiche le jeu qu’avec un nom enregistré;
sinon, elle propose un lien vers la section des énigmes du portail.
Identifiant Firebase : `zebra-01`. Les pages sont reliées manuellement dans
`riddle-pages.ts`, sans interface d’ajout dynamique.

La grille triangulaire contient les six croisements entre Position, Nom,
Occupation et Nourriture. Les positions vont de 1 à 8; les trois autres catégories
ont quatre valeurs. Chaque personnage occupe une position distincte et quatre
positions restent libres. Les blocs qui utilisent les positions sont donc des
rectangles de 4 × 8, les autres de 4 × 4.

L’affichage suit l’escalier habituel : trois blocs en haut, deux au milieu,
un en bas. Les colonnes sont Position (1 à 8), Occupation, Nourriture; les groupes
de lignes sont Nom, Nourriture, Occupation. Référence visuelle pour l’escalier :
[introduction de Puzzle Baron](https://logic.puzzlebaron.com/how-to-solve-a-logic-puzzle.php?t=introduction).
Les noms sont à gauche et les huit positions en haut. Les blocs Nom–Occupation
et Nom–Nourriture sont transposés à l’affichage.
Les identifiants et coordonnées sauvegardés, ainsi que l’encodage de validation,
conservent leur orientation initiale pour préserver les déductions existantes.

Chaque clic sur une case fait défiler **oui (●) → non (×) → vide**, sans sélecteur
de mode. Une association bloque les autres cases de sa ligne et de sa colonne
dans son bloc. Passer de oui à non libère ces cases, en conservant leurs exclusions
manuelles et les blocages causés par d’autres associations. Les déductions entre différents
blocs restent à la charge du joueur. Les marques sont sauvegardées localement,
par profil et par partie; un changement de nom conserve la grille.

## Énoncés et solutions à fournir

Le bloc des énoncés est réservé dans `zebra-play.html`. La réponse finale est un
mot ou un code extrait de la grille, saisi séparément. Aucune solution n’a été
inventée pour cet aperçu. Le catalogue comporte `gridReady: false`; la vérification
partielle de la grille s’activera une fois sa solution configurée.
La réponse finale peut déjà être envoyée avec le bouton ou Entrée, indépendamment
de la complétude et du verdict de la grille. Chaque essai est enregistré et reçoit
un résultat du serveur. Sans réponse officielle configurée, aucun code n’est
reconnu : tous les essais sont non valides. L’ancien champ `answerReady` ne bloque
plus l’envoi ni la validation.

Configurer les solutions **uniquement dans le nœud privé**
`riddleSecrets/zebra-01`, via un accès administrateur :

- `answer` : mot ou code attendu, pour le tableau de bord protégé;
- `normalizedAnswer` : résultat de `normalizeAnswer(answer)`;
- `gridAnswer` : les 24 chiffres de la grille correcte (encodage ci-dessous).

Activer ensuite `game/catalog/zebra-01/gridReady` pour la vérification de grille. Ne jamais
placer ces solutions dans les fichiers publics ou le dépôt. Le navigateur ne
reçoit aucune solution, même pour la vérification partielle de la grille.

`encodeCompleteGrid` parcourt les six blocs de `ZEBRA_BLOCKS` dans l’ordre,
puis leurs quatre lignes dans l’ordre de `ZEBRA_CATEGORIES`, avant la transposition
d’affichage. Chaque chiffre est le numéro
de colonne sélectionnée (1 à 8 pour Position, 1 à 4 pour les autres). Le résultat
fait 24 chiffres. Il inclut tous les blocs et permet de détecter des déductions
contradictoires entre ceux-ci. La grille doit comporter exactement une
association par ligne et aucune colonne partagée dans chaque bloc.

Une grille complète est vérifiée automatiquement. Un verdict positif indique
seulement que la grille est correcte. Seule la réponse finale valide enregistre
une résolution, le nom et l’heure serveur, contribue au méta et ouvre le popup
offrant le retour à `/#enigmes`.

Les réponses finales et vérifications de grille sont enregistrées dans
`game/attempts/<uid>/zebra-01/<attemptId>` avec le nom, l’heure serveur, la partie
et un verdict validé côté serveur. Le joueur retrouve l’historique de ses mots
et codes, réussis ou incorrects. Ses essais sont privés (propriétaire et rôle
`gameAdmin` seulement). Une panne réseau ou un refus d’accès ne crée pas de faux
verdict « incorrect » et conserve le texte saisi.

Les deux confirmations du reset global effacent aussi les essais. Les grilles
locales de l’ancienne partie cessent d’être utilisées au changement de partie.
Le retour vers le portail conserve la révélation de l’AI en mémoire pendant la
navigation Angular; recharger l’accueil remet l’expérience originale.
