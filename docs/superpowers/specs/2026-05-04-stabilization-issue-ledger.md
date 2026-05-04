# Stabilization Issue Ledger

Date: 2026-05-04
Plan: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`
Design: `docs/superpowers/specs/2026-05-04-stabilization-manual-qa-design.md`
Starting commit: `2b7a8f1 docs: tighten stabilization QA criteria`
Raw evidence directory: `/tmp/botc-stabilization-evidence/`
Task register: `docs/superpowers/specs/2026-05-04-stabilization-task-register.md`

## Validity Reset

User decision on 2026-05-04: any browser/manual functional observation performed before real API key/provider configuration is not accepted as valid stabilization evidence. Pre-key observations are preserved only as preliminary notes. They must be rerun after provider availability is established without leaking secrets.

Current consequence:

- Layer 1 and Layer 2 browser observations below are marked unprocessed for stabilization-gate purposes.
- STAB-001 and STAB-002 are candidate issues only until reproduced after the provider gate.
- Any uncommitted repair attempt based on those pre-key observations is not accepted as fixed until the issue is revalidated and regression-tested under the corrected gate.

## Brainstorm Decision Register

These decisions came from the brainstorming thread and are part of the stabilization scope:

| Area | Decision | Status |
| --- | --- | --- |
| Primary scope | Stabilize existing current functionality before future features. | Active |
| Release target | Small external alpha readiness, not public production launch. | Active |
| "No big problem" bar | Close-to-release-grade: core flow, identity isolation, refresh/reconnect, responsive viewport, AutoDM chain. | Active |
| Device/browser coverage | Desktop multi-player browser control plus desktop mobile responsive viewport; real phone deferred. | Active |
| Real API calls | Required before accepted manual gameplay QA; no raw secrets in docs/log summaries/commits. | Active |
| Key handling | Use `backend/.env` when keys are supplied; do not commit `.env`. | Active |
| Provider focus | Gemini plus DeepSeek. | Active |
| Model baselines | Gemini `gemini-3-flash-preview`; DeepSeek `deepseek-v4-pro`. | Active |
| Cost/latency candidates | Gemini `gemini-3.1-flash-lite-preview`; DeepSeek `deepseek-v4-flash`. | Deferred A/B |
| Model quality A/B | Record later; not a blocker for the first stabilization pass. | Backlog |
| Five/seven player scale | Five-player quick closure and seven-player representative release-grade flow. | Active after provider gate |
| Future features | Keep candidate pool only; no implementation in this pass. | Backlog |
| Old session failure | Codex remote context compaction failed; not a project defect. | Recorded |

## Static Preflight Work Register

These items do not require accepted browser gameplay to investigate. They should be reviewed before or alongside provider setup.

| ID | Area | Finding / Work | Current Classification | Required Next Action |
| --- | --- | --- | --- | --- |
| STATIC-001 | API route alignment | Frontend calls `/v1/rooms/{room_id}/assistant`; backend does not register that route. | Candidate P1 | Record only for now. Do not implement backend assistant endpoint in this stabilization pass without scope approval. |
| STATIC-002 | Icon registration | `spinner` and `moon` are used by FontAwesome components and were not registered in `frontend/src/main.js`. | Candidate P2 | Low-risk static fix selected; verify with `npm run lint-ci` and `npm run build`; provider-gated browser reproduction still required before accepted issue closure. |
| STATIC-003 | Port/API configuration | README and `.env.local` use frontend `8081` and backend `8080`; `vue.config.js` defaulted to `8092`; `ApiService` fallback defaulted to `8888`. | Candidate P2 | Low-risk config fix selected; align defaults to `8081` and `8080`; verify with frontend lint/build. |
| STATIC-004 | Night flow robustness | Night timeout fallback is explicitly disabled, so missed player/bot action can hard-stall the game. | Candidate P0/P1 | Record only. Accepted severity and gameplay repair require provider-gated reproduction. |
| STATIC-005 | Event sourcing/replay | Existing `/events` and `/replay` endpoints should be used for evidence and consistency checks. | Process requirement | Keep in repair rules and use for future accepted issues after provider gate. |
| STATIC-006 | Large file redlines | `engine.go`, `autodm.go`, `night.go`, `ws_game_events.js`, and `VoteOverlay.vue` exceed redline limits. | Backlog / constraint | Do not add unrelated logic; split only when required by accepted P0/P1. |
| STATIC-007 | Plan hooks | Untracked `.Codex/hooks` and `.codex/hooks` scripts point at `.claude/plans`, conflicting with AGENTS `.Codex/plans` rules. | Candidate P2/Backlog | Record only. Do not modify untracked hook files in this pass. |
| STATIC-008 | Dependency audit | `npm audit --omit=dev` previously reported many vulnerabilities; `@vue/cli-service` in dependencies may inflate production audit surface. | Candidate P2/Backlog | Record; do not broad-upgrade unless startup/build/manual pass is blocked. |
| STATIC-009 | Test coverage | Backend tests are limited; frontend has lint but no test suite. | Backlog / process risk | Use focused tests where possible and rely on accepted manual QA for playable confidence. |
| STATIC-010 | Local Go availability | Host `go` is unavailable, but Docker image `golang:1.25.5-alpine` exists and can run focused backend tests. | Process risk | Use Docker Go for backend unit verification until host Go is installed. |
| STATIC-011 | Node version | Node v25.8.1 is aggressive for Vue 2 / Vue CLI 5 and may cause compatibility noise; current lint/build completed with known warnings only. | Candidate P2 | Record warnings; do not downgrade Node in this pass. |
| STATIC-012 | API keys | `backend/.env` is missing, so provider gate is blocked before accepted browser/manual gameplay QA. | Provider gate blocker | User must supply/place key before accepted manual gameplay QA. |
| STATIC-013 | Provider docs/model facts | Gemini API free tier and DeepSeek V4 availability were checked against official docs during brainstorming. | Reference | Re-check official docs if model names or pricing become central to a later A/B decision. |
| STATIC-014 | Candidate defense fix | A candidate patch exists for `State.Copy()` not preserving defense progress flags, but it came from pre-key observation. | Static candidate fix only | Focused unit verification succeeded in Docker Go; may be committed as a static candidate fix, but STAB-002 remains unprocessed until provider-gated reproduction and manual regression. |

## Task 2A Static Preflight Results

These checks were performed without browser gameplay and without printing secrets.

| Step | Area | Result | Evidence |
| --- | --- | --- | --- |
| 3 | Route/API alignment | Frontend root store calls `apiService.askAssistant`; `ApiService.js` posts to `/v1/rooms/{room_id}/assistant`; backend `/v1/rooms` routes register create/join/events/state/replay/bots only. Classification remains candidate P1 because it is user-visible but not part of the current accepted manual evidence. | `/tmp/botc-stabilization-evidence/task2a-route-api.txt` |
| 4 | FontAwesome | `LobbyScreen.vue` uses `spinner`; `NightInfoLog.vue` uses `moon`; `frontend/src/main.js` did not register `Spinner` or `Moon`. Low-risk static fix selected. | `/tmp/botc-stabilization-evidence/task2a-fontawesome.txt` |
| 5 | Port/API fallback | README documents frontend `8081` and backend `8080`; `.env.local` points at backend `8080`; `vue.config.js` defaulted to `8092`; `ApiService.js` fallback defaulted to `8888`. Low-risk config fix selected. | `/tmp/botc-stabilization-evidence/task2a-port-api.txt` |
| 6 | Night/defense/vote | Night timeout command is explicitly disabled; room timer schedules day/nomination/defense/vote timeouts only. Defense progress candidate patch is present and verified only by unit test. No gameplay issue is accepted before provider gate. | `/tmp/botc-stabilization-evidence/task2a-night-defense-vote.txt` |
| 7 | Plan hooks | Untracked hook files under `.Codex/hooks` and `.codex/hooks` refer to `.claude/plans`; AGENTS requires project `.Codex/plans`. Record as candidate P2/backlog because hooks are untracked and not blocking this plan. | `/tmp/botc-stabilization-evidence/task2a-plan-hooks.txt` |
| 8 | Provider config | Gemini variables exist; default Gemini model is `gemini-3-flash-preview`; DeepSeek provider is supported through `AUTODM_LLM_PROVIDER=deepseek`, `AUTODM_LLM_API_KEY`, `AUTODM_LLM_BASE_URL`, and `AUTODM_LLM_MODEL`; current DeepSeek code default differs from the selected `deepseek-v4-pro` baseline and must be set explicitly for provider gate. | `/tmp/botc-stabilization-evidence/task2a-provider-config.txt` |
| 9 | Redline/runtime | Hotspot line counts: `engine.go` 1113, `autodm.go` 1084, `night.go` 969, `ws_game_events.js` 545, `VoteOverlay.vue` 503. Host `go` is unavailable. Node `v25.8.1`; npm `11.11.0`. | `/tmp/botc-stabilization-evidence/task2a-redline-wc.txt` |

## Provider Gate Status

- Status: blocked-missing-key
- Checked file: `backend/.env`
- Result: `backend/.env=missing`
- Variables printed: none
- Provider health: not run because no key/provider configuration is available
- Manual gameplay QA: not started
- Next action: user must place real Gemini and/or DeepSeek credentials in `backend/.env`, then rerun the redacted variable-name check and `/v1/llm/health` minimal provider probe before any browser/manual gameplay observation can count as accepted stabilization evidence.

## Documentation Coverage Review

The current design, plan, ledger, and task register cover the required brainstorm and stabilization topics:

| Topic | Coverage location |
| --- | --- |
| Interrupted old session was Codex remote context compaction failure, not a project crash. | Design "Context From The Interrupted Session"; Brainstorm Decision Register |
| Release target is small external alpha, not production release. | Design "Release Target"; task register B-014/D-008 |
| Provider gate blocks accepted browser/manual evidence until real provider is configured and minimally verified. | Design "Provider gate"; plan "Validity Reset"; ledger "Provider Gate Status" |
| Scope is stabilizing current behavior first, no new feature work. | Design "Scope"; task register B-009 |
| Future features are candidate pool only. | Design "Future Feature Candidate Pool"; task register section D |
| Device coverage is desktop multi-player plus desktop mobile viewport; true phone is deferred. | Design "Brainstorm Decisions"; task register B-005/B-018/C-005 |
| AutoDM is included and real API is required. | Design "AutoDM And Provider Handling"; task register C-006 |
| Keys belong in local `backend/.env`, never committed or leaked. | Design "AutoDM And Provider Handling"; task register B-019/C-001 |
| Provider focus is Gemini plus DeepSeek. | Design and ledger brainstorm registers |
| Gemini baseline `gemini-3-flash-preview`; Gemini cost/latency candidate `gemini-3.1-flash-lite-preview`. | Design model handling; task register A-015/D-007 |
| DeepSeek baseline `deepseek-v4-pro`; DeepSeek cost/latency candidate `deepseek-v4-flash`. | Design model handling; task register A-015/D-007 |
| Five-player quick closure and seven-player representative flow. | Design Layer 2/3; task register C-004/C-005 |
| AI assistant route risk. | STATIC-001; task register A-005 |
| FontAwesome `spinner`/`moon` risk. | STATIC-002; STAB-001; task register A-006/A-007 |
| 8081/8092/8888/8080 config mismatch risk. | STATIC-003; task register A-008/A-009 |
| Night timeout fallback disabled risk. | STATIC-004; task register A-010 |
| `/events` and `/replay` evidence mechanism. | STATIC-005; design "Repair Rules"; task register C-009 |
| Large-file redlines. | STATIC-006; task register A-016/B-010 |
| Codex/AGENTS plan hook path drift. | STATIC-007; task register A-012 |
| npm audit risk. | STATIC-008; task register B-015/D-008 |
| Local/container Go availability risk. | STATIC-010; task register A-016 |
| Node v25 Vue 2 / Vue CLI 5 compatibility noise. | STATIC-011; task register A-016 |
| Missing key blocks provider gate. | STATIC-012; Provider Gate Status; task register A-014/C-001 |
| `State.Copy()` defense progress candidate patch status. | STATIC-014; STAB-002; task register A-011/C-008 |
| STAB-001/STAB-002 remain candidate/unprocessed, not formal accepted issue severities. | Validity Reset; Issues section; task register C-007/C-008 |
| Task 3/4/5/7 manual QA and manual-driven repairs remain unprocessed. | Plan status line; task register sections B/C |
| Plan status stops at Task 2A / provider gate, not Layer 1/2/7. | Plan final status line |

## Static Fix Verification Records

### STATIC-002 / STAB-001 - FontAwesome icon registration

- Scope: register only the missing `Spinner` and `Moon` icons in `frontend/src/main.js`.
- Verification:
  - `cd frontend && npm run lint-ci` exited 0 with no lint errors.
  - `cd frontend && npm run build` exited 0; build retained existing Browserslist, console-warning, and bundle-size warnings.
- Fix commit: pending separate static-fix commit.
- Accepted manual status: still unprocessed until provider-gated browser reproduction.

### STATIC-003 - Frontend port and API fallback alignment

- Scope: align `frontend/vue.config.js` default dev-server port to `8081`; align `frontend/src/services/ApiService.js` fallback API base to `http://localhost:8080`.
- Verification:
  - `cd frontend && npm run lint-ci` exited 0 with no lint errors.
  - `cd frontend && npm run build` exited 0; build retained existing Browserslist, console-warning, and bundle-size warnings.
