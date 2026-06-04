const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

async function handle(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  list({ q = '', language = '', tag = '' } = {}) {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (language) p.set('language', language);
    if (tag) p.set('tag', tag);
    const qs = p.toString();
    return fetch(`${BASE}/snippets${qs ? `?${qs}` : ''}`).then(handle);
  },
  meta() { return fetch(`${BASE}/meta`).then(handle); },
  create(snippet) {
    return fetch(`${BASE}/snippets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snippet)
    }).then(handle);
  },
  update(id, snippet) {
    return fetch(`${BASE}/snippets/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snippet)
    }).then(handle);
  },
  remove(id) {
    return fetch(`${BASE}/snippets/${id}`, { method: 'DELETE' }).then(handle);
  },
  toggleFavourite(id) {
    return fetch(`${BASE}/snippets/${id}/favourite`, { method: 'POST' }).then(handle);
  },
  duplicate(id) {
    return fetch(`${BASE}/snippets/${id}/duplicate`, { method: 'POST' }).then(handle);
  }
};
