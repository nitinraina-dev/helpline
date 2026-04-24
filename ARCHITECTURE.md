# Architecture — XRISE Helpdesk

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│   React + Vite (port 5173)                                  │
│   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐   │
│   │  Public  │  │  Login   │  │ Dashboard │  │  Ticket  │   │
│   │  Forms   │  │  Page    │  │  Page     │  │  Detail  │   │
│   └────┬─────┘  └────┬─────┘  └─────┬─────┘  └────┬─────┘   │
│        │             │              │              │        │
└────────┼─────────────┼──────────────┼──────────────┼────────┘
         │  HTTP/REST  │  (Axios +    │  Bearer JWT) │
┌────────▼─────────────▼──────────────▼──────────────▼────────┐
│                  Express API  (port 3002)                   │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │ Public      │   │ Auth         │   │ Protected        │  │
│  │ /submit     │   │ /login       │   │ /dashboard       │  │
│  │ /status     │   │              │   │ /tickets/:id     │  │
│  │ rate-limit  │   │              │   │ /reply /reassign │  │
│  └──────┬──────┘   └──────┬───────┘   └────────┬─────────┘  │
│         │                 │                    │            │
│  ┌──────▼─────────────────▼────────────────────▼──────────┐ │
│  │   Middleware: helmet · cors · JWT verify · role check  │ │
│  └──────────────────────────┬─────────────────────────────┘ │
└─────────────────────────────┼───────────────────────────────┘
                              │ Mongoose ODM
                    ┌─────────▼──────────┐
                    │     MongoDB        │
                    │  tickets           │
                    │  users             │
                    │  ticketevents      │
                    └────────────────────┘

What I'd add next: an email delivery service (SendGrid/Resend) to
notify customers on reply, and a Redis layer for session caching.
```

---

## Data Model, Indexes, and Schema Tradeoff

### Collections

**users** — `name`, `email` (unique), `password` (bcrypt), `role` (agent | admin), timestamps

**tickets**
| Field | Type | Index |
|---|---|---|
| `ticketId` | String (TKT-xxxxxx) | unique |
| `email` | String | single-field |
| `status` | Enum | single-field |
| `priority` | Enum | single-field |
| `assignedTo` | ObjectId → users | single-field |
| `subject`, `body` | String | compound text |

**ticketevents** — `ticketId` (ref), `type`, `message`, `actor`, timestamps. No extra index; queried only by `ticketId` on the detail page.

### Schema tradeoff: `latestReply` denormalised onto the ticket

The public status-check page needs to show the latest agent reply. The normalised design would join `ticketevents` (filtering `type: "reply"`, sorting by date, taking the last). Instead, `latestReply` is stored directly on the ticket and overwritten on every reply.

**Why:** the status-check is the highest-traffic unauthenticated endpoint. Keeping it a single `Ticket.findOne()` with `.lean()` avoids a second collection hit and keeps latency low. The tradeoff is that reply history is only visible through the full timeline on the detail page — the public surface only ever needs the most recent reply, so no data is lost for that use case.

---

## Auth and Authorization Model

**How a request is proved legitimate:**
1. `POST /api/auth/login` validates email + bcrypt password, returns a signed HS256 JWT (7-day expiry, payload: `{ id, email, role }`).
2. Every protected route passes through `authMiddleware`, which extracts the Bearer token from the `Authorization` header, verifies it with `JWT_SECRET`, and attaches the decoded payload to `req.user`.
3. Routes that are admin-only additionally pass through `roleMiddleware({ allowRoles("admin") })`, which returns 403 if `req.user.role !== "admin"`.

**How cross-agent data access is prevented:**
The dashboard query (`GET /api/tickets/dashboard`) checks `req.user.role` before executing. When the role is `agent`, the query unconditionally sets `assignedTo: req.user.id`, overriding any assignee filter from query params. An agent cannot retrieve another agent's tickets by spoofing a query parameter. The ticket detail endpoint (`GET /api/tickets/:id`) performs the same ownership check and returns 403 if the ticket is assigned to a different agent.

Public endpoints (`/submit`, `/status`) require no token and are rate-limited to 20 requests per 15-minute window.

---

## Scaling

**1,000 tenants / 1M tickets:** The first bottleneck is the dashboard query. With 1M tickets, even indexed queries on `status` + `assignedTo` produce large result sets, and the regex search on `subject`/`body` does a collection scan (regex cannot use the text index). At this scale, replace the regex with MongoDB `$text` search (which uses the existing text index) or migrate to a dedicated search service like Elasticsearch. The `ticketevents` collection will also grow unboundedly — add a TTL index to archive events older than a configurable threshold, or move closed-ticket events to cold storage.

**100 concurrent agents:** The bottleneck shifts to the Node.js process. Express handles I/O concurrency well but is single-threaded for CPU work. At 100 concurrent agents all polling the dashboard (with debounced search), the Mongoose connection pool (default 5 connections) becomes the constraint. Increase the pool size (`mongoose.connect(uri, { maxPoolSize: 50 })`), run the server behind a PM2 cluster (one process per CPU core), or deploy multiple instances behind a load balancer. MongoDB Atlas auto-scales read replicas to absorb the read load.

**What to change:** Introduce a Redis cache for the dashboard list (short TTL, invalidated on ticket write) to cut repeated identical queries from agents watching the same filters. Move JWT verification to an API gateway layer so it doesn't touch the application server on every request.

---

## Observability

**Logs (Pino, structured JSON):** Every request is logged with method, URL, status, and response time via `pino-http`. Application-level events to add: ticket creation (with ticketId), agent login (with email), failed auth attempts (for alerting), and reassignment events.

**Metrics to measure:** p50/p95/p99 response time on `/api/public/tickets/submit` and `/api/tickets/dashboard`; MongoDB query duration (via Mongoose's debug mode or Atlas metrics); rate-limit hit rate on public endpoints; JWT verification failure rate.

**Alerts to set:**
- p95 response time on public endpoints > 500 ms
- Error rate (5xx) > 1% over a 5-minute window
- Rate-limit rejections spike (indicates abuse or a runaway client)
- MongoDB connection pool exhaustion

---

## Top 3 Items for Week 2–3

1. **Email notifications** — Notify the customer (via SendGrid or Resend) when an agent replies or closes their ticket. The ticket already stores the customer's email; the reply endpoint is the only integration point. This is the highest-value UX improvement and directly maps to the core helpdesk workflow.

2. **TypeScript on the frontend** — Migrate the React client from `.jsx` to `.tsx`. The backend is fully typed; the frontend has no type safety on API responses, component props, or context values. This closes the most likely source of runtime bugs as the UI grows.

3. **Compound indexes for common dashboard queries** — The dashboard frequently filters by `{ assignedTo, status }` and `{ status, priority }` together. Single-field indexes help but a compound index `{ assignedTo: 1, status: 1, createdAt: -1 }` would allow MongoDB to satisfy the agent dashboard query — the most common read path — with a single index scan and no in-memory sort.