- Fix commit: pending separate static-fix commit.
- Accepted manual status: static config fix only; no browser/manual evidence was collected.

### STATIC-014 / STAB-002 - Defense progress copy candidate

- Scope: preserve `NominatorEnded` and `NomineeEnded` in `State.Copy()` and cover the copy behavior with `TestStateCopyPreservesDefenseProgress`.
- Verification: `docker run --rm -v "$PWD/backend":/app -w /app golang:1.25.5-alpine go test ./internal/engine` exited 0.
- Fix commit: pending separate static-candidate-fix commit.
- Accepted manual status: STAB-002 remains candidate/unprocessed until provider-gated reproduction and required manual regression.

### STATIC-012 / Provider guidance - `.env.example`

- Scope: clarify Gemini baseline/cost-candidate comments and add commented DeepSeek provider-gate example variables to `backend/.env.example`.
- Verification: static `rg` provider-config check reran after the edit; no real `.env` or key value was read or printed.
- Fix commit: this commit (`docs: clarify provider env example`).
- Accepted provider status: still blocked-missing-key because `backend/.env` is missing.

## Future Feature Candidate Pool

Future features are recorded only so the idea is not lost; they are not part of the first stabilization pass.

- Hosting experience: AI pacing, night/day narration, exception explanations, host intervention, host style templates, event recap.
- Player experience: clearer action panel, night prompts, private/evil chat polish, voting feedback, death/spectator states, mobile ergonomics.
- Rules and teaching: role explanations, phase-specific guidance, invalid-action explanations, rules Q&A, tutorial, information-leak warnings.
- Replay and records: timeline replay, night action log, vote log, AI summary, deduction replay, exportable reports.
- Content expansion: more roles, script management, custom scripts, balance suggestions, imports, localization polish.
- Room operations: host console, seat changes, substitute players, kick, disconnect takeover, share links, spectator mode, permissions, identity management.

