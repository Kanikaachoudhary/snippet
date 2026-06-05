# Snipp </>

A personal code snippet manager I built for my Java and Web Development course. You can save, tag, search and copy reusable code snippets.

**Live app:** https://snippet-client.vercel.app  
**Course:** DLBCSPJWD01 — Project Java and Web Development  
**Student:** Kanika Choudhary · 92017730

---

## What it does

- Save code snippets with a title, language and tags
- Search snippets by title or code content
- Filter by language or tag using the dropdowns
- Copy any snippet to clipboard in one click
- Works on mobile too — responsive layout
- Dark/light mode toggle
- Favourite and duplicate snippets
- 13 unit tests for the filter logic

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL on Neon (free tier) |
| Testing | Vitest |
| Hosting | Vercel (frontend) + Render (backend) |

---

## How to run locally

### 1. Clone the repo

```bash
git clone https://github.com/Kanikaachoudhary/snippet.git
cd snippet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `server/.env` and add your database URL:
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
PORT=3001

You can get a free Postgres database at https://neon.tech

### 4. Run the app

```bash
npm run dev
```

Frontend runs at http://localhost:5173  
Backend runs at http://localhost:3001

### 5. Add demo data (optional)

```bash
npm run seed
```

---

## Run tests

```bash
npm test
```

Tests are in `server/snippets.test.js` and cover the `filterSnippets()` and `normalizeTags()` functions. No database needed to run them.

---

## API endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /api/health | Health check |
| GET | /api/snippets | Get all snippets (supports ?q= ?language= ?tag=) |
| GET | /api/snippets/:id | Get one snippet |
| POST | /api/snippets | Create a snippet |
| PUT | /api/snippets/:id | Update a snippet |
| DELETE | /api/snippets/:id | Delete a snippet |
| GET | /api/meta | Get all languages and tags for the dropdowns |

---

## Project structure
snipp/
├── server/
│   ├── index.js          Express app and routes
│   ├── snippets.js       filter logic + database functions
│   ├── snippets.test.js  unit tests
│   ├── db.js             database connection
│   └── seed.js           demo data
└── client/
└── src/
├── App.jsx
├── api.js
└── components/

---

## Deployment

- Database: Neon (free Postgres)
- Backend: Render (free tier — may take 30 sec to wake up if idle)
- Frontend: Vercel

---

## Note on the backend

The search and filter logic lives in a pure function called `filterSnippets()` in `server/snippets.js`. The same function is used by both the API and the unit tests, so the tests verify real behaviour.
