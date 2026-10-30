import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Ce modèle contient uniquement les renseignements publics des énoncés.
// Aucune association culturelle ni solution privée n’est enregistrée ici.
const template = await readFile(
  new URL('../src/app/features/zebra/zebra-play.html', import.meta.url),
  'utf8',
);
const displayedClues = [...template.matchAll(/<li>([\s\S]*?)<\/li>/gu)].map((match) =>
  match[1].replace(/\s+/gu, ' ').trim(),
);

const occupationClues = new Map([
  ['Bob n’est ni animateur ni étudiant.', (jobs) => !['Animateur', 'Étudiant'].includes(jobs.Bob)],
  [
    'Ni Bob ni Jean-Lou ne sont inspecteurs.',
    (jobs) => jobs.Bob !== 'Inspecteur' && jobs['Jean-Lou'] !== 'Inspecteur',
  ],
  ['Jean-Lou n’est pas étudiant.', (jobs) => jobs['Jean-Lou'] !== 'Étudiant'],
  ['Éric n’est pas inspecteur.', (jobs) => jobs['Éric'] !== 'Inspecteur'],
]);
const foodClues = new Map([
  [
    'Des deux personnes occupant les positions 3 et 5, l’une mange un hot-dog et l’autre un beigne.',
    (at) =>
      (at[3] === 'Hot-dog' && at[5] === 'Beigne') || (at[3] === 'Beigne' && at[5] === 'Hot-dog'),
  ],
  ['La personne qui mange un beigne occupe la position 6.', (at) => at[6] === 'Beigne'],
  [
    'Des deux personnes occupant les positions 1 et 11, l’une mange un pogo et l’autre des Cheesy Poofs.',
    (at) =>
      (at[1] === 'Pogo' && at[11] === 'Cheesy Poofs') ||
      (at[1] === 'Cheesy Poofs' && at[11] === 'Pogo'),
  ],
  [
    'La personne qui mange un hot-dog occupe la position 4, mais pas la position 5.',
    (at) => at[4] === 'Hot-dog' && at[5] !== 'Hot-dog',
  ],
  ['La personne qui occupe la position 11 occupe aussi la position 18.', (at) => at[11] === at[18]],
  [
    'La personne qui mange des Cheesy Poofs occupe la position 2, mais pas la position 11.',
    (at) => at[2] === 'Cheesy Poofs' && at[11] !== 'Cheesy Poofs',
  ],
]);
assert.deepEqual(
  [...displayedClues].sort(),
  [...occupationClues.keys(), ...foodClues.keys()].sort(),
  'Mettre à jour le modèle logique si les énoncés affichés changent.',
);

function* permutations(values) {
  if (!values.length) {
    yield [];
    return;
  }
  for (const [index, value] of values.entries()) {
    for (const rest of permutations(values.filter((_, other) => other !== index)))
      yield [value, ...rest];
  }
}

function* pairs(values) {
  if (!values.length) {
    yield [];
    return;
  }
  for (const partner of values.slice(1)) {
    const pair = [values[0], partner];
    for (const rest of pairs(values.filter((value) => !pair.includes(value))))
      yield [pair, ...rest];
  }
}

const names = ['Bob', 'Jean-Lou', 'Homer', 'Éric'];
const occupations = ['Étudiant', 'Animateur', 'Pilote', 'Inspecteur'];
const foods = ['Hot-dog', 'Pogo', 'Cheesy Poofs', 'Beigne'];
const positions = [1, 2, 3, 4, 5, 6, 11, 18];
const possibleJobs = [...permutations(occupations)]
  .map((values) => Object.fromEntries(names.map((name, i) => [name, values[i]])))
  .filter((jobs) => [...occupationClues.values()].every((matches) => matches(jobs)));
assert.equal(possibleJobs.length, 1, 'Les occupations doivent être déterminées.');

const possibleFoodPositions = [];
for (const partition of pairs(positions)) {
  for (const assignedFoods of permutations(foods)) {
    const at = Object.fromEntries(
      partition.flatMap((pair, i) => pair.map((position) => [position, assignedFoods[i]])),
    );
    if ([...foodClues.values()].every((matches) => matches(at)))
      possibleFoodPositions.push(
        Object.fromEntries(
          foods.map((food) => [food, positions.filter((position) => at[position] === food)]),
        ),
      );
  }
}
assert.equal(
  possibleFoodPositions.length,
  1,
  'Les positions des nourritures doivent être déterminées.',
);

const assignments = [...permutations(foods)];
const solutions = possibleJobs.flatMap((jobs) =>
  possibleFoodPositions.flatMap((foodPositions) =>
    assignments.map((favorites) =>
      Object.fromEntries(
        names.map((name, i) => [
          name,
          { occupation: jobs[name], food: favorites[i], positions: foodPositions[favorites[i]] },
        ]),
      ),
    ),
  ),
);
assert.equal(
  solutions.length,
  24,
  'La reconnaissance doit être nécessaire pour résoudre la grille.',
);
assert.equal(
  new Set(
    solutions.map((solution) => JSON.stringify(names.map((name) => solution[name].positions))),
  ).size,
  24,
  'Les positions des prénoms doivent varier sans reconnaissance des nourritures.',
);
for (const name of names) {
  assert.equal(new Set(solutions.map((solution) => solution[name].food)).size, 4);
  assert.equal(
    new Set(solutions.map((solution) => JSON.stringify(solution[name].positions))).size,
    4,
  );
}
// Vérifier toutes les reconnaissances possibles évite de stocker la bonne dans le dépôt.
for (const favorites of assignments) {
  const matching = solutions.filter((solution) =>
    names.every((name, i) => solution[name].food === favorites[i]),
  );
  assert.equal(matching.length, 1, 'Une reconnaissance complète doit donner une seule grille.');
}
console.log('Énoncés affichés vérifiés : 24 grilles sans reconnaissance, 1 avec reconnaissance.');
console.log(
  'Chaque prénom conserve 4 nourritures et 4 paires de positions possibles sans reconnaissance.',
);
