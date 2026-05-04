# Stabilization Manual QA Design

Date: 2026-05-04
Repository: `/Users/abble/Blood-on-the-Clocktower-auto-dm`

## Purpose

This design defines the first stabilization pass for the Blood on the Clocktower Auto-DM repository. The goal is to bring the current codebase to a close-to-release-grade, manually verifiable state before deeper product work.

The pass is limited to existing behavior: room creation, joining, seating, game start, night actions, day discussion, nomination, voting, execution, win/loss resolution, refresh and reconnect behavior, same-room identity isolation, different-room isolation, mobile responsive viewport checks, and the basic AutoDM hosting chain.

Future feature work remains a candidate pool only. It must not expand the first stabilization pass.

## Context From The Interrupted Session

The previous Codex session stalled because remote context compaction failed, not because the project runtime crashed. The observed error was a remote compact request disconnecting before completion at `/codex/responses/compact`.

At the time of handoff, local checks indicated:

- Backend and dependency containers had been running, including `botc_backend_eval`, MySQL, Redis, RabbitMQ, Qdrant, Prometheus, and Grafana.
- `http://localhost:8080/health` returned HTTP 200 with `ok`.
- The frontend dev server on port `8081` was no longer listening.
- Backend logs did not show a crash and were still showing normal game flow progress.
- The git worktree had no tracked code changes, only untracked `AGENTS.md` and `.codex/`.

This context is a recovery note only. The stabilization pass evaluates the repository and runtime behavior; Codex platform compaction failures are not project defects.

## Scope

In scope:

- Environment recovery for local manual testing.
- Desktop browser multi-player testing with multiple tabs or browser profiles.
- Mobile responsive viewport testing through the desktop browser.
- Five-player quick closure flow.
- Seven-player release-grade flow.
- AutoDM real-provider connectivity and in-game hosting chain.
- P0 and P1 fixes found during manual testing.
- Low-risk P2 fixes only when they are clearly bounded.

Out of scope for this pass:

- New roles, new scripts, or new rule packs.
- Major UI redesign.
- Real phone device testing.
- Production deployment.
- Full security audit.
- Long-duration load testing.
- Broad dependency vulnerability remediation unless it blocks startup or manual testing.
- Large refactors not required for a P0 or P1 fix.
- Full Gemini versus DeepSeek quality ranking.

## Acceptance Criteria

The pass is successful when all of the following are true:

1. The local environment can be restored into a testable state with backend, dependencies, frontend, and browser access.
2. A five-player game can proceed from room creation to win/loss resolution without a hard blocker.
3. A seven-player game can cover night, day, nomination, vote, execution, refresh/reconnect, and room isolation flows without P0 or unresolved P1 issues.
4. Player identity and private information are not obviously leaked across tabs, players, or rooms.
5. AutoDM can be configured with real provider credentials without leaking secrets, and at least one real model path can participate in an observable in-game hosting flow.
6. All discovered issues are classified as P0, P1, P2, or Backlog, with P0 and P1 either fixed or explicitly blocked with evidence.

## Manual Test Matrix

Manual testing must be performed through real browser interaction by controlling the user's computer. Scripted tests may assist diagnostics, log inspection, or state inspection, but they must not replace manual functional conclusions.

### Layer 1: Environment Recovery

Verify:

- Docker dependency containers are running or can be restarted.
- Backend health endpoint returns HTTP 200.
- Frontend dev server is running on a single explicit port, preferably `8081` for continuity with prior testing.
- Browser can load the frontend.
- WebSocket connection can establish.
- Browser console has no immediate fatal errors.

### Layer 2: Five-Player Quick Closure

Run a fast game using one primary human view plus bots or browser-controlled seats as appropriate.

Cover:

- Create room.
- Join room.
- Seat players.
- Add bots if needed.
- Start game.
- Complete first night.
- Reach day.
- Chat or discuss.
- Nominate.
- Vote.
- Execute.
- Continue until win/loss resolution or a clear blocking defect.

This layer is optimized for quickly exposing hard stalls, especially night-flow stalls.

### Layer 3: Seven-Player Release-Grade Flow

Run a fuller flow with multiple browser tabs, windows, or profiles.

Cover:

- Multiple player identities in the same room.
- Evil-team and private-information visibility.
- Different-room isolation.
- Refresh and reconnect from multiple player views.
- Night actions across a larger role set.
- Day discussion and player chat.
- Nomination, defense, vote sequence, and execution.
- Mobile responsive viewport for core actions.

This layer determines whether the current repository is close enough to release-grade stability for existing functionality.

### Layer 4: AutoDM Real Provider Chain

After credentials are available, verify:

- `backend/.env` can configure the chosen provider and model.
- Secrets are never printed in chat, summary, commits, or logs.
- Provider health or minimal API call succeeds.
- AutoDM can make a real request during the game flow.
- Timeout and provider error behavior does not freeze the room.
- The game can continue after AutoDM receives a valid response or a handled failure.

## Issue Severity

P0:

