import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/common';

export default function SnippetCard({ snippet, onEdit, onDelete }) {
  const codeRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;
    el.removeAttribute('data-highlighted');
    el.textContent = snippet.code;
    el.className = `language-${snippet.language} hljs`;
    try { hljs.highlightElement(el); } catch {}
  }, [snippet.code, snippet.language]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const langColors = {
    javascript: '#f0883e', typescript: '#3b82f6',
    python: '#3fb950', css: '#79c0ff',
    sql: '#d2a8ff', bash: '#8b949e', html: '#f85149',
  };
  const langColor = langColors[snippet.language?.toLowerCase()] || 'var(--mint)';

  return (
    <article className="overflow-hidden rounded-xl border transition-colors duration-200"
      style={{ borderColor:'var(--edge)', background:'var(--panel)',
               boxShadow:'0 1px 3px rgba(0,0,0,.15)' }}>

      <div className="flex items-center gap-2 px-3 py-2.5"
           style={{ background:'var(--win)' }}>
        <span className="h-3 w-3 rounded-full" style={{ background:'#FF5F56' }} />
        <span className="h-3 w-3 rounded-full" style={{ background:'#FFBD2E' }} />
        <span className="h-3 w-3 rounded-full" style={{ background:'#27C93F' }} />
        <span className="ml-2 flex-1 truncate text-[12.5px] font-semibold"
              style={{ color:'var(--text)' }}>
          {snippet.title}
        </span>
        <span className="rounded px-2 py-0.5 text-[11px] font-semibold"
              style={{ background:`${langColor}20`, color:langColor }}>
          {snippet.language}
        </span>
      </div>

      <pre className="overflow-x-auto px-4 py-3" style={{ background:'var(--win)' }}>
        <code ref={codeRef}
          className={`language-${snippet.language} hljs`}
          style={{ fontSize:'12.5px', lineHeight:1.6 }} />
      </pre>

      {snippet.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-2">
          {snippet.tags.map((t) => (
            <span key={t} className="rounded-full px-2 py-0.5 text-[11px]"
              style={{ background:'var(--win)', color:'var(--soft)',
                       border:'1px solid var(--edge)' }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2 border-t px-4 py-3"
           style={{ borderColor:'var(--edge)' }}>
        <button onClick={copy}
          className="rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition-all duration-[120ms]"
          style={{ border:'1px solid var(--mint)',
                   color: copied ? 'var(--mintInk)' : 'var(--mint)',
                   background: copied ? 'var(--mint)' : 'transparent' }}>
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
        <button onClick={() => onEdit(snippet)}
          className="rounded-md px-2.5 py-1 text-[11.5px] transition-colors duration-[120ms]"
          style={{ border:'1px solid var(--edge)', color:'var(--soft)' }}>
          Edit
        </button>
        <button onClick={() => onDelete(snippet)}
          className="ml-auto rounded-md px-2.5 py-1 text-[11.5px] transition-colors duration-[120ms]"
          style={{ border:'1px solid var(--edge)', color:'var(--soft)' }}>
          Delete
        </button>
      </div>
    </article>
  );
}
