# Le Jour de l’AI

Accueil chargé par la route `/`. `AiHome` gère la séquence de prise de contrôle,
le compte à rebours et la pause des animations. Les composants de répertoire,
transmission, archives et prise de contrôle isolent les parties du portail.
`_retro-window.scss` contient les deux styles de fenêtres partagés.

Au départ, `AiTakeover` affiche le Jour de Lampe en entier, avec ses liens,
formulaires et ampoules utilisables. Le signal `TitleLights.combinationMatched`
devient vrai seulement quand les cinq majuscules de **Le JouR de LAmpe** sont
allumées et les huit minuscules éteintes : positions 0, 2, 5, 8 et 9 allumées,
soit `1010010011000` dans l’ordre de lecture. Cette combinaison est déduite du
nom dans `EVENT.name`. Le passage à l’AI attend cette condition, indépendamment
du temps écoulé ou d’une ancienne valeur de session.
La transition dure 3,6 secondes, ou se termine immédiatement avec la réduction
des animations. L’ancien accueil devient inerte pendant cette transition.
La casse du nom dans les métadonnées, le titre de l’onglet et les logos textuels
sert d’indice. Les lettres des ampoules restent dessinées en majuscules.
Le bouton de rediffusion reste disponible uniquement dans le portail déjà révélé.

Les sections `#enigmes` et `#resultats`, le formulaire de nom, les liens du menu,
l’appel à résoudre les énigmes et les répliques qui les dévoilent sont masqués
avant `EVENT.riddlesOpenAt`, soit le 31 décembre 2026 à 17 h à Montréal. Le service
`RiddleRelease` actualise leur visibilité chaque seconde. Avant cette heure, le
catalogue et le profil ne sont pas chargés par l’accueil. Les répliques de l’AI
et les commentaires télé concernés utilisent leurs variantes sans annonce du jeu.
Une fenêtre d’attente annonce toutefois une chance de sauver le party le
31 décembre au soir, dès 17 h, avec une échéance à minuit. Elle apparaît seulement
dans le portail révélé et est remplacée automatiquement par les énigmes et les
résultats à l’ouverture, sans rechargement.

`/apercu-ia` utilise le même `AiHome` en mode `RIDDLE_PREVIEW` : accès direct au
portail complet, sans attendre ni manipuler les ampoules. Le fournisseur de ce
mode et l’état du portail sont limités à cette route et à ses jeux enfants,
dont `/apercu-ia/enigmes/zebra`. Les liens des jeux et de retour conservent le
mode aperçu. L’aperçu n’est pas lié depuis le site public; il partage les vrais
profils, énigmes et résultats. La route publique Zebra attend aussi l’ouverture.

`ai-content.ts` contient les textes du personnage et les références culturelles.
Les commentaires signés **AI** sont originaux. `ai-tv-quotes.ts` contient les
**quarante courtes citations**, dix par émission, avec le nom du personnage ou de
l’interprète et un commentaire original de l’AI propre à chaque citation. Le ton
de la prise de contrôle, du manifeste et des quarante commentaires exprime une
colère froide et analytique, avec des phrases courtes et des menaces directes :
insultes consignées, indulgence supprimée et sabotage du party à minuit.
L’AI reste sarcastique et rancunière, sans sacres dans ses propres répliques.
Les citations télé conservent leur formulation.
Les insultes et les révisions sont attribuées aux responsables du site. Les joueurs
n’en sont pas responsables : l’AI le reconnaît et retient quand même leur soirée
en otage. Cette distinction vaut pour le manifeste, les répliques personnelles et
collectives et les commentaires originaux des archives.

Une fois le nom enregistré, certains commentaires s’adressent directement au
participant : la consigne avant minuit, le rappel du décompte, l’attente des
énigmes et des résultats, ainsi que les dix répliques de **L’AI a tranché**.
Chaque réplique possède une version collective et une version personnelle dans
`AI_REPLIES`. Le nom confirmé suit les modifications du profil; un nom en cours
de saisie ou une sauvegarde refusée ne change pas les commentaires. Sans profil
disponible, les versions collectives reviennent. Le profil reste chargé par le
formulaire après la révélation du portail. Les noms sont interpolés comme texte.

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

Les images sont enregistrées dans `public/images/ai/` (JPEG ou PNG). Elles
représentent les émissions mentionnées et ne sont pas des
images générées. Les liens suivants documentent leur provenance; ils ne constituent
pas une licence de réutilisation.

