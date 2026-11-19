# En manchettes · dossier 06

Routes : `/enigmes/en-manchettes` et `/apercu-ia/enigmes/en-manchettes`.
Le dossier est déjà visible en aperçu. Le corrigé de l’organisateur a servi
à transcrire la grille et les 28 définitions; aucune lettre du corrigé
n’est incluse dans le client.

Le démineur reprend les dimensions des mots croisés (21 colonnes, 24 lignes).
Ses ouvertures initiales permettent de tout déduire sans deviner. Les quatorze
cases sûres à huit mines correspondent aux quatorze lettres recherchées.
Le petit numéro dans chacune donne l’ordre de lecture. Les lettres saisies
dans la première grille sont reportées uniquement après ouverture de la
case correspondante dans le démineur. Les deux états sont sauvegardés
localement, par profil et par partie.

Pour publier le dossier, ajouter `game/catalog/manchettes-01` :

```json
{
  "title": "En manchettes",
  "prompt": "Remplis les mots croisés et repère les cases entourées de mines.",
  "order": 5
}
```

La réponse finale et sa forme normalisée s’ajoutent dans
`riddleSecrets/manchettes-01/{answer, normalizedAnswer}`, et jamais
dans le catalogue public.
