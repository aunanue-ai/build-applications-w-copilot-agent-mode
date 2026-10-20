# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep React route components focused on presentation, use the shared API client for all requests, and expose accessible loading, empty, success, and error states.
- Logic tier decision: Keep Express routes thin and put validation and business rules in services; return deliberate 4xx responses for invalid input or missing records.
- Data tier decision: Define required Mongoose fields and references for each domain model, and seed representative records idempotently without crossing tier boundaries.
- Activity tracking approach: Validate user and team IDs and confirm both records exist before creating an activity; persist its type and minutes and compute points and occurrence time on the server.
- Team management approach: Require a team name, preserve its submitted name and mascot, and create and list teams with their members through the service layer.
- Leaderboard approach: Sum activity points per team, order teams from highest total to lowest, and return each team name, total, and 1-based rank.
- Workout suggestions approach: Find the user by email and use their goal or recent activity to produce suggestions with focus, duration, difficulty, and an explanatory reason; return a deliberate 4xx when no user matches.

## Test plan

Run the focused contract suites first, then both builds. A contract failure points to behavior or data that does not meet that tier's documented API; a build failure points to TypeScript or bundling errors in that tier.

- Data tier: `npm run test:data --prefix octofit-tracker/backend` checks required model fields, references, and seed behavior; failures indicate an incomplete or invalid persistence contract.
- Logic tier: `npm run test:api --prefix octofit-tracker/backend` checks activity and team creation, leaderboard totals and ordering, workout recommendations, and deliberate client-error responses; failures indicate a route or service contract mismatch.
- Presentation tier: `npm test --prefix octofit-tracker/frontend` checks API-backed content, workout request parameters, and accessible loading, empty, and error states; failures indicate a UI/API integration or presentation-state mismatch.
- Backend build: `npm run build --prefix octofit-tracker/backend` type-checks the API and data tiers; failures indicate TypeScript errors in backend code.
- Frontend build: `npm run build --prefix octofit-tracker/frontend` type-checks and bundles the presentation tier; failures indicate frontend TypeScript or Vite build errors.
