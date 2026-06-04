import 'dotenv/config';
import { pool, ensureSchema } from './db.js';
import { createSnippetStore } from './snippets.js';

async function main() {
  await ensureSchema();
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM snippets');
  if (rows[0].count > 0) {
    console.log(`Already has ${rows[0].count} snippets; skipping.`);
    return;
  }
  const store = createSnippetStore(pool);
  const demo = [
    { title:'Fetch JSON with async/await', language:'javascript', tags:['fetch','async','http'],
      code:`async function getJSON(url) {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(res.status);\n  return res.json();\n}` },
    { title:'Debounce a function', language:'javascript', tags:['utility','timing'],
      code:`function debounce(fn, ms = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}` },
    { title:'Array unique values', language:'javascript', tags:['array','utils'],
      code:`const unique = (arr) => [...new Set(arr)];` },
    { title:'Read file line by line', language:'python', tags:['io','files'],
      code:`with open('data.txt') as f:\n    for line in f:\n        print(line.rstrip())` },
    { title:'List comprehension filter', language:'python', tags:['list','filter'],
      code:`evens = [x for x in range(100) if x % 2 == 0]` },
    { title:'Center with flexbox', language:'css', tags:['layout','flexbox'],
      code:`.container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n}` },
    { title:'Responsive grid', language:'css', tags:['grid','responsive'],
      code:`.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}` },
    { title:'Inner join two tables', language:'sql', tags:['query','join'],
      code:`SELECT u.id, u.name, o.total\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.total > 100;` },
    { title:'Count rows by group', language:'sql', tags:['aggregate','group-by'],
      code:`SELECT language, COUNT(*) AS total\nFROM snippets\nGROUP BY language\nORDER BY total DESC;` },
  ];
  for (const s of demo) await store.create(s);
  console.log(`✓ Seeded ${demo.length} snippets.`);
}

main().then(() => pool.end()).catch((err) => { console.error(err); pool.end(); process.exit(1); });
