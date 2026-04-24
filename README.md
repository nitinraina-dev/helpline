# XRISE Helpdesk

A mini helpdesk web app. End-customers submit support tickets without logging in. Internal agents triage, respond, and close tickets through a role-based dashboard.

---

## Running Locally

### Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### 1. Clone and install

```bash
git clone <repo-url>
cd helpline

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in the values:

```env
PORT=3002
MONGO_URI=mongodb://127.0.0.1:27017/helpdesk
JWT_SECRET=your-secret-here          # any long random string
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Start the server

```bash
cd server
npm run dev
# → API running on http://localhost:3002
```

On first start the server seeds two default users:

| Email | Password | Role |
|---|---|---|
| `agent1@xriseai.com` | `123456` | agent |
| `admin@xriseai.com` | `123456` | admin |

### 4. Start the client

```bash
cd client
npm run dev
# → UI running on http://localhost:5173
```

### 5. Run tests

```bash
cd server
npm test
```

Tests use an in-memory MongoDB instance — no running database required.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs — keep long and random |
| `CLIENT_URL` | Yes | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `NODE_ENV` | No | Set to `production` on deploy |

A complete template is at [`server/.env.example`](server/.env.example). The real `.env` is git-ignored.

---

## Architecture Decisions

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full writeup. Key decisions summarised:

**`latestReply` denormalised onto the ticket** — The public status-check endpoint is the highest-traffic unauthenticated route. Storing the latest reply directly on the ticket keeps it a single `findOne()` with `.lean()` instead of a join against `ticketevents`.

**Regex search over `$text`** — The dashboard search uses a case-insensitive regex rather than MongoDB's `$text` operator. This allows partial-word matching (typing "log" finds "login"), which `$text` does not support. The tradeoff is that regex cannot use the text index, so at large scale this should be moved to a dedicated search service.

**JWT in Authorization header (not cookies)** — Keeps the API stateless and avoids CSRF complexity for an internal tool. Tokens have a 7-day expiry. The secret is loaded from the environment and never committed.

**Single Express app exported from `app.ts`** — The Express instance and the server bootstrap (`listen`, `connectDB`) are separated so tests can import the app without starting the server or connecting to the real database.

---

## Known Bugs / Limitations

- **No ticket assignment on creation** — Tickets are created with `assignedTo: null`. An admin must manually reassign from the ticket detail page. Agents with no assigned tickets see an empty dashboard.

- **Frontend is JSX, not TSX** — The client is plain JavaScript React. There is no type safety on API responses or component props. A TypeScript migration is listed as a week-2 priority in ARCHITECTURE.md.

- **Regex search is unindexed at scale** — The subject/body search does a collection scan. Acceptable for development; needs `$text` or a dedicated search service before production load.

- **No logout invalidation** — JWTs are stateless; logging out only clears localStorage. A stolen token remains valid until its 7-day expiry. A token blocklist (Redis) would fix this.

- **`latestReply` is overwritten, not appended** — The public status page always shows the most recent reply. Full reply history is only accessible to logged-in agents via the timeline.
