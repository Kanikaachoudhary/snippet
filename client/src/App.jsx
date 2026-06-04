/**
 * App.jsx — updated with dark/light mode toggle + language counts in header
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import Toolbar from './components/Toolbar.jsx';
import SnippetCard from './components/SnippetCard.jsx';
import SnippetForm from './components/SnippetForm.jsx';
import EmptyState from './components/EmptyState.jsx';

export default function App() {
  const [snippets, setSnippets]   = useState([]);
  const [meta, setMeta]           = useState({ languages: [], tags: [] });
  const [q, setQ]                 = useState('');
  const [language, setLanguage]   = useState('');
  const [tag, setTag]             = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [editing, setEditing]     = useState(null);
  const [dark, setDark]           = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark);
  }, [dark]);

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

  const langCounts = snippets.reduce((acc, s) => {
    acc[s.language] = (acc[s.language] || 0) + 1;
    return acc;
  }, {});

  const filtered = Boolean(q || language || tag);

  return (
    <div className="min-h-screen bg-ink text-text transition-colors duration-200">
      <div className="mx-auto max-w-[1000px] px-5 pb-16 pt-7">
        <header className="sticky top-0 z-10 -mx-5 mb-6 border-b border-edge bg-ink px-5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[26px] font-bold text-text">
                Snipp <span className="text-mint">&lt;/&gt;</span>
              </h1>
              <p className="text-[12px] text-soft">
                Save, tag, search and copy your reusable code.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {Object.entries(langCounts).slice(0, 4).map(([lang, count]) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(language === lang ? '' : lang)}
                  className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3 py-1
                    text-[11px] font-semibold transition-colors duration-150
                    ${language === lang
                      ? 'border-mint bg-mint/10 text-mint'
                      : 'border-edge text-soft hover:border-mint hover:text-mint'}`}
                >
                  <span>{lang}</span>
                  <span className="rounded-full bg-edge px-1.5 py-0.5 text-[10px]">{count}</span>
                </button>
              ))}
              <button
                onClick={() => setDark(!dark)}
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="flex h-8 w-8 items-center justify-center rounded-lg
                           border border-edge text-soft transition-colors
                           duration-150 hover:border-mint hover:text-mint"
              >
                {dark ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
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
          <p className="mt-4 rounded-lg border border-softRed px-3 py-2 text-[12.5px] text-softRed">
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
    </div>
  );
}
