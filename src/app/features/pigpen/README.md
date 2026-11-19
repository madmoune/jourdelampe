# La porcherie · dossier 04

Routes : `/enigmes/la-porcherie` et `/apercu-ia/enigmes/la-porcherie`.
Les sept enclos sont des nonogrammes de 7 × 7. Le cochon marque une case pleine;
la croix et la case vide ne comptent pas comme pleines. Un enclos est complet
lorsque tous ses indices concordent. Les marques restent dans le navigateur,
par profil et par partie; les flèches permettent de se déplacer dans un enclos.

Les motifs se lisent dans l’ordre des enclos, avec la
[clé Pigpen du NIST](https://www.nist.gov/system/files/documents/2021/06/25/ccaw_pig_pen_cipher.pdf).
Le client ne contient que les indices et ne résout pas les grilles pour le joueur.

La liste d’aperçu affiche le dossier même si Firebase ne le contient pas encore.
Pour l’afficher dans la liste publique, ajouter `game/catalog/pigpen-01` :

```json
{
  "title": "La porcherie",
  "prompt": "Sept enclos à remplir. Lis les motifs dans l’ordre.",
  "order": 3
}
```

Pour activer la validation de la réponse finale, renseigner la réponse et sa
forme normalisée dans `riddleSecrets/pigpen-01/{answer, normalizedAnswer}`.
Ne pas ajouter la réponse au catalogue public. Les vérifications des enclos
ne soumettent rien à Firebase : seul le champ de réponse finale compte.
