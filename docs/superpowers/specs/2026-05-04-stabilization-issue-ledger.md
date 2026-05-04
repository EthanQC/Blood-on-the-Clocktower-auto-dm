# Stabilization Issue Ledger

Date: 2026-05-04
Plan: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`
Design: `docs/superpowers/specs/2026-05-04-stabilization-manual-qa-design.md`
Starting commit: `2b7a8f1 docs: tighten stabilization QA criteria`
Raw evidence directory: `/tmp/botc-stabilization-evidence/`

## Severity Rules

- P0: unresolved blockers, hard stalls, identity leaks, private-information leaks, or authoritative event/projection corruption.
- P1: workaround-required instability, recoverable replay/projection mismatch, recurring AutoDM/provider failure, user-visible missing assistant route, or major mobile action blockage.
- P2: non-blocking UI/config/docs/dependency issues.
- Backlog: future feature, large refactor, production deployment, full model benchmark, or real phone validation outside this pass.

## Issue Template

Copy this section for each new issue.

### STAB-000 - Short title

- Severity:
- Status: open
- Current commit:
- Date/time and timezone:
- Browser and version:
- Backend runtime:
- Room ID:
- Player IDs / seats / viewer role:
- Phase and latest event seq:
- Reproduction steps:
- Expected result:
- Actual result:
- Screenshot or recording path:
- Browser console errors:
- Network or WebSocket observation:
- Backend log time window:
- Event evidence:
- Initial suspected layer:
- Fix commit:
- Regression evidence:

## Environment Recovery

### Task 2 Step 1 - Service State

- Date/time and timezone: 2026-05-04 15:28:48 CST
- Current commit: `50ada0e docs: add stabilization QA execution plan`
- Docker services: `botc_backend_eval`, `botc_mysql`, `botc_redis`, `botc_rabbitmq`, `botc_qdrant`, `botc_prometheus`, and `botc_grafana` were running.
- Backend health: `http://localhost:8080/health` returned `ok`.
- Frontend port 8081: no listening process.
- Alternate frontend port 8092: no listening process.
- Issues opened: none.

### Task 2 Step 2 - Dependency Startup

- Result: not required; dependency containers and backend were already running.
- Volume reset: not performed.

### Task 2 Step 3 - Frontend Startup

- Command: `npm run serve -- --port 8081`
- Runtime directory: `frontend/`
- Frontend URL: `http://localhost:8081/`
- Result: compiled successfully at 2026-05-04 15:29:08 CST.
- Listening process: `node` PID 50368 on TCP `*:8081`.
- Non-blocking warning: Browserslist `caniuse-lite` database is outdated.
- Issues opened: none.

### Task 2 Step 4 - Version Facts

- Node: `v25.8.1`
- npm: `11.11.0`
- Docker: `Docker version 29.2.1, build a5c7197`
- Backend container image label: `golang:1.25.5-alpine`
- `go version` inside `botc_backend_eval`: unavailable, `go` not found.
- Local `go version`: unavailable, `go` not found.

## Issues

No issues recorded yet.
