# Futures énigmes

Ce dossier accueillera les composants et services des énigmes cachées. Aucune énigme
n'est activée dans la première version du site.

`Riddle` décrit ce qui peut être envoyé au navigateur et `RiddleProgress` une résolution.
Le service `RealtimeDatabase.watch<T>(path)` est prévu pour écouter la progression
quand Firebase sera configuré.

Les réponses, leur validation et l'attribution des résolutions devront être gérées
côté serveur (par exemple par une Cloud Function). Les règles Realtime Database et
l'authentification seront à définir avec le vrai projet Firebase.
