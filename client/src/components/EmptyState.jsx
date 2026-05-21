/**
 * EmptyState.jsx — shown when there are no snippets at all, or when a
 * search/filter returns nothing.
 */
export default function EmptyState({ filtered, onNew }) {
  return (
    <div className="rounded-xl border border-dashed border-edge px-6 py-12
                    text-center">
      <p className="text-[13px] text-soft">
        {filtered
          ? 'No snippets match your search or filters.'
          : 'No snippets yet.'}
      </p>
      {!filtered && (
        <button
          onClick={onNew}
          className="mt-4 h-9 rounded-lg bg-mint px-4 text-[13px] font-semibold
                     text-mintInk transition-transform duration-[120ms]
                     active:scale-[.98]"
        >
          + Add your first snippet
        </button>
      )}
    </div>
  );
}
