/**
 * SnippetCard.jsx — one snippet shown as a mini editor window:
 * traffic-light header with the title as the "filename", a language pill,
 * the syntax-highlighted code, tag chips, and the action footer.
 */
import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/common';

export default function SnippetCard({ snippet, onEdit, onDelete }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Re-highlight whenever the code or language changes.
  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;
    el.removeAttribute('data-highlighted');
    el.textContent = snippet.code;
    el.className = `language-${snippet.language} hljs`;
    try { hljs.highlightElement(el); } catch { /* unknown language: leave plain */ }
  }, [snippet.code, snippet.language]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard needs a secure context; localhost is fine */ }
  }

  const ghost =
    'rounded-md border border-edge px-2.5 py-1 text-[11.5px] text-soft ' +
    'transition-colors duration-[120ms] hover:text-text';

  return (
    <article
      className="overflow-hidden rounded-xl border border-edge bg-panel"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,.3)' }}
    >
      {/* window header */}
      <div className="flex items-center gap-2 bg-win px-3 py-2.5">
        <span className="h-3 w-3 rounded-full" style={{ background: '#FF5F56' }} />
        <span className="h-3 w-3 rounded-full" style={{ background: '#FFBD2E' }} />
        <span className="h-3 w-3 rounded-full" style={{ background: '#27C93F' }} />
        <span className="ml-2 flex-1 truncate text-[12.5px] font-semibold text-text">
          {snippet.title}
        </span>
        <span className="rounded bg-mint/15 px-2 py-0.5 text-[11px] text-mint">
          {snippet.language}
        </span>
      </div>

      {/* code */}
      <pre className="overflow-x-auto bg-win px-4 py-3">
        <code
          ref={codeRef}
          className={`language-${snippet.language} hljs`}
          style={{ fontSize: '12.5px', lineHeight: 1.55 }}
        />
      </pre>

      {/* tags */}
      {snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {snippet.tags.map((t) => (
            <span key={t} className="text-[11px] text-soft">#{t}</span>
          ))}
        </div>
      )}

      {/* footer */}
      <div className="mt-3 flex items-center gap-2 border-t border-edge px-4 py-3">
        <button
          onClick={copy}
          className="rounded-md border border-mint px-2.5 py-1 text-[11.5px]
                     text-mint transition-colors duration-[120ms]"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
        <button onClick={() => onEdit(snippet)} className={ghost}>Edit</button>
        <button
          onClick={() => onDelete(snippet)}
          className="ml-auto rounded-md border border-edge px-2.5 py-1
                     text-[11.5px] text-soft transition-colors duration-[120ms]
                     hover:border-softRed hover:text-softRed"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
