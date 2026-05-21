/**
 * SnippetForm.jsx — modal used for BOTH creating and editing (when `initial`
 * is provided). Validates required fields, closes on backdrop click or Esc.
 */
import { useEffect, useState } from 'react';
import { LANGUAGES } from '../languages.js';

export default function SnippetForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title,
          language: initial.language,
          code: initial.code,
          tags: (initial.tags || []).join(', ')
        }
      : { title: '', language: '', code: '', tags: '' }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit() {
    if (!form.title.trim() || !form.language.trim() || !form.code.trim()) {
      setError('Title, language and code are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        title: form.title,
        language: form.language,
        code: form.code,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  const field =
    'mt-1 w-full rounded-lg border border-edge bg-win px-3 py-2 text-[13px] ' +
    'text-text transition-colors duration-[120ms] focus:border-mint ' +
    'focus:outline-none';

  return (
    <div
      className="fixed inset-0 z-20 flex items-start justify-center
                 overflow-y-auto p-6"
      style={{ background: 'rgba(0,0,0,.55)' }}
      onClick={onCancel}
    >
      <div
        className="mt-[30px] w-full max-w-[560px] rounded-xl border border-edge
                   bg-panel p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-4 text-[17px] font-bold text-text">
          {initial ? 'Edit snippet' : 'New snippet'}
        </h2>

        <label className="block">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-soft">
            Title
          </span>
          <input value={form.title} onChange={set('title')} className={field} />
        </label>

        <label className="mt-3 block">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-soft">
            Language
          </span>
          <select value={form.language} onChange={set('language')} className={field}>
            <option value="">Choose a language…</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>

        <label className="mt-3 block">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-soft">
            Code
          </span>
          <textarea
            value={form.code}
            onChange={set('code')}
            rows={9}
            spellCheck={false}
            className={`${field} resize-y font-mono`}
          />
        </label>

        <label className="mt-3 block">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-soft">
            Tags (comma-separated)
          </span>
          <input
            value={form.tags}
            onChange={set('tags')}
            placeholder="fetch, async, http"
            className={field}
          />
        </label>

        {error && <p className="mt-3 text-[12.5px] text-softRed">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-9 rounded-lg border border-edge px-4 text-[13px]
                       text-soft transition-colors duration-[120ms]
                       hover:text-text"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="h-9 rounded-lg bg-mint px-4 text-[13px] font-semibold
                       text-mintInk transition-transform duration-[120ms]
                       active:scale-[.98] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save snippet'}
          </button>
        </div>
      </div>
    </div>
  );
}