Deferred early candidates after stabilization: host console, player action panel clarity, replay timeline, rules explanation, AI host personality/model routing.

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

## Layer 1 Result

- Status: unprocessed; previous pre-key browser observation is not accepted as valid stabilization evidence
- Browser: Codex in-app browser using Browser Use `iab` backend; exact browser version not exposed by available browser API.
- Frontend URL: `http://localhost:8081/`
- Backend health: `ok` from `http://localhost:8080/health`
- WebSocket: UI displayed `已连接` after room creation.
- First interaction: clicked `创建房间`, created room `ec37209f`, and reached lobby where a room can be configured.
- Console errors: none recorded through initial load and first interaction.
- Console warnings: none recorded through initial load and first interaction.
- Evidence paths:
  - `/tmp/botc-stabilization-evidence/layer1-initial-load.png`
  - `/tmp/botc-stabilization-evidence/layer1-after-create-click.png`
  - `/tmp/botc-stabilization-evidence/layer1-after-create-settled.png`
- Issues opened: none accepted. This observation must be rerun after provider availability is established.

## Issues

### STAB-001 - Candidate FontAwesome spinner icon is not registered

- Severity: candidate P2
- Status: unprocessed; pending valid reproduction after real provider gate
- Current commit: `9b45292 docs: record layer 1 stabilization smoke`
- Date/time and timezone: 2026-05-04 15:37:46 CST
- Browser and version: Playwright Chromium, `Chrome/147.0.0.0`
- Backend runtime: `botc_backend_eval` container on `http://localhost:8080`, frontend dev server on `http://localhost:8081`
- Room ID: `0dd274a4-56c8-41e1-acae-34be10ad161d`
- Player IDs / seats / viewer role: five browser-controlled players seated 1-5; observed from seat 1 room owner view.
- Phase and latest event seq: first night, latest observed event seq 20.
- Reproduction steps: create a five-player room through browser UI, join four additional browser sessions through UI, then click `开始游戏` from the room owner view.
- Expected result: game starts without error-level browser console entries.
- Actual result: browser console logged `Could not find one or more icon(s) {prefix: fas, iconName: spinner}` when the start-game button entered the loading state.
- Screenshot or recording path: `/tmp/botc-stabilization-evidence/layer2-start-first-night-spinner-error.png`
- Browser console errors: one FontAwesome missing icon error for `spinner`.
- Network or WebSocket observation: WebSocket remained connected and the game entered first night.
- Backend log time window: 2026-05-04 15:37 CST; backend composed roles and emitted first night events without crash.
- Event evidence: latest event sequence was monotonic through seq 20; no event-store impact observed.
- Initial suspected layer: frontend icon registration in FontAwesome setup.
- Fix commit:
- Regression evidence: not run; pre-key observation is not accepted as valid stabilization evidence.
- Validity note: preserve as a static/preliminary candidate only. Reproduce after provider gate before treating as accepted P2 or fixing under this pass.

