# Salle d’arcade · dossier 07

L’aperçu est disponible à `/apercu-ia/enigmes/salle-arcade`. Le lien public est
`/enigmes/salle-arcade`. L’accès aux jeux utilise le profil des énigmes.

| Borne | Croix | A | B |
| --- | --- | --- | --- |
| Paper Morsio | Avancer ou reculer | Sauter | Recommencer |
| Pokemon Gold & Blind | Marcher ou choisir une attaque | Parler, combattre ou valider | Aide ou retour |
| Diablo 10 | Se déplacer dans la crypte | Frapper à portée | Lancer un sort |
| Final Fantaceasar 9 | Choisir une commande | Valider | Revenir à Attaquer |

Au clavier, les flèches et WASD correspondent à la croix. Dans l’écran de jeu,
le clic gauche déclenche A et le clic droit déclenche B. Z (ou Entrée ou
Espace) et X restent utilisables pour A et B. Au tactile, la croix et A
fonctionnent simultanément pour sauter en mouvement dans Paper Morsio et
combattre dans Diablo 10. La musique originale de Final Fantaceasar est
activée par le joueur et s’arrête à la fin du combat ou lorsqu’il quitte la borne.

Les quatre jeux donnent des indices pour la réponse de la salle d’arcade.
Chaque groupe du format `??? ??? ?? ???` figure sous le bouton du jeu correspondant.

Dans Paper Morsio, les balises séparent les groupes de trous au-dessus de la
lave et servent de points de reprise. Dans Gold & Blind, les portraits des créatures occupent les points
du braille dans une grille de six cases et restent visibles après un K.O.
Charge, Étincelle et les ripostes mettent les sprites en mouvement.
Diablo 10 affiche la vie et le mana avec des jauges sans chiffres.
Les deux attaques ont leurs propres animations. Quand elles touchent, les
dégâts en binaire apparaissent au-dessus du golem.
Dans Final Fantaceasar 9, l’équipe se tient à droite et VJW à gauche.
Attaquer et Magie ont leurs propres animations. Chaque attaque et chaque
riposte infligent neuf dégâts à chaque cible touchée.

Si le dossier doit être publié, sa fiche `game/catalog/arcade-01` portera le titre
« Salle d’arcade » et l’ordre 6. La réponse finale à valider reste à définir.

## Illustrations

Les fichiers WebP dans `public/images/arcade` sont des illustrations originales
créées avec ImageGen. Les décors sont exportés à 1 152 pixels de large. Les
personnages détourés sont découpés dans leurs planches et optimisés pour le jeu.

| Fichiers | Direction artistique demandée |
| --- | --- |
| `paper.webp` | Premier décor de Paper Morsio, un paysage en papier découpé et aquarelle. |
| `morsio-castle.webp` | Décor de château de Paper Morsio, avec des arches en carton, des fenêtres et des torches. Les plateformes et la lave sont dessinées dans le jeu. |
| `crypt.webp` | Crypte gothique isométrique, dalles sombres au centre, torches et arches sur les bords, rendu de jeu PC de la fin des années 1990. |
| `knight.webp`, `golem.webp` | Chevalier en cotte de mailles et golem de braises en vue trois quarts, sur fond transparent. |
| `knight-strike.webp`, `knight-spell.webp` | Trois poses du chevalier par attaque sur deux planches transparentes de 660 × 200 pixels. |
| `trail.webp` | Clairière en pixel art aux teintes olives et dorées, deux plateformes d’herbe pour le combat sur console portable. |
| `braisillon.webp`, `crinsauge.webp`, `flotillon.webp`, `schistoc.webp` | Quatre créatures originales en pixel art avec des contours francs et une palette limitée par créature. |
| `braisillon-attacks.webp` | Préparation, charge et lancement d’Étincelle sur une planche de sprites de 336 × 108 pixels. |
| `ruins.webp` | Terrasse médiévale au crépuscule, brume bleue, rendu 3D précalculé de la fin des années 1990. |
| `romaine.webp`, `crouton.webp` | Bretteur en cape et chevalier en bronze, dans le même style de jeu de rôle 3D. |
| `caesar.webp` | Jules César en toge et cape écarlate, couronné de laurier. |
| `romaine-attacks.webp`, `crouton-attacks.webp`, `caesar-attacks.webp` | Deux poses par personnage sur des planches transparentes de 608 × 308 pixels. |
| `sporastre.webp`, `volticole.webp`, `frilievre.webp` | Champignon violet, scarabée électrique et lièvre de glace dans le même style pixel art que les autres créatures. |

### Invites des vignettes de sélection

Les quatre vignettes ont été créées avec l’outil ImageGen intégré et exportées
en WebP de 480 × 270 pixels dans `src/app/features/arcade/covers`. Les styles
de l’arcade incluent ces images à la compilation.

| Jeu | Vignette | Références |
| --- | --- | --- |
| Paper Morsio | `cabinet-morsio.webp` | `morsio-castle.webp` |
| Pokemon Gold & Blind | `cabinet-trainers.webp` | `braisillon.webp` |
| Diablo 10 | `cabinet-diablo.webp` | `knight.webp`, `golem.webp` |
| Final Fantaceasar 9 | `cabinet-fantaceasar.webp` | `romaine.webp`, `crouton.webp` |

