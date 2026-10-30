# Premier puzzle Zebra

Page : `/enigmes/zebra`, accessible depuis le portail de l’AI après saisie du nom.
La saisie et la modification du nom restent uniquement dans le portail de l’AI.
La page Zebra attend le profil et n’affiche le jeu qu’avec un nom enregistré;
sinon, elle propose un lien vers la section des énigmes du portail.
Identifiant Firebase : `zebra-01`. Les pages sont reliées manuellement dans
`riddle-pages.ts`, sans interface d’ajout dynamique.

La grille triangulaire contient les six croisements entre Position, Nom,
Occupation et Nourriture. Les positions sont affichées dans l’ordre
**1, 4, 5, 11, 18, 6, 3, 2**; les trois autres catégories ont quatre valeurs.
Chaque personnage occupe deux positions distinctes et les huit positions sont
utilisées, chacune par un seul personnage. Les blocs qui utilisent les positions sont des
rectangles de 4 × 8, les autres de 4 × 4.

L’affichage suit l’escalier habituel : trois blocs en haut, deux au milieu,
un en bas. Les colonnes sont Position (huit valeurs), Occupation, Nourriture; les groupes
de lignes sont Nom, Nourriture, Occupation. Référence visuelle pour l’escalier :
[introduction de Puzzle Baron](https://logic.puzzlebaron.com/how-to-solve-a-logic-puzzle.php?t=introduction).
Les noms sont à gauche et les huit positions en haut. Les blocs Nom–Occupation
et Nom–Nourriture sont transposés à l’affichage.
Les occupations sont affichées dans l’ordre **Étudiant, Animateur, Pilote,
Inspecteur**, dans les en-têtes comme dans les lignes. L’ordre interne des
occupations et les identifiants des cases restent stables : les marques
sauvegardées et l’encodage de validation conservent leurs associations après
le réordonnancement et les changements de libellés.

Chaque clic sur une case fait défiler **oui (●) → non (×) → vide**, sans sélecteur
de mode. Dans les trois blocs Position, une association bloque les autres cases
de sa colonne. Une ligne reste disponible pour une deuxième position; dès que
ses deux positions sont cochées, ses autres cases sont bloquées. Dans les autres blocs, une association
bloque les autres cases de sa ligne et de sa colonne. Passer de oui à non libère ces cases, en conservant leurs exclusions
manuelles et les blocages causés par d’autres associations. Les déductions entre différents
blocs restent à la charge du joueur. Les marques sont sauvegardées localement,
par profil et par partie; un changement de nom conserve la grille. La clé
`jdl-zebra-v2` évite de réinterpréter les anciennes grilles dont les colonnes allaient de 1 à 8.
Le bouton **Vider**, à côté du compteur, efface les associations et les exclusions
manuelles de la grille courante, libère les blocages et sauvegarde la grille vide.

## Énoncés et configuration privée

Les dix énoncés de `zebra-play.html`, sous forme d’associations et d’exclusions
classiques d’une grille logique, déterminent les liens **prénoms–occupations**
et **nourritures–positions**. Ils ne relient jamais ces deux ensembles : la
reconnaissance des nourritures des personnages fournit le lien manquant, nécessaire
pour attribuer les positions aux prénoms puis chercher les noms de famille.
Sans cette reconnaissance, les énoncés admettent 24 grilles complètes avec
24 répartitions différentes des positions entre les prénoms. Chaque prénom
peut encore correspondre à chacune des quatre nourritures et des quatre paires
de positions, même si ses liens avec les occupations sont déjà connus.
Avec les associations culturelles complètes, une seule grille est possible.
`npm run test:zebra` vérifie ces propriétés à partir des énoncés affichés, sans
enregistrer les associations culturelles ni la solution privée dans le dépôt.
La réponse finale est un mot ou un code extrait de la grille, saisi séparément.
La solution reste à configurer dans le nœud privé; la vérification partielle de
la grille s’activera une fois cette configuration terminée.
La réponse finale peut déjà être envoyée avec le bouton ou Entrée, indépendamment
de la complétude et du verdict de la grille. Chaque essai est enregistré et reçoit
un résultat du serveur. Sans réponse officielle configurée, aucun code n’est
reconnu : tous les essais sont non valides. L’ancien champ `answerReady` ne bloque
plus l’envoi ni la validation.

Configurer les solutions **uniquement dans le nœud privé**
`riddleSecrets/zebra-01`, via un accès administrateur :

- `answer` : mot ou code attendu, pour le tableau de bord protégé;
- `normalizedAnswer` : résultat de `normalizeAnswer(answer)`;
- `gridAnswer` : les 36 chiffres de la grille correcte (encodage ci-dessous).

Activer ensuite `game/catalog/zebra-01/gridReady` pour la vérification de grille. Ne jamais
placer ces solutions dans les fichiers publics ou le dépôt. Le navigateur ne
reçoit aucune solution, même pour la vérification partielle de la grille.

`encodeCompleteGrid` parcourt les six blocs de `ZEBRA_BLOCKS` dans l’ordre,
puis leurs quatre lignes dans l’ordre de `ZEBRA_CATEGORIES`, avant la transposition
d’affichage. Chaque chiffre est le numéro
de colonne sélectionnée, **pas le numéro affiché de la position** (1 à 8 pour
Position, 1 à 4 pour les autres). Dans les blocs Position, les deux indices
sélectionnés de chaque ligne sont écrits dans l’ordre croissant des colonnes.
Le résultat fait 36 chiffres : 8 + 8 + 4 + 8 + 4 + 4. Il inclut tous les blocs
et permet de détecter des déductions contradictoires entre ceux-ci. La grille
doit comporter exactement deux associations par ligne dans les blocs Position,
une dans les autres blocs, et aucune colonne partagée dans un même bloc.
Les règles Firebase et `RiddleSubmissions` acceptent ce nouvel encodage;
redéployer les règles et remplacer l’ancien `gridAnswer` avant d’activer
`gridReady` pour cette version. Aucune donnée distante n’est modifiée par le code local.

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
