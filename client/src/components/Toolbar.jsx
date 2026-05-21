/**
 * Toolbar.jsx — search input, language + tag filters, "+ New" button,
 * and a live snippet count. Presentational only; reports changes upward.
 */
export default function Toolbar({
  q, onQ, language, onLanguage, tag, onTag, meta, count, onNew
}) {
  const field =
    'h-9 rounded-lg border border-edge bg-panel px-3 text-[13px] ' +
    'text-text placeholder:text-soft transition-colors duration-[120ms] ' +
    'focus:border-mint focus:outline-none';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Search title or code…"
          aria-label="Search snippets"
          className={`${field} flex-1 min-w-[12rem]`}
        />
        <select
          value={language}
          onChange={(e) => onLanguage(e.target.value)}
          aria-label="Filter by language"
          className={field}
        >
          <option value="">All languages</option>
          {meta.languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value={tag}
          onChange={(e) => onTag(e.target.value)}
          aria-label="Filter by tag"
          className={field}
        >
          <option value="">All tags</option>
          {meta.tags.map((t) => (
            <option key={t} value={t}>#{t}</option>
          ))}
        </select>
        <button
          onClick={onNew}
          className="h-9 rounded-lg bg-mint px-4 text-[13px] font-semibold
                     text-mintInk transition-transform duration-[120ms]
                     active:scale-[.98]"
        >
          + New snippet
        </button>
      </div>
      <p className="mt-2 text-xs text-soft">
        {count} snippet{count === 1 ? '' : 's'}
      </p>
    </div>
  );
}