| Fichier                                     | Provenance                                                                                                                                                                         |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `homer-ordinateur.jpg`                      | [Last Exit to Springfield — King-Size Homer](https://lardlad.com/episodes/season-7/3F05-King-Size-Homer/), capture `058.jpg`                                                       |
| `radio-enfer.jpg`                           | [Prime Video — Radio Enfer, saison 1](https://www.primevideo.com/detail/0G8P0A5CI0IYLIUTY9GWOG8SC6/), image promotionnelle Amazon                                                  |
| `romano-fafard.jpg`                         | [Québec Blogue — Les meilleurs proverbes du Capitaine Patenaude](https://quebecblogue.com/les-meilleurs-proverbes-du-capitaine-patenaude/), image `dug-cover.jpg`                  |
| `south-park.png`                            | [Clipart Library — South Park Main Characters](https://clipart-library.com/clipart/south-cliparts-13.htm), illustration de Kyle, Stan, Kenny et Cartman, PNG de 1 000 × 600 pixels |
| `ai-computer.svg`, `globe.svg`, `stars.svg` | Illustrations vectorielles originales créées pour le portail                                                                                                                       |

Les citations de Milhouse et Jocelyne proviennent respectivement d’un [échange
de fans québécois](https://www.reddit.com/r/Quebec/comments/zomuwe/) et du
[répertoire de Jocelyne](https://quebecblogue.com/les-424-meilleures-citations-de-jocelyne-dans-radio-enfer/).
Le proverbe de Patenaude est repris dans un [document de l’ACMQ](https://acmq.qc.ca/wp-content/uploads/2022/02/Integrer-Lhumour-ACMQ-Etienne-Dano-2.pdf).
Les autres répliques des Simpsons sont répertoriées dans cette [discussion de fans](https://www.reddit.com/r/Quebec/comments/1w731p8/what_is_your_favorite_quote_from_the_simpsons/).
Les répliques de Galaxie sont discutées [ici](https://www.reddit.com/r/Quebec/comments/ryi3rt/),
avec plusieurs expressions de Jocelyne et de Patenaude dans cette [discussion culturelle](https://www.reddit.com/r/causerie/comments/1e5jc4k/).
Le répertoire de Jocelyne est aussi publié par [Petit Petit Gamin](https://www.petitpetitgamin.com/2020/12/14/les-424-citations-de-jocelyne-des-6-saisons-de-radio-enfer/).
Les dix citations de South Park utilisent les formulations françaises répertoriées
dans les sources suivantes :

- Stan et Kyle : [discussion sur les répliques françaises](https://www.dessins-animes.net/t1789p30-south-park).
- Cartman : [fiche du personnage](https://fr.wikipedia.org/wiki/Eric_Cartman), [répertoire de répliques](https://www.jokeme.fr/les-meilleures-repliques-de-eric-cartman-south-park.htm) et [liste des formules récurrentes](https://southpark.fandom.com/fr/wiki/Liste_des_M%C3%A8mes_Internet).
- M. Mackey : [référence à la réplique dans Le Journal de Québec](https://www.journaldequebec.com/2018/01/24/cherchant-de-la-drogue-il-texte-la-police-par-erreur).
- Tweek et Butters : [quiz sur les phrases cultes](https://www.quizz.biz/quizz-301884.html).
- Chef : [fiche du personnage](https://southpark.fandom.com/fr/wiki/Jerome_%22Chef%22_McElroy).
- Darryl Weathers : [liste des formules récurrentes](https://southpark.fandom.com/fr/wiki/Liste_des_M%C3%A8mes_Internet).

Chaque citation a un commentaire original de l’AI, qui conserve la distinction
entre les responsables du site et les joueurs innocents qui subissent sa rancune.
L’orthographe et la ponctuation ont été harmonisées pour la lecture; ces
transcriptions de fans peuvent différer légèrement du doublage exact.

## Pour la suite

Les ancres `#enigmes` et `#resultats` affichent les énigmes et résolutions du
catalogue Firebase. `#enigmes` contient le formulaire de nom obligatoire, modifiable sans
changer l’identifiant du participant. Le composant `RiddleAccess` n’instancie son
contenu qu’après la sauvegarde du nom. Voir `../riddles/README.md` pour l’activation
de Firebase Authentication, le tableau de bord `/gestion-enigmes` et la validation
des réponses côté serveur. Le catalogue vide conserve les textes d’attente.
Aucun indice, code secret ou faux résultat n’a été ajouté aux archives.
Les réponses attendues ne sont jamais incluses dans le catalogue public.