### STAB-002 - Candidate defense phase hard-stall after both sides end defense

- Severity: candidate P0
- Status: unprocessed; pending valid reproduction after real provider gate
- Current commit: `9b45292 docs: record layer 1 stabilization smoke`
- Date/time and timezone: 2026-05-04 15:45:08 CST
- Browser and version: Playwright Chromium, `Chrome/147.0.0.0`
- Backend runtime: `botc_backend_eval` container on `http://localhost:8080`, frontend dev server on `http://localhost:8081`
- Room ID: `0dd274a4-56c8-41e1-acae-34be10ad161d`
- Player IDs / seats / viewer role: five browser-controlled players seated 1-5; seat 4 nominated seat 2; observed from seat 4 and seat 2 views.
- Phase and latest event seq: day nomination defense subphase, latest observed event seq 31.
- Reproduction steps:
  1. Create a room through browser UI as seat 1.
  2. Join four additional browser sessions through UI so seats 1-5 are occupied.
  3. Start game from the room owner browser view.
  4. Confirm all visible first-night role/team/info prompts until the game reaches day.
  5. Send one public chat message.
  6. From seat 4, click seat 2 and click `提名此玩家`.
  7. From seat 4, click `结束辩护`.
  8. From seat 2, click `结束辩护`.
  9. Wait more than 60 seconds after both visible required defense actions are submitted.