- Cannot start required services.
- Cannot create room, join, seat, or start game.
- Night, vote, execution, or resolution hard-stalls the game.
- Player identity is mixed across tabs or rooms.
- Private information is leaked to the wrong player.
- AutoDM enabled state blocks core game progression completely.

P1:

- Main flow can be worked around but is materially unstable.
- Refresh or reconnect corrupts important state.
- WebSocket reconnect behavior is unreliable.
- AutoDM has recurring timeout, parsing, or provider configuration failures.
- AI assistant entry point is user-visible but routes to a missing backend endpoint.
- Mobile responsive viewport prevents major actions.

P2:

- Missing icon registration.
- Port documentation or fallback mismatch.
- Non-blocking copy or UI clarity issue.
- Npm audit findings that do not block local testing.
- Historical file-size redline violations.
- Plan hook path drift between `.codex` and project instructions.

Backlog:

- New features.
- Large refactors.
- Real phone testing.
- Production deployment.
- Long-running load tests.
- Full model quality benchmark.
- Full dependency security cleanup.

## Repair Rules

Repairs are evidence-driven:

1. Reproduce the issue manually first.
2. Record room, player identity, visible page state, browser console symptoms, backend logs, and relevant request or WebSocket behavior.
3. Locate the affected layer: frontend state, WebSocket, backend command handling, event store, projection, bot, AutoDM, provider configuration, or environment.
4. Apply the smallest practical fix.
5. Re-run the manual path that exposed the defect.

P0 and P1 issues are in scope for repair. P2 issues may be fixed only when the change is low-risk and clearly bounded. Backlog items are recorded but not implemented in this pass.

Large historical files should not receive new unrelated logic. Known hotspots include `backend/internal/engine/engine.go`, `backend/internal/agent/autodm.go`, `backend/internal/game/night.go`, `frontend/src/store/plugins/ws_game_events.js`, and `frontend/src/components/VoteOverlay.vue`. If a P0 or P1 requires touching one of these files, the change should remain narrowly targeted; otherwise new helper code should live in smaller, clearer files that respect existing package boundaries.

## AutoDM And Provider Handling

AutoDM is included in stabilization, but only the provider call chain is a blocking requirement for this pass.

Credential handling:

- The chosen credentials may be written to `backend/.env`.
- `backend/.env` must not be committed.
- Key values must not be printed in conversation, summaries, commits, or diagnostic output.
- Provider checks should report only status, provider, model, duration, and redacted error class.

Model handling:

- Gemini candidates: `gemini-3-flash-preview` as the quality baseline, and `gemini-3.1-flash-lite-preview` as the lower-cost, lower-latency candidate.
- DeepSeek candidates: `deepseek-v4-pro` as the quality baseline, and `deepseek-v4-flash` as the lower-cost, lower-latency candidate.
- Detailed A/B model quality comparison is not required for this stabilization pass.

Blocking AutoDM failures:

- P0 if enabling AutoDM blocks start, night, vote, execution, or resolution.
- P1 if calls work intermittently but parsing, timeout, or configuration failures are frequent enough to damage the main flow.
- P2 if the issue is only narrative quality, latency, or cost without game-flow damage.

## Known Observation Points

These items should be watched during testing, but repaired only according to severity:

- Frontend AI assistant call may target a backend route that is not registered.
- FontAwesome icons such as `spinner` and `moon` may be used without registration.
- Frontend port defaults and documentation may disagree.
- Night timeout fallback appears intentionally disabled, increasing the risk of hard stalls.
- Some files already exceed project redline limits.
- Existing plan-sync hook paths may not match current Codex plan rules.
- Dependency audit output includes significant vulnerabilities, but may not block local testing.

## Future Feature Candidate Pool

Future feature work is recorded only as a candidate pool. It starts after stabilization proves no unresolved P0 or P1 remains in the existing flow.

Potential areas:

- Hosting experience: AI pacing, night/day narration, exception explanations, host intervention, style templates, and event recap.
- Player experience: clearer action panel, night prompts, private and evil chat polish, voting feedback, death and spectator states, and mobile ergonomics.
- Rules and teaching: role explanations, phase-specific guidance, invalid-action explanations, rules Q&A, first-game tutorial, and information-leak warnings.
- Replay and records: timeline replay, night action log, vote log, AI summary, deduction replay, and exportable reports.
- Content expansion: more roles, script management, custom scripts, balance suggestions, role-pack import, and localization polish.
- Room operations: host console, seat changes, substitute players, kick, disconnect takeover, share links, spectator mode, permissions, and identity management.

Early candidate priorities after stabilization:

1. Host console.
2. Player action panel clarity.
3. Replay timeline.
4. Rules explanation.
5. AI host personality and model routing.

These candidates do not affect the first stabilization pass.

## Handoff To Planning

After this design is reviewed and approved, the next step is an implementation plan for the stabilization pass. That plan should define concrete manual test sessions, evidence capture format, P0/P1 repair loops, and exact stopping criteria.
