/**
 * snippets.js
 * -----------
 * Two things live here:
 *
 *  1. PURE helpers — `normalizeTags` and `filterSnippets`. These have NO
 *     access to the database or the network. They take plain data in and
 *     return plain data out. Unit-testable in isolation.
 *
 *  2. A data-access layer (`createSnippetStore`) that talks to Postgres via
 *     the pooled connection and reuses the SAME pure `filterSnippets` for
 *     the list endpoint.
 *
 * WHY is search/filter a pure function?
 *   - Testable: it can be unit-tested with plain arrays — no database, server,
 *     or mocking required.
 *   - Single source of truth: the list endpoint and the tests exercise the
 *     exact same matching rule, so tests verify real behaviour.
 *   - Separation of concerns: "what counts as a match" is decided in one
 *     place, independent of how/where snippets are stored.
 */

/**
 * Normalize tags into a clean array of lowercase, trimmed, non-empty strings.
 * Accepts either an array of strings or a single comma-separated string.
 * PURE: does not mutate its input.
 */
export function normalizeTags(tags) {
  const list = Array.isArray(tags) ? tags : String(tags ?? '').split(',');
  return list
    .map((t) => String(t).trim().toLowerCase())
    .filter((t) => t.length > 0);
}

/**
 * Pure search/filter rule. Returns a NEW array — input is never mutated.
 *
 *   q: case-insensitive substring match against title OR code; blank = all
 *   language: exact match, case-insensitive; blank = all
 *   tag: exact tag membership; blank = all
 *   criteria combine with logical AND
 */
export function filterSnippets(snippets, criteria = {}) {
  const q = String(criteria.q ?? '').trim().toLowerCase();
  const language = String(criteria.language ?? '').trim().toLowerCase();
  const tag = String(criteria.tag ?? '').trim().toLowerCase();

  return snippets.filter((s) => {
    if (q) {
      const hay = `${s.title}\n${s.code}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (language) {
      if (String(s.language).toLowerCase() !== language) return false;
    }
    if (tag) {
      const tags = Array.isArray(s.tags) ? s.tags : normalizeTags(s.tags);
      if (!tags.includes(tag)) return false;
    }
    return true;
  });
}

/** Shape a raw DB row for the API (tags become a string array). */
function toApi(row) {
  return {
    id: row.id,
    title: row.title,
    language: row.language,
    code: row.code,
    tags: normalizeTags(row.tags),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Build the async data-access layer for a given pg pool.
 * The pool is injected so tests / scripts can pass their own connection.
 */
export function createSnippetStore(pool) {
  return {
    async list(criteria = {}) {
      const { rows } = await pool.query(
        'SELECT * FROM snippets ORDER BY created_at DESC, id DESC'
      );
      // Reuse the SAME pure function the tests target.
      return filterSnippets(rows.map(toApi), criteria);
    },

    async get(id) {
      const { rows } = await pool.query(
        'SELECT * FROM snippets WHERE id = $1',
        [id]
      );
      return rows[0] ? toApi(rows[0]) : null;
    },

    async create({ title, language, code, tags }) {
      const { rows } = await pool.query(
        `INSERT INTO snippets (title, language, code, tags)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          String(title).trim(),
          String(language).trim().toLowerCase(),
          String(code),
          normalizeTags(tags).join(',')
        ]
      );
      return toApi(rows[0]);
    },

    async update(id, { title, language, code, tags }) {
      const { rows } = await pool.query(
        `UPDATE snippets
            SET title = $1, language = $2, code = $3, tags = $4,
                updated_at = now()
          WHERE id = $5
          RETURNING *`,
        [
          String(title).trim(),
          String(language).trim().toLowerCase(),
          String(code),
          normalizeTags(tags).join(','),
          id
        ]
      );
      return rows[0] ? toApi(rows[0]) : null;
    },

    async remove(id) {
      const { rowCount } = await pool.query(
        'DELETE FROM snippets WHERE id = $1',
        [id]
      );
      return rowCount > 0;
    },

    /** Distinct, sorted languages + tags for the filter dropdowns. */
    async meta() {
      const { rows } = await pool.query('SELECT language, tags FROM snippets');
      const languages = new Set();
      const tags = new Set();
      for (const row of rows) {
        if (row.language) languages.add(row.language);
        for (const t of normalizeTags(row.tags)) tags.add(t);
      }
      return {
        languages: [...languages].sort(),
        tags: [...tags].sort()
      };
    }
  };
}
