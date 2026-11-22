# La vigie · dossier 05

Routes : `/enigmes/la-vigie` et `/apercu-ia/enigmes/la-vigie`.
La liste d’aperçu inclut ce dossier avant son inscription dans Firebase.

Le sudoku de 9 × 9 contient 36 chiffres donnés et se déduit sans supposition.
Les deux chiffres indiqués pour chacun des neuf blocs donnent des positions à
lire de face, comme les poses du [sémaphore](https://www.nist.gov/system/files/documents/2022/08/24/ccaw_flag_poster_508compliant.pdf)
utilisées dans la fiche de référence du site. Après résolution de la grille,
le jeu dessine les directions sans donner le texte décodé. La grille est
sauvegardée localement pour chaque profil et chaque partie.

Pour publier le dossier, ajouter `game/catalog/sudoku-01` :

```json
{
  "title": "La vigie",
  "prompt": "Remplis la grille, puis déchiffre les neuf poses.",
  "order": 4
}
```

Renseigner la réponse et sa forme normalisée dans
`riddleSecrets/sudoku-01/{answer, normalizedAnswer}` pour activer le champ de
réponse finale. Le sudoku ne soumet rien à Firebase tant que le joueur n’envoie
pas sa réponse finale.
