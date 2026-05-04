# Stabilization Manual QA Design

Date: 2026-05-04
Repository: `/Users/abble/Blood-on-the-Clocktower-auto-dm`

## Purpose

This design defines the first stabilization pass for the Blood on the Clocktower Auto-DM repository. The goal is to bring the current codebase to a close-to-release-grade, manually verifiable state before deeper product work.

The pass is limited to existing behavior: room creation, joining, seating, game start, night actions, day discussion, nomination, voting, execution, win/loss resolution, refresh and reconnect behavior, same-room identity isolation, different-room isolation, mobile responsive viewport checks, and the basic AutoDM hosting chain.

Future feature work remains a candidate pool only. It must not expand the first stabilization pass.

## Release Target

For this design, close-to-release-grade means small external alpha readiness: the project should be stable enough for the owner to run a local or dev-hosted game with invited friends or testers. It does not mean public production launch, commercial availability, full mobile-device certification, production security review, or long-running hosted operations.

## Timebox And Exit Conditions

The default timebox for one stabilization pass is five focused working days or three substantial manual QA sessions, whichever is reached first. At the cap, the pass must produce a Go/No-Go summary instead of continuing open-ended testing.

Go requires:

- No unresolved P0 issues.
- P1 issues are either fixed or have a documented workaround that preserves the tested game flow.
- P2 and Backlog items are recorded without expanding the pass.

No-Go is required if any P0 remains, or if a P1 has no acceptable workaround for the release target above.

## Operational Definitions

Hard stall:

- A phase is considered hard-stalled when all visible required player or bot actions have been submitted, no further user action is visible or reasonable, and no relevant state transition or event arrives within 60 seconds.
- If AutoDM is involved, a provider request that exceeds the configured timeout plus 15 seconds without a handled error, fallback, or visible continuation is treated as a stall candidate.

Event-sourced consistency failure:

- Event log sequence numbers for a room are missing, duplicated, or non-monotonic.
- Replaying a room to a sequence produces a materially different game state from the live state at the same sequence.
- Projection shows private or role-specific information to the wrong viewer.
- A command partially persists events or state such that manual database repair is needed to continue.

Manual browser testing:

- Manual means the user interface is driven as a real player would drive it: clicking, typing, refreshing, changing browser contexts, and observing UI state.
- The driver may be the user or an agent controlling the user's browser/computer.
- Direct backend scripts may assist diagnostics, event inspection, or replay checks, but they must not replace UI-driven functional conclusions.

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
- Low-risk P2 fixes only when the change is small enough to verify with the failing path plus Layer 1 smoke.

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
2. A five-player game can proceed from room creation to win/loss resolution without backend restart, manual database repair, forced page refresh outside the tested refresh path, or a hard stall as defined above.
3. A seven-player game can cover night, day, nomination, vote, execution, refresh/reconnect, and room isolation flows with no unresolved P0 and no P1 lacking a documented workaround.
4. No observed player identity or private-information leak occurs across tabs, players, or rooms. Any observed private-information leak is a failure for this pass.
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
- Browser console has no `error`-level entries from initial page load through the first successful interaction. Warnings may be accepted only if recorded.

Layer 1 passes when backend health, frontend load, first interaction, and WebSocket connection all succeed. A Layer 1 P0 must be fixed before proceeding.

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

Layer 2 passes after at least one complete five-player run reaches win/loss resolution with no P0 and no P1 lacking a workaround. A P0 found here must be fixed and the full Layer 2 run repeated before moving on. A P1 should normally be fixed before Layer 3 unless the workaround is explicit and does not affect the Layer 3 coverage.

### Layer 3: Seven-Player Release-Grade Flow

Run a fuller flow with multiple browser tabs, windows, or profiles.

Cover:

- Multiple player identities in the same room.
- Evil-team and private-information visibility.
- Different-room isolation.
- Refresh and reconnect from multiple player views.
- At minimum, reconnect coverage includes refreshing an active tab and forcing one WebSocket interruption or browser offline/online cycle if the available browser tools support it.
- Night actions across a larger role set.
- Day discussion and player chat.
- Nomination, defense, vote sequence, and execution.
- Mobile responsive viewport for core actions.