**Paper Morsio**

> undefined

**Pokemon Gold & Blind**

> undefined

**Diablo 10**

> undefined

**Final Fantaceasar 9**

> undefined

### Invite du château de Paper Morsio

Fond créé avec l’outil ImageGen intégré.

> Create an original ultra-wide 2.65:1 backdrop for a side-scrolling storybook platformer set inside a medieval castle above molten lava. The illustration must look like a real handmade paper theater, built from layered cut construction paper and corrugated cardboard, visible cardstock fibers, gouache-colored cut edges, faint seams and soft physical shadows between layers. Perfect side view as seen from the stage, eye-level, no isometric floor and no forced diagonal perspective. Design a long castle hall with dark plum, smoky blue and slate-gray cut-paper brickwork, tall repeating round and pointed masonry arches, recessed indigo bays and a few amber wall torches with pointed paper-cut flames. Use darker shaded outer pillars and enough warm low light to give the architecture depth. Keep brightness subdued behind the playable area so a small red-capped character and pale-authored ledges will read. Composition in vertical bands: decorative arch crowns and recessed windows in upper half; open, dark unbroken shadow behind the bottom quarter with just faint orange glow; leave bottom quarter completely clear of objects because the game draws the lava and platforms over it. Full bleed left-to-right, artwork extends beyond both horizontal edges. No floor, walkways, ledges, bridges, characters, objects to collect, letters, numbers, logos, borders, watermarks, or graphics from any existing game. Make it feel like a richly crafted pop-up book illuminated by firelight.

### Invites des nouveaux personnages

Images créées avec l’outil ImageGen intégré, sur fond transparent.

**Jules César**

> Create a single isolated full-body battle sprite of the historical Julius Caesar, unmistakably the iconic Roman Caesar, for an original late-1990s fantasy JRPG. Transparent background, no floor, shadow, UI, lettering, logos, other figures or scenery. He is a mature Roman man with neatly combed receding short silver-gray hair, clean shaven strong face, long aquiline nose and distinct large bright gold laurel wreath with clearly separated pointed leaves. He stands in a classic confident Roman orator pose in three-quarter view facing LEFT, feet planted, an elegant ivory toga with a deep scarlet cloak and a prominent circular gold clasp. Keep both his wreath and his face readable when the full sprite is shrunk to 128 pixels high, with a slightly enlarged head in a 1999 pre-rendered CGI fantasy-JRPG character style, fine painted fabric textures, strong warm rim light, cool shadows, expressive silhouette. Show the entire figure from wreath to sandals with small clear margins on all sides. No swords, crowns, helmets, or medieval armor.

**Créatures supplémentaires**

> Three original 8-bit color handheld RPG battle creatures, painted as a sprite sheet on a genuinely transparent background, wide horizontal layout. Exactly three isolated sprites, each entirely in its own 1/3 column, with breathing room and no lettering, guides, ground or shadows. Left: plump purple mushroom creature with a starry violet cap and stubby white feet. Middle: ochre and mustard electric beetle with tall antennae and a little spark motif on its shell, compact angled pose. Right: squat icy-blue horned hare with crystal-like ears, ready to pounce. All creatures face left in 3/4 side-view. Pure late-1990s portable game battle sprite graphics, 32 by 32 equivalent resolution upscaled with clean nearest-neighbor hard-edged pixels, limited color palettes including an almost black outline, simple high-contrast details, expressive, different silhouettes. No existing franchise characters.

### Invites des animations du chevalier

L’outil ImageGen intégré a utilisé `knight.webp` comme référence visuelle.

**Coup d’épée**

> Sprite sheet for the attached ORIGINAL dark isometric action RPG knight, with THREE isolated full-body poses in a single horizontal row on transparent background. Exactly one pose inside each separate equal-width third, large transparent gaps and no overlaps or clipping, even for the sword. Every pose faces screen-right in the same downward three-quarter isometric camera as the reference. Match the silver enclosed helmet, chain mail, weathered crimson cape, sword in right hand, round buckler on left, realistic textured pre-rendered 1990s PC game shading, color palette and proportions. Same body size in all poses, feet near same baseline, helmet height comparable, believable feet/planted poses and readable silhouette at 63px high. No floor, shadows, UI, text, grid, borders, glow or magic trails on the sheet. LEFT third: anticipatory pose, weight on rear leg, turns torso and raises the sword hand high and back over shoulder, buckler held ready. MIDDLE third: peak strike with wide forward step, torso twists toward target, sword arm is dramatically extended diagonally down-right in a powerful full swing, cape flares; clearly distinguish from the other cells. RIGHT third: follow-through after sword has traveled across the body, front leg bends, sword blade finishes low well to the right and buckler settles. This is a coherent sequence of three keyframes of a single horizontal sword slash.

**Sort**

