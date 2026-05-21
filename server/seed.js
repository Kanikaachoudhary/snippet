/**
 * seed.js
 * -------
 * Inserts a handful of demo snippets, but ONLY if the table is empty — so
 * running it repeatedly is safe and never creates duplicates.
 *
 * Usage:  node server/seed.js
 */

import 'dotenv/config';
import { pool, ensureSchema } from './db.js';
import { createSnippetStore } from './snippets.js';

async function main() {
  await ensureSchema();

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM snippets');
  if (rows[0].count > 0) {
    console.log(`Database already has ${rows[0].count} snippet(s); nothing seeded.`);
    return;
  }

  const store = createSnippetStore(pool);

  const demo = [
    {
      title: 'Fetch JSON with async/await',
      language: 'javascript',
      tags: ['fetch', 'async', 'http'],
      code:
        "async function getJSON(url) {\n" +
        "  const res = await fetch(url);\n" +
        "  if (!res.ok) throw new Error(res.status);\n" +
        "  return res.json();\n" +
        "}"
    },
    {
      title: 'Debounce a function',
      language: 'javascript',
      tags: ['utility', 'timing'],
      code:
        "function debounce(fn, ms = 300) {\n" +
        "  let t;\n" +
        "  return (...args) => {\n" +
        "    clearTimeout(t);\n" +
        "    t = setTimeout(() => fn(...args), ms);\n" +
        "  };\n" +
        "}"
    },
    {
      title: 'Read a file line by line',
      language: 'python',
      tags: ['io', 'files'],
      code:
        "with open('data.txt') as f:\n" +
        "    for line in f:\n" +
        "        print(line.rstrip())"
    },
    {
      title: 'Inner join two tables',
      language: 'sql',
      tags: ['query', 'join'],
      code:
        "SELECT a.id, b.name\n" +
        "FROM users a\n" +
        "JOIN orders b ON b.uid = a.id;"
    },
    {
      title: 'Center a div with flexbox',
      language: 'css',
      tags: ['layout', 'flexbox'],
      code:
        ".box {\n" +
        "  display: flex;\n" +
        "  align-items: center;\n" +
        "  justify-content: center;\n" +
        "}"
    }
  ];

  for (const s of demo) await store.create(s);
  console.log(`Seeded ${demo.length} demo snippets.`);
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
