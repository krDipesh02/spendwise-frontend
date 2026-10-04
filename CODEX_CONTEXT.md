# Codex Context — Frontend

Internal implementation handoff for this repository. README is intentionally a concise purpose/role description for people; this file carries code and flow details for future Codex. Check git status and source before editing.

## Scope

React/Vite single-page browser app. It owns browser presentation and interaction only. Backend API uses /api/v1. Local Vite usually runs on :5173 and proxies to backend :8080; container Nginx serves built assets and proxies API. Do not make the frontend the source of truth for identity, role, permissions, or persistent data.

## Source map

- src/api.js: shared API methods, fetch behavior, in-memory access token and refresh handling.
- src/session.jsx: SessionProvider, useSession and initial session restoration. refreshSession is a function inside provider, exposed via context value; it is not imported as a standalone helper.
- src/App.jsx: routes and composition.
- src/components/ProtectedRoute.jsx and AdminRoute.jsx: UI guards only.
- src/components/Layout.jsx: app navigation and admin link.
- src/pages/LandingPage.jsx: password login/register and Google OAuth navigation.
- src/pages/TelegramAdminPage.jsx: create invites; list and approve/reject pending claims.
- src/pages/PasswordSetupPage.jsx: reads one-time token from query string and assigns username/password.
- ExpensesPage, CategoriesPage, BudgetsPage, DashboardPage, ProfilePage and AutomationPage: domain screens.
- vite.config.js: local proxy. nginx.conf and Dockerfile: container web/proxy behavior. Current Vite target is hardcoded localhost:8080; do not assume .envExample changes it.

Follow the existing component and CSS patterns; this project does not use a large UI component framework.

## Browser session lifecycle

Password login/register sends credentials to backend. Backend returns a short-lived access JWT and sets opaque SPENDWISE_REFRESH HttpOnly cookie. API module holds access JWT in JS memory and attaches it as bearer token. Never move it to localStorage as a casual fix.

On mount, SessionProvider calls api.getSession(). The API method restores/refreshes access JWT through backend refresh cookie and retrieves authenticated session metadata. This is why a login call can be followed by a session call: first authenticates, second hydrates shared React state and scopes for the app.

Google login is a browser navigation to backend /api/v1/oauth2/authorization/google. On success backend sets refresh cookie and redirects to frontend; app startup calls refresh/session. Do not perform Google OAuth as a fetch call. Refresh cookie is HttpOnly and JS cannot read it.

Past bug: refresh fetch followed a 302 to OAuth entry and browser reported CORS. If it returns, inspect backend refresh endpoint (anonymous should get API 401 rather than OAuth redirect) and api.js redirect/error behavior. Same-origin /api/v1 through proxy is expected; direct backend origin calls create cookie/CORS complications.

## Role/scopes and admin UI

Backend places role/scopes in JWT/session. USER has normal app scopes; ADMIN additionally has Telegram management scopes. Layout/AdminRoute use these to avoid showing inaccessible admin UI, but backend must check every request. Never rely on UI-only access checks or client-supplied role.

Telegram admin page uses backend APIs to generate generic one-time invite links and list/approve/reject pending claims. Admin verifies claimant out of band. Claim approval creates profile and active Telegram mapping in backend.

Approved Telegram user sends /setup to bot; bot obtains one-use backend setup URL. PasswordSetupPage collects username/password and submits setup token, adding web credentials to the profile already associated with Telegram. It should not create a new account or request arbitrary Telegram ID.

## Routing and deployment notes

Vite config proxies /api/v1 to http://localhost:8080. nginx.conf proxies to host.docker.internal:8080/api/v1. Verify exact paths and cookies when changing proxy. Browser env variables are public after build; never put backend service tokens, Telegram tokens/webhook secrets, or JWT private key into VITE variables.

## Date issue (Telegram path, not frontend)

Telegram answered today as Oct 4, 2023 when actual date was Oct 4, 2026 (Asia/Kolkata); Telegram-created expense spentAt was old but DB createdAt current. This frontend did not create that Telegram expense. Bot now injects authoritative current time/date using APP_TIMEZONE into agent system context; MCP still accepts required spent_at and passes it to backend. Check deployed bot/container and tool payload if incident recurs. For a separate UI date issue, inspect input date format and timezone conversion; backend expects date-only ISO YYYY-MM-DD.

## Documentation and worktree

Keep README focused on purpose and role in the system. Put setup/API/config instructions in another developer guide if needed. Before doc changes, note README had existing user edits in both staged and unstaged versions; its concise rewrite is requested. Do not discard other changes.