> Sprite sheet for the attached ORIGINAL dark isometric action RPG knight, with THREE isolated full-body poses in a single horizontal row on transparent background. Exactly one pose inside each separate equal-width third, large transparent gaps and no overlaps or clipping, even for the sword. Every pose faces screen-right in the same downward three-quarter isometric camera as the reference. Match the silver enclosed helmet, chain mail, weathered crimson cape, sword in right hand, round buckler on left, realistic textured pre-rendered 1990s PC game shading, color palette and proportions. Same body size in all poses, feet near same baseline, helmet height comparable, believable feet/planted poses and readable silhouette at 63px high. No floor, shadows, UI, text, grid, borders, glow or magic trails on the sheet. LEFT third: gathers power, bends knees slightly, sword held low, raises his left buckler arm close to chest and chin lowered as if preparing a spell. MIDDLE third: releases a spell, straightens and extends left shield-bearing arm toward the right and slightly upwards with an open hand projecting in front of the buckler, sword in right hand is held low and backward, cloak sweeps left; clear casting silhouette. RIGHT third: withdraws extended arm, shoulders settle and cape falls as he returns to his fighting stance. Three clearly distinct phases of the same one-handed casting animation. Magic glow and projectile will be added separately by the game.

### Invite des animations de Braisillon

L’outil ImageGen intégré a utilisé `braisillon.webp` comme référence visuelle.

> Use the attached original bird Braisillon as the character reference. Create one transparent sprite sheet of exactly three isolated full-body sprites in a horizontal row, each in its own equal-width third with ample separation. Preserve the character's red body, warm golden highlights, diagonally upward-right-facing three-quarter rear view, blocky black outlines and 1990s handheld RPG pixel art. The equivalent sprite grid is about 32 by 32 pixels, hard-edged nearest-neighbor upscaled, same scale and crisp outline in each pose, no soft shading. Left pose: bird crouches, wings tucked low and feet planted, ready to dash. Middle pose: bird lunges diagonally up-right, body thrust forward, wings and flame-shaped tail swept behind it as it charges. Right pose: bird rears up and spreads both wings very high, opening its beak toward the upper-right as it releases a spark. No effects, lighting, text, scenery, rings, floor, guides or shadows. Transparent background around all three sprites.

### Invites des animations de Final Fantaceasar

Chaque planche a été créée avec l’outil ImageGen intégré en prenant le sprite
au repos du personnage comme référence.

**Romaine**

> Create a sprite sheet with exactly two separate poses of the attached ORIGINAL character, one wholly within the left half and one wholly within the right half, with a wide gap and generous clear margins. Use a transparent background. No background, floor, ground shadow, lettering, borders, panels, sparkles or motion trails. Full body head to feet, consistent scale and framing between the two poses, same palette, face, costume, props, proportions and late-1990s pre-rendered fantasy JRPG visual style as the reference. Both poses face screen-right at the same three-quarter angle as the reference; preserve his pointed copper hair, green-edged cape and rapier. LEFT: dynamic lunging thrust with rapier extended right, front knee bent, trailing foot and cape fluttering backward; the gesture reads at 80 pixels tall. RIGHT: heroic magic-casting pose with rapier lowered in his right hand, head slightly back and left palm open and extended right and a little up. Keep both the hair and blade entirely in frame.

**Croûton**

> Create a sprite sheet with exactly two separate poses of the attached ORIGINAL character, one wholly within the left half and one wholly within the right half, with a wide gap and generous clear margins. Use a transparent background. No background, floor, ground shadow, lettering, borders, panels, sparkles or motion trails. Full body head to feet, consistent scale and framing between the two poses, same palette, face, costume, props, proportions and late-1990s pre-rendered fantasy JRPG visual style as the reference. Both poses face screen-right at the same three-quarter angle as the reference; preserve his stocky stature, bronze helmet, bulbous nose, bushy blond moustache, scarlet scarf and spiked mace. LEFT: strong forward step with his weight on the front leg as he swings his mace to screen right and has the arm extended, scarf flying backward. RIGHT: he plants both feet, holds his mace low beside him and extends an open free gauntlet toward the right and slightly upward in a clearly recognizable spell-casting gesture.

**César**

> Create a sprite sheet with exactly two separate poses of the attached ORIGINAL character, one wholly within the left half and one wholly within the right half, with a wide gap and generous clear margins. Use a transparent background. No background, floor, ground shadow, lettering, borders, panels, sparkles or motion trails. Full body head to feet, consistent scale and framing between the two poses, same palette, face, costume, props, proportions and late-1990s pre-rendered fantasy JRPG visual style as the reference. Both poses face screen-left in three-quarter view, as in the reference; preserve Julius Caesar's gray hair, recognizable Roman aquiline face, gold laurel wreath, ivory toga, deep scarlet cloak and gold clasp. LEFT: performs a windup, chin lowered, bends knees subtly and pulls the raised orator's hand in beside his chest, bracing himself. RIGHT: stern commanding gesture, thrusts his open right palm toward screen left and up, arm fully extended, toga and cape sweep backward; visible silhouette of the hand launching a spell.
