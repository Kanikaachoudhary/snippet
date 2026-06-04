

# Snipp &lt;/&gt;

> Save, tag, search and copy your reusable code in seconds.

A personal code-snippet manager built with **React 18 + Vite** on the front-end and **Node.js + Express + PostgreSQL** on the back-end. Fully responsive, deployed for free on Vercel + Render + Neon.

**Live app:** https://snippet-server-eight.vercel.app  
**Course:** DLBCSPJWD01 — Project Java and Web Development  
**Student:** Kanika Choudhary · 92017730

---

## Features

- Create, edit and delete code snippets with a title, language and tags
- Debounced live search across title and code body
- Filter by language or tag via dropdowns (populated from the database)
- One-click copy to clipboard
- Responsive layout — 2-column grid on desktop, single column on mobile (375 px / 768 px / 1280 px tested)
- 13 Vitest unit tests covering all filter and normalisation logic

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, Tailwind CSS      |
| Backend  | Node.js 22, Express               |
| Database | PostgreSQL (Neon free tier)       |
| Testing  | Vitest                            |
| DevOps   | GitHub, Render, Vercel            |

---

## Project Structure

```
snipp/
├── package.json            workspaces + one-command dev/test scripts
├── .gitignore
├── README.md
├── server/
│   ├── .env.example        copy to .env and fill in DATABASE_URL
│   ├── db.js               Postgres connection pool + ensureSchema()
│   ├── snippets.js         pure filterSnippets() + normalizeTags() + data-access layer
│   ├── snippets.test.js    13 Vitest unit tests
│   ├── index.js            Express app + all REST routes
│   └── seed.js             optional demo data loader
└── client/
    ├── .env.example        copy to .env and fill in VITE_API_URL
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css
        ├── api.js          all fetch calls to the backend in one place
        ├── App.jsx         root component — list + search/filter state
        └── components/
            ├── Toolbar.jsx
            ├── SnippetCard.jsx
            ├── SnippetForm.jsx
            └── EmptyState.jsx
```

---

## Prerequisites

- **Node.js 18+** (20 or 22 recommended)
- **npm 9+**
- A **PostgreSQL database URL** — get one free at https://neon.tech

---

## Local Installation & Run

### 1. Clone the repository

```bash
git clone https://github.com/Kanikaachoudhary/snippet.git
cd snippet
```

### 2. Install all dependencies (root, server and client)

```bash
npm install
```

### 3. Configure the backend environment

```bash
cp server/.env.example server/.env
```

Open `server/.env` and set your database connection string:

```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
PORT=3001
```

> Get a free Postgres URL from https://neon.tech — create a project and copy the connection string.

### 4. (Optional) Configure the frontend environment for production API

The frontend automatically proxies to `http://localhost:3001` in development, so no extra setup is needed locally. For a production build pointing at a deployed backend, create `client/.env`:

```bash
cp client/.env.example client/.env
```

```
VITE_API_URL=https://your-render-backend.onrender.com
```

### 5. Start the development servers

```bash
npm run dev
```

This runs the backend (`:3001`) and frontend (`:5173`) concurrently via `concurrently`.

Open **http://localhost:5173** in your browser.

### 6. (Optional) Seed demo data

If your database is empty and you want sample snippets to appear:

```bash
npm run seed
```

The seed script only inserts data when the table is empty — it is safe to run multiple times.

---

## Run Tests

```bash
npm test
```

Runs the 13 Vitest unit tests in `server/snippets.test.js`. No database connection required — tests cover only the pure `filterSnippets()` and `normalizeTags()` functions.

Expected output:

```
✓ filterSnippets › empty query matches all
✓ filterSnippets › matches by title (case-insensitive)
✓ filterSnippets › matches by code body
✓ filterSnippets › returns nothing when there is no match
✓ filterSnippets › filters by language (exact, case-insensitive)
✓ filterSnippets › filters by tag (exact membership)
✓ filterSnippets › combines q + language + tag with logical AND
✓ filterSnippets › can produce an empty result
✓ filterSnippets › does NOT mutate its input array
✓ normalizeTags › trims and lowercases
✓ normalizeTags › accepts a comma-separated string
✓ normalizeTags › accepts an array and drops empties
✓ normalizeTags › handles null/undefined safely

Test Files  1 passed (1)
Tests       13 passed (13)
```

---

## API Reference

All endpoints are served by the Express backend on port `3001` locally.

| Method   | Endpoint                            | Status     | Description                                                    |
|----------|-------------------------------------|------------|----------------------------------------------------------------|
| `GET`    | `/api/health`                       | `200`      | Health check — returns `{ ok: true }`                          |
| `GET`    | `/api/snippets?q=&language=&tag=`   | `200`      | Filtered list. `q` matches title or code body (case-insensitive). Blank params match all. |
| `GET`    | `/api/snippets/:id`                 | `200/404`  | Single snippet by ID, or 404 if not found                      |
| `POST`   | `/api/snippets`                     | `201/400`  | Create snippet. Required fields: `title`, `language`, `code`   |
| `PUT`    | `/api/snippets/:id`                 | `200/404`  | Update snippet fields                                          |
| `DELETE` | `/api/snippets/:id`                 | `204/404`  | Delete snippet                                                 |
| `GET`    | `/api/meta`                         | `200`      | Returns `{ languages: [...], tags: [...] }` — distinct + sorted, used to populate filter dropdowns |

### Example: create a snippet

```bash
curl -X POST http://localhost:3001/api/snippets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fetch with async/await",
    "language": "javascript",
    "code": "const res = await fetch(url);\nconst data = await res.json();",
    "tags": "fetch,async,api"
  }'
```

---

## Architecture

```
Browser (React + Vite)
        │
        │  fetch() — HTTP/JSON
        ▼
Express API (Node.js)
        │
        │  pg Pool — SSL
        ▼
PostgreSQL (Neon)
```

**Key design decision:** the front-end never touches the database directly. All search and filter logic lives in a single pure function — `filterSnippets()` in `server/snippets.js`. The list endpoint and the unit tests both call that same function, which means it is fully testable without any database mock and maintains a single source of truth.

---

## Deployment

The app runs on three free services:

### 1. Database — Neon
1. Create a free account at https://neon.tech
2. Create a new project
3. Copy the connection string — you will need it for Render

### 2. Backend — Render
1. Go to https://render.com → New → Web Service
2. Connect your GitHub repository
3. Set **Root Directory** to `server`
4. Build command: `npm install`
5. Start command: `node index.js`
6. Add environment variable: `DATABASE_URL` = your Neon connection string

### 3. Frontend — Vercel
1. Go to https://vercel.com → New Project
2. Connect your GitHub repository
3. Set **Root Directory** to `client`
4. Framework preset: **Vite**
5. Add environment variable: `VITE_API_URL` = your Render backend URL (e.g. `https://snipp-xxxx.onrender.com`)
6. Deploy

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep may take ~30 seconds to respond while the service wakes up.

---

## Available Scripts (from root)

| Command       | Description                                              |
|---------------|----------------------------------------------------------|
| `npm run dev` | Start backend + frontend concurrently in development     |
| `npm test`    | Run all Vitest unit tests                                |
| `npm run build` | Build the frontend for production                      |
| `npm run seed` | Load demo snippets into the database (only if empty)    |
| `npm start`   | Start the backend in production mode                     |

---

## License

MIT