- Expected result: after both nominator and nominee end defense, backend emits `defense.ended`, voting begins, and UI shows sequential vote controls.
- Actual result: backend emitted `defense.progress` for both participants but never emitted `defense.ended`; UI remained at `辩护进行中...` with no voting controls.
- Screenshot or recording path: `/tmp/botc-stabilization-evidence/stab-002-defense-hard-stall.png`
- Browser console errors: recurring FontAwesome `spinner` icon error already tracked as STAB-001; no additional defense-specific browser error observed.
- Network or WebSocket observation: WebSocket stayed connected; expected `defense.ended` / vote transition event did not arrive.
- Backend log time window: 2026-05-04 15:42-15:45 CST; no backend crash or error log observed in the sampled window.
- Event evidence: event seq 28 `nomination.created`, seq 30 `defense.progress` for nominator, seq 31 `defense.progress` for nominee; no `defense.ended`, vote event, or later timer event appeared after the hard-stall threshold.
- Initial suspected layer: backend command handling or RoomActor state application for `defense.progress` before the second `end_defense` command.
- Root cause evidence: `RoomActor.GetState()` returns `engine.State.Copy()`, and `State.Copy()` deep-copied `Nomination` without `NominatorEnded` / `NomineeEnded`, so the second `end_defense` command did not see the first `defense.progress` flag.
- Files to inspect:
  - `backend/internal/engine/state.go`
  - `backend/internal/engine/engine_defense_test.go`
  - `backend/internal/room/room.go`
- Files likely to modify:
  - `backend/internal/engine/state.go`
  - `backend/internal/engine/engine_defense_test.go`
- Regression required: focused engine test for copied defense progress, then rerun failing manual defense path plus Layer 1 smoke; because engine code is touched, repeat full Layer 2 five-player closure.
- Focused verification: `go test ./internal/engine`, using the local Docker Go image if host Go remains unavailable.
- Fix commit:
- Regression evidence: not run; pre-key observation is not accepted as valid stabilization evidence.
- Validity note: root-cause evidence may guide later investigation, but the issue and any uncommitted fix attempt are not accepted until reproduced and regressed after provider availability is established.
