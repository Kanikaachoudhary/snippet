/**
 * App.jsx
 * -------
 * Top-level component. Owns list + search/filter state and coordinates the
 * create/edit modal.
 *
 * Data flow: any change to the search box or the language/tag filters is
 * debounced (250ms) and then triggers a real API request to the back-end.
 * The browser never filters locally and never touches the database — the
 * server owns all search/filter logic (a pure, tested function). This keeps
 * a single source of truth and a clean front-end/back-end separation.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import Toolbar from './components/Toolbar.jsx';
import SnippetCard from './components/SnippetCard.jsx';
import SnippetForm from './components/SnippetForm.jsx';
import EmptyState from './components/EmptyState.jsx';

export default function App() {
  const [snippets, setSnippets] = useState([]);
  const [meta, setMeta] = useState({ languages: [], tags: [] });
  const [q, setQ] = useState('');
  const [language, setLanguage] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // snippet | 'new' | null

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, m] = await Promise.all([
        api.list({ q, language, tag }),
        api.meta()
      ]);
      setSnippets(list);
      setMeta(m);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [q, language, tag]);

  // Debounce so typing doesn't fire a request per keystroke.
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(refresh, 250);
    return () => clearTimeout(timer.current);
  }, [refresh]);

  async function handleSave(data) {
    if (editing && editing !== 'new') await api.update(editing.id, data);
    else await api.create(data);
    setEditing(null);
    refresh();
  }

  async function handleDelete(snippet) {
    if (!window.confirm(`Delete "${snippet.title}"?`)) return;
    try {
      await api.remove(snippet.id);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  const filtered = Boolean(q || language || tag);

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-16 pt-7">
      {/* sticky slim header */}
      <header className="sticky top-0 z-10 -mx-5 mb-5 border-b border-edge
                         bg-ink px-5 pb-4">
        <h1 className="text-[26px] font-bold text-text">
          Snipp <span className="text-mint">&lt;/&gt;</span>
        </h1>
        <p className="text-[13px] text-soft">
          Save, tag, search and copy your reusable code in seconds.
        </p>
      </header>

      <Toolbar
        q={q} onQ={setQ}
        language={language} onLanguage={setLanguage}
        tag={tag} onTag={setTag}
        meta={meta}
        count={snippets.length}
        onNew={() => setEditing('new')}
      />

      {error && (
        <p className="mt-4 rounded-lg border border-softRed px-3 py-2
                      text-[12.5px] text-softRed">
          {error}
        </p>
      )}

      <div className="mt-5">
        {loading ? (
          <p className="text-[13px] text-soft">Loading…</p>
        ) : snippets.length === 0 ? (
          <EmptyState filtered={filtered} onNew={() => setEditing('new')} />
        ) : (
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
            {snippets.map((s) => (
              <SnippetCard
                key={s.id}
                snippet={s}
                onEdit={(snip) => setEditing(snip)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <SnippetForm
          initial={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
