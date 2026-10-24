import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Déplace les répliques sans recréer les textes ou réactiver les citations retirées. */
export function separateAiQuotes(catalog) {
  assert.equal(catalog?.initialized, true, 'Le catalogue doit déjà être initialisé.');
  if (catalog.version === 2) return catalog;
  const items = { ...catalog.items };
  const ai = { ...catalog.ai };
  for (const [id, quote] of Object.entries(items)) {
    if (quote.kind !== 'ai') continue;
    if (Object.hasOwn(ai, id)) {
      assert.deepEqual(ai[id], quote, `Deux répliques différentes portent l’identifiant ${id}.`);
    }
    ai[id] = quote;
    delete items[id];
  }
  return { ...catalog, version: 2, items, ai };
}

async function migrate() {
  const url = 'https://jourdelampe-default-rtdb.firebaseio.com/quotes.json';
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, { headers: { 'X-Firebase-ETag': 'true' } });
    assert.equal(response.status, 200, 'Lecture du catalogue impossible.');
    const current = await response.json();
    const next = separateAiQuotes(current);
    if (next === current) {
      console.log('Les catalogues sont déjà séparés.');
      return;
    }
    const tag = response.headers.get('etag');
    assert.ok(tag, 'Firebase doit fournir un ETag pour préserver les modifications simultanées.');
    const backupDirectory = path.resolve('.firebase');
    await mkdir(backupDirectory, { recursive: true });
    const stamp = new Date().toISOString().replaceAll(':', '-');
    await writeFile(
      path.join(backupDirectory, `citations-before-ai-${stamp}.json`),
      JSON.stringify(current, null, 2),
    );
    const result = await fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'if-match': tag },
      body: JSON.stringify(next),
    });
    if (result.status === 412) continue;
    assert.equal(result.status, 200, `Migration refusée : ${await result.text()}`);
    console.log(
      `Catalogues séparés : ${Object.keys(next.items).length} citations des invités, ${Object.keys(next.ai).length} répliques de l’AI.`,
    );
    return;
  }
  throw new Error('Le catalogue a changé trop souvent. Relancer la migration.');
}

if (process.argv.includes('--apply')) await migrate();
