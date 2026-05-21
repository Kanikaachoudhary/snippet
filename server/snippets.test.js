/**
 * snippets.test.js
 * ----------------
 * Unit tests for the PURE search/filter logic. No database, no server —
 * just plain arrays in, plain arrays out. Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import { filterSnippets, normalizeTags } from './snippets.js';

const data = [
  { title: 'Fetch JSON', code: 'await fetch(url)', language: 'javascript', tags: ['fetch', 'async'] },
  { title: 'Read file', code: "open('data.txt')", language: 'python', tags: ['io', 'files'] },
  { title: 'Inner join', code: 'SELECT * FROM a JOIN b', language: 'sql', tags: ['query'] }
];

describe('filterSnippets (pure search/filter)', () => {
  it('empty query matches all', () => {
    expect(filterSnippets(data, {})).toHaveLength(3);
    expect(filterSnippets(data, { q: '', language: '', tag: '' })).toHaveLength(3);
  });

  it('matches by title (case-insensitive)', () => {
    const r = filterSnippets(data, { q: 'FETCH json' });
    expect(r).toHaveLength(1);
    expect(r[0].title).toBe('Fetch JSON');
  });

  it('matches by code body', () => {
    const r = filterSnippets(data, { q: 'select * from' });
    expect(r).toHaveLength(1);
    expect(r[0].language).toBe('sql');
  });

  it('returns nothing when there is no match', () => {
    expect(filterSnippets(data, { q: 'nonexistent-term' })).toHaveLength(0);
  });

  it('filters by language (exact, case-insensitive)', () => {
    expect(filterSnippets(data, { language: 'Python' })).toHaveLength(1);
  });

  it('filters by tag (exact membership)', () => {
    expect(filterSnippets(data, { tag: 'async' })).toHaveLength(1);
    expect(filterSnippets(data, { tag: 'missing' })).toHaveLength(0);
  });

  it('combines q + language + tag with logical AND', () => {
    expect(
      filterSnippets(data, { q: 'fetch', language: 'javascript', tag: 'async' })
    ).toHaveLength(1);
    expect(
      filterSnippets(data, { q: 'fetch', language: 'python' })
    ).toHaveLength(0);
  });

  it('can produce an empty result', () => {
    expect(filterSnippets(data, { language: 'rust' })).toEqual([]);
  });

  it('does NOT mutate its input array', () => {
    const copy = JSON.parse(JSON.stringify(data));
    filterSnippets(data, { q: 'fetch' });
    expect(data).toEqual(copy);
    expect(data).toHaveLength(3);
  });
});

describe('normalizeTags', () => {
  it('trims and lowercases', () => {
    expect(normalizeTags([' Fetch ', 'ASYNC'])).toEqual(['fetch', 'async']);
  });

  it('accepts a comma-separated string', () => {
    expect(normalizeTags(' Fetch , ASYNC ,, http ')).toEqual(['fetch', 'async', 'http']);
  });

  it('accepts an array and drops empties', () => {
    expect(normalizeTags(['a', '', '  ', 'B'])).toEqual(['a', 'b']);
  });

  it('handles null/undefined safely', () => {
    expect(normalizeTags(null)).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
  });
});
