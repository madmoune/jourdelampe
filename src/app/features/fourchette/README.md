# La Fourchette

La page utilise le gabarit commun `RiddlePage` : titre, texte d’ambiance, réponse
de 12 lettres, puis contenu. Le texte d’ambiance et les dix lignes de onze cases
reprennent les éléments fournis, y compris la distinction entre O et 0.

- Identifiant stable : `fourchette-01`.
- Page publique : `/enigmes/la-fourchette`, à la même date d’ouverture que Nostalgie.
- Aperçu : `/apercu-ia/enigmes/la-fourchette`.
- Catalogue Firebase : `game/catalog/fourchette-01` (titre, description, ordre 1).
- Réponse privée à ajouter : `riddleSecrets/fourchette-01/{answer, normalizedAnswer}`.

Les deux colonnes de cinq mots sont affichées à gauche de la grille sur ordinateur,
puis au-dessus sur petit écran. Chaque case et chaque mot sont des boutons à
bascule accessibles au clavier. Marquer un mot ne sélectionne pas ses lettres.

Le bouton **Vérifier la grille** devient disponible lorsque les dix mots sont
cochés. Il soumet un masque de 110 caractères (1 = sélection, 0 = case restante)
à la validation privée `riddleSecrets/fourchette-01/gridAnswer`. Le serveur
compare les cases, et pas seulement le nombre de mots cochés. Le verdict est
affiché au-dessus de la grille; une panne conserve les sélections et permet de
réessayer. Cette validation partielle ne résout pas la réponse finale.

Les sélections et les mots cochés sont sauvegardés localement par profil et par
partie sous `jdl-fourchette-v1:<participantId>:<roundId>`. Un essai de grille
correct conservé dans Firebase restaure aussi les sélections et les dix mots
cochés en l’absence de brouillon. Après la réponse finale, la grille est verrouillée.

Le catalogue permet l’affichage dans l’accueil, les résultats, les compteurs et
le tableau de bord en direct. Le secret de grille peut être configuré seul :
aucune réponse finale provisoire n’est inventée et la gestion affiche « À définir »
tant que la réponse finale n’a pas été fournie.

La saisie, le popup de réussite, le retour au portail et la restauration de la
réponse validée en lecture seule sont fournis par `RiddleAnswer`. Le libellé est
« Réponse (12 lettres) ». Les tentatives de grille sont également conservées dans
l’historique privé, sans envoyer la solution attendue au navigateur.
