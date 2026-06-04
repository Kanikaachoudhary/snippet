import 'dotenv/config';
import express from 'express';
import cors    from 'cors';
import { pool, ensureSchema } from './db.js';
import { createSnippetStore }  from './snippets.js';

const PORT = process.env.PORT || 3001;
const app  = express();
app.use(cors());
app.use(express.json());
const store = createSnippetStore(pool);

async function ensureFavouriteColumn() {
  await pool.query(`ALTER TABLE snippets ADD COLUMN IF NOT EXISTS favourite BOOLEAN NOT NULL DEFAULT false`);
}

function validate(body) {
  if (!body || typeof body !== 'object') return 'Request body is required.';
  if (!String(body.title    ?? '').trim()) return 'Title is required.';
  if (!String(body.language ?? '').trim()) return 'Language is required.';
  if (!String(body.code     ?? '').trim()) return 'Code is required.';
  return null;
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/snippets', async (req, res, next) => {
  try { const { q, language, tag } = req.query; res.json(await store.list({ q, language, tag })); }
  catch (e) { next(e); }
});

app.get('/api/meta', async (_req, res, next) => {
  try { res.json(await store.meta()); } catch (e) { next(e); }
});

app.get('/api/snippets/:id', async (req, res, next) => {
  try {
    const snippet = await store.get(Number(req.params.id));
    if (!snippet) return res.status(404).json({ error: 'Snippet not found.' });
    res.json(snippet);
  } catch (e) { next(e); }
});

app.post('/api/snippets', async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });
    res.status(201).json(await store.create(req.body));
  } catch (e) { next(e); }
});

app.put('/api/snippets/:id', async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });
    const updated = await store.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: 'Snippet not found.' });
    res.json(updated);
  } catch (e) { next(e); }
});

app.delete('/api/snippets/:id', async (req, res, next) => {
  try {
    const ok = await store.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: 'Snippet not found.' });
    res.status(204).end();
  } catch (e) { next(e); }
});

app.post('/api/snippets/:id/favourite', async (req, res, next) => {
  try {
    const updated = await store.toggleFavourite(Number(req.params.id));
    if (!updated) return res.status(404).json({ error: 'Snippet not found.' });
    res.json(updated);
  } catch (e) { next(e); }
});

app.post('/api/snippets/:id/duplicate', async (req, res, next) => {
  try {
    const copy = await store.duplicate(Number(req.params.id));
    if (!copy) return res.status(404).json({ error: 'Snippet not found.' });
    res.status(201).json(copy);
  } catch (e) { next(e); }
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Server error.' }); });

ensureSchema()
  .then(() => ensureFavouriteColumn())
  .then(() => app.listen(PORT, () => console.log(`Snipp API running on http://localhost:${PORT}`)))
  .catch((err) => { console.error('Failed to start:', err); process.exit(1); });