This layer determines whether the current repository is close enough to release-grade stability for existing functionality.

Layer 3 passes after one complete seven-player representative run and the required refresh/reconnect checks finish with no P0 and no P1 lacking a workaround. Seven players are used as a representative release-grade local-alpha scenario because it covers a richer role mix than the five-player smoke run while keeping manual browser control practical. Larger 10+ player games are deferred unless the seven-player run exposes role-density risks that cannot be judged at seven players.

Bot players may be used to fill seats, but key visibility checks, major vote actions, and private-information checks must be observed from real browser-controlled player views. Bot behavior can support coverage; it must not be the only evidence for identity isolation or private information.

Mobile responsive viewport checks cover layout, visible controls, and click targets only. Required viewports are 375x667, 390x844, and 768x1024 unless implementation planning revises them. Required mobile actions are join, seat, view role, respond to a night prompt, chat, nominate, vote, and recover after refresh. This does not validate touch scrolling, virtual keyboard resize, iOS Safari viewport bugs, backgrounding, real network switching, or real-device performance; those remain outside this pass unless the user explicitly adds a phone test.

### Layer 4: AutoDM Real Provider Chain

After credentials are available, verify:

- `backend/.env` can configure the chosen provider and model.
- Secrets are never printed in chat, summary, commits, or logs.
- Provider health or minimal API call succeeds.
- AutoDM can make a real request during the game flow.
- Timeout and provider error behavior does not freeze the room.
- The game can continue after AutoDM receives a valid response or a handled failure.

Before Layer 4 starts, choose and record one primary Gemini model and one primary DeepSeek model for connectivity validation. The current defaults are Gemini `gemini-3-flash-preview` for quality baseline and DeepSeek `deepseek-v4-pro` for quality baseline, with Flash-Lite and V4 Flash retained as cost/latency candidates. The detailed four-model quality comparison is a later task.

For this pass, an observable in-game AutoDM hosting flow means a real provider response is tied to the active room and produces at least one host-facing or player-facing game message, narration, rule explanation, or action recommendation without freezing the room or leaking secrets.

## Issue Severity

P0:

- Cannot start required services.
- Cannot create room, join, seat, or start game.
- Night, vote, execution, or resolution hard-stalls the game.
- Player identity is mixed across tabs or rooms.
- Private information is leaked to the wrong player.
- Event log or projection consistency failure corrupts authoritative game state, leaks private information, or requires manual database repair.
- AutoDM enabled state prevents a required game transition for more than the hard-stall threshold or requires disabling AutoDM, restarting the backend, or editing data to continue.

P1:

- Main flow requires a workaround but can continue without backend restart, data repair, or private-information leak.
- Refresh or reconnect corrupts important state.
- Replay state, live state, and projected state disagree in a recoverable way that does not leak private information.
- WebSocket reconnect behavior is unreliable.
- AutoDM has recurring timeout, parsing, or provider configuration failures.
- AutoDM emits semantically wrong hosting guidance that would lead players to make an illegal or materially wrong game action, even if the program state does not hard-stall.
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
3. Use event-sourced evidence when available: recent room events, `/v1/rooms/{room_id}/replay?to_seq=...`, and viewer-specific projections should be checked before relying only on UI reconstruction.
4. Locate the affected layer: frontend state, WebSocket, backend command handling, event store, projection, bot, AutoDM, provider configuration, or environment.
5. Apply the smallest practical fix.
6. Re-run the manual path that exposed the defect and the regression checks required below.

P0 and P1 issues are in scope for repair. P2 issues may be fixed only when the change is low-risk and can be verified with the failing path plus Layer 1 smoke. Backlog items are recorded but not implemented in this pass.

Large historical files should not receive new unrelated logic. Known hotspots include `backend/internal/engine/engine.go`, `backend/internal/agent/autodm.go`, `backend/internal/game/night.go`, `frontend/src/store/plugins/ws_game_events.js`, and `frontend/src/components/VoteOverlay.vue`. If a P0 or P1 requires touching one of these files, the change should remain narrowly targeted; otherwise new helper code should live in smaller, clearer files that respect existing package boundaries.

