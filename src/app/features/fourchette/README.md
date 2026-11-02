# La Fourchette

La page utilise le gabarit commun `RiddlePage` : titre, texte d’ambiance, réponse,
puis contenu. Le contenu et le texte d’ambiance sont provisoires, en attente des
détails de l’énigme.

- Identifiant stable : `fourchette-01`.
- Page publique : `/enigmes/la-fourchette`, à la même date d’ouverture que Nostalgie.
- Aperçu : `/apercu-ia/enigmes/la-fourchette`.
- Catalogue Firebase : `game/catalog/fourchette-01` (titre, description, ordre 1).
- Réponse privée à ajouter : `riddleSecrets/fourchette-01/{answer, normalizedAnswer}`.

Le catalogue permet l’affichage dans l’accueil, les résultats, les compteurs et
le tableau de bord en direct. Aucune réponse provisoire n’est configurée; la
gestion affiche « À définir ». Les essais sont conservés et la validation sera
active dès l’ajout de la réponse privée. Aucun essai ne peut réussir avant cela.

La saisie, le popup de réussite, le retour au portail et la restauration de la
réponse validée en lecture seule sont fournis par `RiddleAnswer`. Le libellé est
« Réponse » tant que le format est inconnu; `answerLabel` sur `RiddlePage` permettra
de préciser ce format ultérieurement.
