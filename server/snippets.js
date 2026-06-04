export function normalizeTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags ?? '').split(',');
  return list.map((t) => String(t).trim().toLowerCase()).filter((t) => t.length > 0);
}

export function filterSnippets(snippets, criteria = {}) {
  const q        = String(criteria.q        ?? '').trim().toLowerCase();
  const language = String(criteria.language ?? '').trim().toLowerCase();
  const tag      = String(criteria.tag      ?? '').trim().toLowerCase();
  return snippets.filter((s) => {
    if (q) { const hay = `${s.title}\n${s.code}`.toLowerCase(); if (!hay.includes(q)) return false; }
    if (language) { if (String(s.language).toLowerCase() !== language) return false; }
    if (tag) {
      const tags = Array.isArray(s.tags) ? s.tags : normalizeTags(s.tags);
      if (!tags.includes(tag)) return false;
    }
    return true;
  });
}

function toApi(row) {
  return {
    id: row.id, title: row.title, language: row.language,
    code: row.code, tags: normalizeTags(row.tags),
    favourite: row.favourite ?? false,
    created_at: row.created_at, updated_at: row.updated_at
  };
}

export function createSnippetStore(pool) {
  return {
    async list(criteria = {}) {
      const { rows } = await pool.query(
        'SELECT * FROM snippets ORDER BY favourite DESC, created_at DESC, id DESC'
      );
      return filterSnippets(rows.map(toApi), criteria);
    },
    async get(id) {
      const { rows } = await pool.query('SELECT * FROM snippets WHERE id = $1', [id]);
      return rows[0] ? toApi(rows[0]) : null;
    },
    async create({ title, language, code, tags }) {
      const { rows } = await pool.query(
        `INSERT INTO snippets (title, language, code, tags) VALUES ($1, $2, $3, $4) RETURNING *`,
        [String(title).trim(), String(language).trim().toLowerCase(), String(code), normalizeTags(tags).join(',')]
      );
      return toApi(rows[0]);
    },
    async update(id, { title, language, code, tags }) {
      const { rows } = await pool.query(
        `UPDATE snippets SET title=$1, language=$2, code=$3, tags=$4, updated_at=now() WHERE id=$5 RETURNING *`,
        [String(title).trim(), String(language).trim().toLowerCase(), String(code), normalizeTags(tags).join(','), id]
      );
      return rows[0] ? toApi(rows[0]) : null;
    },
    async remove(id) {
      const { rowCount } = await pool.query('DELETE FROM snippets WHERE id = $1', [id]);
      return rowCount > 0;
    },
    async toggleFavourite(id) {
      const { rows } = await pool.query(
        `UPDATE snippets SET favourite = NOT favourite, updated_at=now() WHERE id=$1 RETURNING *`, [id]
      );
      return rows[0] ? toApi(rows[0]) : null;
    },
    async duplicate(id) {
      const { rows } = await pool.query(
        `INSERT INTO snippets (title, language, code, tags)
         SELECT title || ' (copy)', language, code, tags FROM snippets WHERE id=$1 RETURNING *`, [id]
      );
      return rows[0] ? toApi(rows[0]) : null;
    },
    async meta() {
      const { rows } = await pool.query('SELECT language, tags FROM snippets');
      const languages = new Set(); const tags = new Set();
      for (const row of rows) {
        if (row.language) languages.add(row.language);
        for (const t of normalizeTags(row.tags)) tags.add(t);
      }
      return { languages: [...languages].sort(), tags: [...tags].sort() };
    }
  };
}
