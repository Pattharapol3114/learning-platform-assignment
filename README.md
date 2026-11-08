# Learning Platform — Assignment Module (Team 05)

React frontend for instructors to create, view, edit and delete assignments, manage
sections, and see who has submitted work through Team 06's Submission Module.

## How it fits together

```
Browser (React + Vite + Tailwind)
   │  /api/...
   ▼
Team 05 REST API on Vercel  ── repo: learning-platform-api
   ├─ /api/assignments, /api/cohorts ──► Cloud Firestore (firebase-admin)
   └─ /api/team06/assignments/:id/submissions ──► Team 06 API
                                   (returns 200 + fallback:true if Team 06 is down)
```

- **Development:** Vite proxies `/api` to the Vercel API, so no CORS setup is needed locally.
- **Production:** the build calls the Vercel API directly (`.env.production`), so the API
  must list the site's origin in its CORS allowlist (`api/_cors.js` / `ALLOWED_ORIGINS`).

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

To point local development at another API (e.g. a local `vercel dev`):

```bash
API_PROXY_TARGET=http://localhost:3000 npm run dev
```

## Scripts

| Command              | What it does                                   |
| -------------------- | ---------------------------------------------- |
| `npm run dev`        | Start the dev server                           |
| `npm test`           | Run the Vitest suite once                      |
| `npm run test:watch` | Run tests in watch mode                        |
| `npm run lint`       | Lint with oxlint                               |
| `npm run build`      | Production build into `dist/`                  |
| `npm run deploy`     | Build and deploy to Firebase Hosting           |

## Deploying to Firebase Hosting

1. Make sure the API allows the hosting origin (`https://learning-platform-assign-658de.web.app`)
   and has been redeployed on Vercel.
2. `firebase login` with an account that has access to `learning-platform-assign-658de`.
3. `npm run deploy`

## Project structure

```
src/
  services/      API calls only (httpClient.js, api.js) — no UI code
  hooks/         useAsync (loading/error/reload), useSectionName
  components/    ui/, layout/, assignments/, submissions/
  pages/         Dashboard, Create/Edit/Detail Assignment, Sections, NotFound
  utils/         date parsing/formatting, form validation
```

## Behaviour worth knowing

- **Team 06 outages never break the page.** `SubmissionList` shows a fallback when the proxy
  reports `fallback: true`, when the request fails, or when bad data crashes rendering
  (error boundary). Assignment details keep working either way.
- **Sections can't be deleted while they still have assignments** (PRD DA-04). The UI checks
  first and the API also returns `409`.
- **Editing an overdue assignment** is allowed as long as the due date is left unchanged; a
  changed due date must be in the future.
- **Instructors sign in with Firebase Auth** (email/password). Every API request carries their
  ID token, and they only see their own sections and assignments.

## API access

| Caller | How it authenticates | Can do |
| --- | --- | --- |
| Signed-in instructor | `Authorization: Bearer <Firebase ID token>` | Read and change their own data |
| Partner team | `X-Integration-Key: <key>` | Read (`GET`) only, all instructors |

Vercel environment variables: `INTEGRATION_READ_KEY` is the partner read key. `REQUIRE_AUTH=true`
turns off anonymous access; until it is set, requests without credentials behave as before.
