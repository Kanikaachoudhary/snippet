# Snipp </>

A minimal personal **code-snippet manager** — save, tag, search and copy your
reusable code in seconds.

Project Java and Web Development (DLBCSPJWD01) · Kanika Choudhary

---

## Requirements

- **Node.js 18 or newer** (developed on Node 22) — https://nodejs.org
- npm (ships with Node)
- A **Postgres** database URL (e.g. a free one from https://neon.tech)

No external APIs, no accounts, no cloud services beyond the database.

## Quick start (local development)

1. **Install dependencies** (from the repo root, uses npm workspaces):

   ```bash
   npm install
   ```

2. **Create your env file.** Copy `server/.env.example` to `server/.env` and
   paste your Postgres connection string into `DATABASE_URL`.

3. **Run both servers** (front-end + back-end together):

   ```bash
   npm run dev
   ```

   Open <http://localhost:5173>.

4. **Add demo data** (optional, only on an empty database):

   ```bash
   npm run seed
   ```

## Test

```bash
npm test
```

Runs the Vitest unit tests for the pure search/filter logic.

## Project structure

```
snipp/
├── package.json            workspaces + one-command dev/test scripts
├── .gitignore
├── README.md
├── server/                 Node.js + Express + Postgres
│   ├── .env.example        copy to .env and add your DATABASE_URL
│   ├── db.js               Postgres connection pool + schema
│   ├── snippets.js         PURE search/filter + async data-access layer
│   ├── snippets.test.js    Vitest unit tests for the pure logic
│   ├── index.js            Express app + REST endpoints
│   └── seed.js             optional demo data (only if table is empty)
└── client/                 React + Vite + Tailwind
    ├── .env.example        copy to .env for production VITE_API_URL
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css
        ├── api.js          all back-end calls in one module
        ├── App.jsx         list + search/filter state
        └── components/     Toolbar, SnippetCard, SnippetForm, EmptyState
```

## API

| Method | Endpoint                              | Description |
|--------|---------------------------------------|-------------|
| GET    | `/api/health`                         | `{ ok: true }` |
| GET    | `/api/snippets?q=&language=&tag=`     | Filtered list (q = title OR code, case-insensitive; language = exact; tag = exact; blanks match all) |
| GET    | `/api/snippets/:id`                   | One snippet, or 404 |
| POST   | `/api/snippets`                       | Create (400 invalid, 201 created) |
| PUT    | `/api/snippets/:id`                   | Update, or 404 |
| DELETE | `/api/snippets/:id`                   | 204, or 404 |
| GET    | `/api/meta`                           | `{ languages: [...], tags: [...] }` distinct + sorted |

## Architecture note

The **front-end talks only to the back-end API** — it never accesses the
database directly. All search and filter logic is a **pure function**
(`filterSnippets` in `server/snippets.js`) with no database or network access.
The list endpoint and the unit tests both use that same function, so it is
fully testable, has a single source of truth, and keeps a clean separation of
concerns between the front-end, the API and the database.

## Deployment (live URL)

The app is deployable to free hosting:

- **Backend** → Render (https://render.com) as a Node web service.
  Set the `DATABASE_URL` environment variable in the Render dashboard.
- **Frontend** → Vercel (https://vercel.com) as a static site.
  Set the `VITE_API_URL` environment variable to your Render backend URL.
- **Database** → Neon (https://neon.tech) free Postgres.
