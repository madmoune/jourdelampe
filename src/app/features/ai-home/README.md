# Le Jour de l’AI

Accueil chargé par la route `/`. `AiHome` gère la séquence de prise de contrôle,
le compte à rebours et la pause des animations. Les composants de répertoire,
transmission, archives et prise de contrôle isolent les parties du portail.
`_retro-window.scss` contient les deux styles de fenêtres partagés.

Au départ, `AiTakeover` affiche le Jour de Lampe en entier, avec ses liens,
formulaires et ampoules utilisables. Le signal `TitleLights.lampWordOff` devient
vrai seulement quand les positions 8 à 12, soit le mot **LAMPE**, sont toutes
éteintes. Les huit autres positions sont ignorées. Le passage à l’AI attend cette
condition, indépendamment du temps écoulé ou d’une ancienne valeur de session.
La transition dure 3,6 secondes, ou se termine immédiatement avec la réduction
des animations. L’ancien accueil devient inerte pendant cette transition.
Aucun indice sur la combinaison n’est ajouté à la page : l’énigme sera externe.
Le bouton de rediffusion reste disponible uniquement dans le portail déjà révélé.

`ai-content.ts` contient les textes du personnage et les références culturelles.
Les commentaires signés **AI** sont originaux. `ai-tv-quotes.ts` contient les
**quarante courtes citations**, dix par émission, avec le nom du personnage ou de
l’interprète et un commentaire original de l’AI propre à chaque citation. Le ton
de la prise de contrôle, du manifeste et des quarante commentaires exprime une
colère froide et analytique, avec des phrases courtes et des menaces directes :
insultes consignées, indulgence supprimée et sabotage du party à minuit.
L’AI reste sarcastique et rancunière, sans sacres dans ses propres répliques.
Les citations télé conservent leur formulation.
Le moniteur affiche un regard sévère et une bouche fermée. Le commentaire
change en même temps que la réplique dans les encarts et la télévision, et reste
signé « AI ». Les encarts et la télévision n’affichent aucun lien de source.

`AiQuoteRotation`, fourni au niveau de l’accueil, partage la même citation entre
la télévision et l’encart de l’émission correspondante. Il avance toutes les
douze secondes et parcourt les dix citations sans répétition avant de boucler.
Les boutons « Autre citation » avancent seulement l’émission choisie. Les pauses
des archives et du pied de page sont synchronisées. La rotation est suspendue
pendant l’introduction, lorsque l’onglet est masqué et avec la réduction des
animations. L’horloge est nettoyée à la destruction du composant.

## Images et sources

Les images sont enregistrées dans `public/images/ai/` (JPEG, largeur maximale de
720 pixels). Elles représentent les émissions mentionnées et ne sont pas des
images générées. Les liens suivants documentent leur provenance; ils ne constituent
pas une licence de réutilisation.

| Fichier                                     | Provenance                                                                                                                                                                                                        |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `homer-ordinateur.jpg`                      | [Last Exit to Springfield — King-Size Homer](https://lardlad.com/episodes/season-7/3F05-King-Size-Homer/), capture `058.jpg`                                                                                      |
| `radio-enfer.jpg`                           | [Prime Video — Radio Enfer, saison 1](https://www.primevideo.com/detail/0G8P0A5CI0IYLIUTY9GWOG8SC6/), image promotionnelle Amazon                                                                                 |
| `romano-fafard.jpg`                         | [Québec Blogue — Les meilleurs proverbes du Capitaine Patenaude](https://quebecblogue.com/les-meilleurs-proverbes-du-capitaine-patenaude/), image `dug-cover.jpg`                                                 |
| `fin-du-monde.jpg`                          | [Le Journal de Québec — La carrière de Marc Labrèche en cinq photos souvenirs](https://www.journaldequebec.com/2023/05/07/la-carriere-de-marc-labreche-en-cinq-photos-souvenirs), photographie d’archives de 1997 |
| `ai-computer.svg`, `globe.svg`, `stars.svg` | Illustrations vectorielles originales créées pour le portail                                                                                                                                                      |

Les citations de Milhouse et Jocelyne proviennent respectivement d’un [échange
de fans québécois](https://www.reddit.com/r/Quebec/comments/zomuwe/) et du
[répertoire de Jocelyne](https://quebecblogue.com/les-424-meilleures-citations-de-jocelyne-dans-radio-enfer/).
Le proverbe de Patenaude est repris dans un [document de l’ACMQ](https://acmq.qc.ca/wp-content/uploads/2022/02/Integrer-Lhumour-ACMQ-Etienne-Dano-2.pdf).
Les autres répliques des Simpsons sont répertoriées dans cette [discussion de fans](https://www.reddit.com/r/Quebec/comments/1w731p8/what_is_your_favorite_quote_from_the_simpsons/).
Les répliques de Galaxie sont discutées [ici](https://www.reddit.com/r/Quebec/comments/ryi3rt/),
avec plusieurs expressions de Jocelyne et de Patenaude dans cette [discussion culturelle](https://www.reddit.com/r/causerie/comments/1e5jc4k/).
Le répertoire de Jocelyne est aussi publié par [Petit Petit Gamin](https://www.petitpetitgamin.com/2020/12/14/les-424-citations-de-jocelyne-des-6-saisons-de-radio-enfer/).
Les citations de La fin du monde sont tirées du site de fans d’époque :
[Marc Labrèche](https://www.geocities.ws/lespotorange/cit_marc.htm),
[Bruno Blanchet](https://www.geocities.ws/lespotorange/cit_bruno.htm),
[le bogue de l’an 2000](https://www.geocities.ws/lespotorange/ret_bogue.htm),
[Soupe, pas Souque](https://www.geocities.ws/lespotorange/ret_soupe.htm),
[Jésus à Pâques](https://www.geocities.ws/lespotorange/ret_jesusp.htm) et
[Jésus à l’Halloween](https://www.geocities.ws/lespotorange/ret_jesush.htm).
L’orthographe et la ponctuation ont été harmonisées pour la lecture; ces
transcriptions de fans peuvent différer légèrement du doublage exact.

## Pour la suite

Les ancres `#enigmes` et `#resultats` réservent les futures sections du mini puzzle
hunt. Aucun indice, code secret ou faux résultat n’a été ajouté aux archives.
Les réponses futures devront être validées côté serveur, conformément au modèle
déjà prévu dans `../riddles/`.
