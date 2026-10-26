import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { separateAiQuotes } from './separate-ai-quotes.mjs';

const origin = `http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST ?? '127.0.0.1:9000'}`;
const namespace = 'demo-jourdelampe';
assert.equal(
  new URL(origin).hostname,
  '127.0.0.1',
  'Ces tests utilisent uniquement l’émulateur local.',
);
const rules = await readFile(new URL('../database.rules.json', import.meta.url), 'utf8');
const rulesResponse = await fetch(`${origin}/.settings/rules.json?ns=${namespace}`, {
  method: 'PUT',
  headers: { 'content-type': 'application/json', authorization: 'Bearer owner' },
  body: rules,
});
assert.equal(rulesResponse.status, 200, await rulesResponse.text());
let checked = 0;
async function request(path, method, body, expected, uid) {
  const authOverride = uid
    ? `&auth_variable_override=${encodeURIComponent(JSON.stringify(typeof uid === 'string' ? { uid } : uid))}`
    : '';
  const response = await fetch(`${origin}/${path}.json?ns=${namespace}${authOverride}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(uid ? { authorization: 'Bearer owner' } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  assert.equal(response.status, expected, `${method} ${path}: ${await response.clone().text()}`);
  checked++;
  return response.json();
}

const quote = {
  text: 'Une citation pour vérifier les règles.',
  kind: 'regular',
  active: true,
  createdAt: 1,
  updatedAt: 1,
};
const legacyAi = {
  ...quote,
  kind: 'ai',
  text: 'Réplique déjà modifiée.',
  active: false,
  updatedAt: 9,
};
const legacy = { initialized: true, items: { first: quote, 'ai-edited': legacyAi } };
const separated = separateAiQuotes(legacy);
assert.deepEqual(separated.ai['ai-edited'], legacyAi);
assert.equal(separated.items['ai-edited'], undefined);
assert.equal(legacy.items['ai-edited'], legacyAi);
assert.equal(separateAiQuotes(separated), separated);
await request('quotes', 'PUT', separated, 200);
await request('quotes/items/second', 'PUT', { ...quote, text: 'Une nouvelle citation.' }, 200);
await request('quotes/items/first', 'PATCH', { text: 'Citation modifiée.', updatedAt: 2 }, 200);
await request('quotes/items/first', 'PATCH', { active: false, updatedAt: 3 }, 200);
await request('quotes/items/first', 'PATCH', { active: true, updatedAt: 4 }, 200);
await request(
  'quotes/ai/ai',
  'PUT',
  { ...quote, kind: 'ai', text: 'J’attends encore un merci.' },
  200,
);
await request('quotes/items/ai-misplaced', 'PUT', { ...quote, kind: 'ai' }, 401);
await request('quotes/ai/human-misplaced', 'PUT', quote, 401);
await request(
  'quotes/ai/ai',
  'PATCH',
  { text: 'Une réplique modifiée.', active: false, updatedAt: 8 },
  200,
);
await request('quotes/items/bad', 'PUT', { ...quote, text: 'a'.repeat(141) }, 401);
await request('quotes/items/bad', 'PUT', { ...quote, text: '   ' }, 401);
await request('quotes/items/bad', 'PUT', { ...quote, href: 'javascript:alert(1)' }, 401);
await request('quotes/items/bad', 'PUT', { ...quote, kind: 'other' }, 401);
await request('quotes/items/bad', 'PUT', { ...quote, unexpected: true }, 401);
await request('quotes/items/bad', 'PUT', { text: 'Champ manquant.' }, 401);
await request('quotes/initialized', 'PUT', false, 401);
await request('quotes/other', 'PUT', 'Champ inattendu.', 401);
await request('riddles', 'GET', undefined, 401);
await request('riddles', 'PUT', { secret: 'Une donnée privée.' }, 401);
const catalog = await request('quotes', 'GET', undefined, 200);
assert.equal(catalog.items.first.text, 'Citation modifiée.');
assert.equal(catalog.items.first.active, true);
assert.equal(catalog.initialized, true);
assert.equal(catalog.version, 2);
assert.equal(catalog.ai['ai-edited'].active, false);
assert.equal(catalog.ai['ai-edited'].updatedAt, 9);
assert.equal(catalog.ai.ai.text, 'Une réplique modifiée.');
const meal = { name: 'Sam', dish: 'Lasagne', active: true, createdAt: 1, updatedAt: 1 };
await request('potluck', 'GET', undefined, 200);
await request('potluck/meal', 'PUT', meal, 200);
await request(
  'potluck/meal',
  'PATCH',
  { name: 'Sam et Alex', dish: 'Lasagne végétarienne', updatedAt: 2 },
  200,
);
await request('potluck/meal', 'PATCH', { active: false, updatedAt: 3 }, 200);
await request('potluck/meal', 'PATCH', { active: true, updatedAt: 4 }, 200);
await request('potluck/bad', 'PUT', { ...meal, name: ' ' }, 401);
await request('potluck/bad', 'PUT', { ...meal, dish: '' }, 401);
await request('potluck/bad', 'PUT', { ...meal, name: 'a'.repeat(61) }, 401);
await request('potluck/bad', 'PUT', { ...meal, dish: 'a'.repeat(161) }, 401);
await request('potluck/bad', 'PUT', { ...meal, name: 8 }, 401);
await request('potluck/bad', 'PUT', { ...meal, active: 'true' }, 401);
await request('potluck/bad', 'PUT', { name: 'Sam' }, 401);
await request('potluck/bad', 'PUT', { ...meal, other: true }, 401);
await request('potluck', 'PUT', 'Donnée invalide', 401);
const potluck = await request('potluck', 'GET', undefined, 200);
assert.equal(potluck.meal.name, 'Sam et Alex');
assert.equal(potluck.meal.dish, 'Lasagne végétarienne');
assert.equal(potluck.meal.active, true);
const participant = { name: 'Chloé et Alex', updatedAt: 1 };
await request('participants', 'GET', undefined, 200);
await request('participants/player', 'PUT', participant, 401);
await request('participants/player', 'PUT', participant, 401, 'someone-else');
await request('participants/player', 'PUT', participant, 200, 'player');
await request(
  'participants/player',
  'PATCH',
  { name: 'Chloé Martin', updatedAt: 2 },
  200,
  'player',
);
await request('participants/player', 'PATCH', { name: 'Usurpation' }, 401, 'someone-else');
for (const name of ['', ' ', '\t\n', '  Chloé', 'Chloé  Alex', 'a'.repeat(61), 123]) {
  await request('participants/player', 'PATCH', { name }, 401, 'player');
}
await request('participants/player', 'PATCH', { updatedAt: 'bad' }, 401, 'player');
await request('participants/player', 'PATCH', { other: true }, 401, 'player');
await request('participants/player', 'DELETE', undefined, 401, 'player');
await request('participants/unnamed', 'PUT', { updatedAt: 1 }, 401, 'unnamed');
const renamed = await request('participants/player', 'GET', undefined, 200);
assert.equal(renamed.name, 'Chloé Martin');
// Les résolutions resteront écrites par la future validation serveur uniquement.
const resolution = { participantId: 'player', riddleId: 'first', solvedAt: 1 };
await request('riddleProgress', 'GET', undefined, 200);
await request('riddleProgress/player/first', 'PUT', resolution, 401);
await request('riddleProgress/player/first', 'PUT', resolution, 401, 'unnamed');
await request('riddleProgress/player/first', 'PUT', resolution, 401, 'player');
const admin = { uid: 'game-admin', token: { gameAdmin: true } };
const serverTime = { '.sv': 'timestamp' };
await request(
  '',
  'PATCH',
  {
    'game/round': { id: 'round-one', resetAt: serverTime },
    'game/catalog/first': { title: 'Première énigme', prompt: 'Un énoncé.', order: 0 },
    'game/catalog/second': { title: 'Deuxième énigme', prompt: '', order: 1 },
    'riddleSecrets/first': { answer: 'Lampe', normalizedAnswer: 'LAMPE' },
    'riddleSecrets/second': { answer: 'Party', normalizedAnswer: 'PARTY' },
  },
  200,
  admin,
);
await request('game', 'GET', undefined, 401);
await request('game/catalog', 'GET', undefined, 200);
await request('game/round', 'GET', undefined, 200);
await request('riddleSecrets', 'GET', undefined, 401);
await request('riddleSecrets/first/answer', 'GET', undefined, 401, 'player');
await request('game/proofs', 'GET', undefined, 401, 'player');
await request('riddleSecrets', 'GET', undefined, 200, admin);
await request('game/catalog/forged', 'PUT', { title: 'Faux', prompt: '', order: 9 }, 401, 'player');
function submission(
  uid,
  answer = 'LAMPE',
  roundId = 'round-one',
  name = 'Chloé Martin',
  solvedAt = serverTime,
) {
  return {
    [`solves/first/${uid}`]: {
      participantId: uid,
      participantName: name,
      riddleId: 'first',
      riddleTitle: 'Première énigme',
      roundId,
      solvedAt,
    },
    [`proofs/${uid}/first`]: { answer, roundId },
  };
}
await request('game', 'PATCH', submission('player'), 401);
await request('game', 'PATCH', submission('unnamed'), 401, 'unnamed');
await request('game', 'PATCH', submission('player', 'FAUX'), 401, 'player');
assert.equal(await request('game/solves', 'GET', undefined, 200), null);
await request(
  'game',
  'PATCH',
  submission('player', 'LAMPE', 'round-one', 'Nom usurpé'),
  401,
  'player',
);
await request(
  'game',
  'PATCH',
  submission('player', 'LAMPE', 'round-one', 'Chloé Martin', 1),
  401,
  'player',
);
await request(
  'game/proofs/player/first',
  'PUT',
  { answer: 'LAMPE', roundId: 'round-one' },
  401,
  'player',
);
await request(
  'game/solves/first/player',
  'PUT',
  submission('player')['solves/first/player'],
  401,
  'player',
);
await request('game', 'PATCH', submission('player'), 200, 'player');
await request('game', 'PATCH', submission('player'), 401, 'player');
await request('game/solves/first/player', 'DELETE', undefined, 401, 'player');
await request(
  'participants/other-player',
  'PUT',
  { name: 'Ariane Roy', updatedAt: 1 },
  200,
  'other-player',
);
await request(
  'game',
  'PATCH',
  submission('other-player', 'LAMPE', 'round-one', 'Ariane Roy'),
  200,
  'other-player',
);
const sharedSolves = await request('game/solves/first', 'GET', undefined, 200);
assert.equal(Object.keys(sharedSolves).length, 2);
assert.equal(sharedSolves.player.participantName, 'Chloé Martin');
assert.ok(sharedSolves.player.solvedAt > Date.now() - 60_000);
assert.equal(sharedSolves.player.answer, undefined);
await request('game/proofs/player/first/answer', 'GET', undefined, 401, 'player');
const reset = { round: { id: 'round-two', resetAt: serverTime }, solves: null, proofs: null };
await request('game', 'PATCH', reset, 401, 'player');
await request('game', 'PATCH', reset, 200, admin);
assert.equal(await request('game/solves', 'GET', undefined, 200), null);
assert.equal(await request('game/proofs', 'GET', undefined, 200, admin), null);
await request('game', 'PATCH', submission('player'), 401, 'player');
await request('game', 'PATCH', submission('player', 'LAMPE', 'round-two'), 200, 'player');
assert.equal((await request('participants/player', 'GET', undefined, 200)).name, 'Chloé Martin');
assert.equal((await request('riddleSecrets/first', 'GET', undefined, 200, admin)).answer, 'Lampe');
console.log(`${checked} vérifications des règles Firebase réussies.`);
