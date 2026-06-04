const DEFAULT_LANGUAGES = ['javascript', 'python', 'css', 'sql', 'typescript', 'bash'];

export default function Toolbar({
  q, onQ, language, onLanguage, tag, onTag, meta, count, onNew
}) {
  const languages = meta.languages.length > 0 ? meta.languages : DEFAULT_LANGUAGES;

  const field =
    'h-9 rounded-lg border border-[var(--edge)] bg-[var(--panel)] px-3 text-[13px] ' +
    'text-[var(--text)] placeholder:text-[var(--soft)] transition-colors duration-[120ms] ' +
    'focus:border-[var(--mint)] focus:outline-none';

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
          {languages.map((l) => (
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
          className="h-9 rounded-lg bg-[var(--mint)] px-4 text-[13px] font-semibold
                     text-[var(--mintInk)] transition-transform duration-[120ms]
                     active:scale-[.98] hover:opacity-90"
        >
          + New snippet
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--soft)]">
        {count} snippet{count === 1 ? '' : 's'}
        {meta.languages.length === 0 && count === 0 && (
          <span className="ml-2 text-[var(--mint)]">
            ← add your first snippet to get started
          </span>
        )}
      </p>
    </div>
  );
}