Minimum regression rules:

- Every P0 or P1 fix reruns the failing manual path and Layer 1 environment smoke.
- Any fix touching `backend/internal/engine`, `backend/internal/game/night*`, or vote resolution reruns the full Layer 2 five-player closure.
- Any fix touching `backend/internal/projection`, event store behavior, room state loading, or WebSocket state sync reruns the relevant identity-isolation and refresh/reconnect checks.
- Any fix touching AutoDM or provider configuration reruns provider minimal connectivity and one in-game AutoDM trigger.

Implementation work should happen on a `codex/` branch unless the user explicitly asks to repair directly on `main`. Raw secrets and raw logs must not be committed.

## Evidence Format

Each P0/P1/P2 item should use one evidence record. The default issue ledger for this pass is `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`, unless the user selects an external tracker before implementation. The minimum schema is:

- Issue ID and severity.
- Current git commit.
- Date/time and timezone.
- Browser and version.
- Backend container image or command used to start it.
- Room ID.
- Player IDs, seats, and viewer role used for the observation.
- Current phase and latest known event sequence.
- Reproduction steps.
- Expected result.
- Actual result.
- Screenshot or screen recording path when visual evidence matters.
- Browser console errors, copied verbatim and redacted if needed.
- Network or WebSocket observation, including expected event that did not arrive.
- Backend log time window and key log lines, redacted if needed.
- Event evidence: recent room events and replay URL or replay result at the relevant sequence.
- Initial suspected layer.
- Status: open, fixed, workaround, deferred, or blocked.

Raw evidence should default to a local, uncommitted directory such as `/tmp/botc-stabilization-evidence/`. Any committed summary must be redacted and must not include API keys, authorization headers, cookies, or full provider request payloads.

## AutoDM And Provider Handling

AutoDM is included in stabilization, but only the provider call chain is a blocking requirement for this pass.

Credential handling:

- The chosen credentials may be written to `backend/.env`.
- `backend/.env` must not be committed.
- Key values must not be printed in conversation, summaries, commits, or diagnostic output.
- Provider checks should report only status, provider, model, duration, and redacted error class.
- If deeper provider debugging is needed, capture the full context only in a local uncommitted evidence file with authorization headers, API keys, cookies, and request bodies redacted before sharing or committing.

Model handling:

- Gemini candidates: `gemini-3-flash-preview` as the quality baseline, and `gemini-3.1-flash-lite-preview` as the lower-cost, lower-latency candidate.
- DeepSeek candidates: `deepseek-v4-pro` as the quality baseline, and `deepseek-v4-flash` as the lower-cost, lower-latency candidate.
- Detailed A/B model quality comparison is not required for this stabilization pass.

Blocking AutoDM failures:

- P0 if enabling AutoDM blocks start, night, vote, execution, or resolution.
- P1 if calls work intermittently but parsing, timeout, or configuration failures are frequent enough to damage the main flow.
- P1 if AutoDM produces semantically invalid hosting guidance that would mislead players about legal actions, vote results, death state, role information, or phase state while the program keeps running.
- P2 if the issue is only writing style, minor narrative quality, latency, or cost without game-flow damage.

## Known Observation Points

These items should be watched during testing, but repaired only according to severity:

- Potential P1: frontend AI assistant call may target a backend route that is not registered.
- Potential P1/P0 depending on observed behavior: night timeout fallback appears intentionally disabled, increasing the risk of hard stalls.
- Potential P2: FontAwesome icons such as `spinner` and `moon` may be used without registration.
- Potential P2: frontend port defaults and documentation may disagree.
- Potential P2/Backlog: dependency audit output includes significant vulnerabilities, but may not block local testing.
- Backlog unless touched by a required fix: some files already exceed project redline limits.
- Backlog unless it blocks the next plan workflow: existing plan-sync hook paths may not match current Codex plan rules.

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

After this design is reviewed and approved, the next step is an implementation plan for the stabilization pass. That plan should instantiate the issue ledger, define concrete manual test sessions, sequence the P0/P1 repair loops, and apply the timebox and stopping criteria above.
