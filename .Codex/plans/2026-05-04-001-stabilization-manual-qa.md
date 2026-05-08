# Stabilization Manual QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the approved stabilization pass with controlled manual browser QA, evidence capture, P0/P1 repair loops, AutoDM provider validation, and a final Go/No-Go decision.

**Architecture:** This plan treats stabilization as a staged QA-and-repair workflow rather than a preselected feature patch. Manual browser interaction is the source of functional truth; shell commands, database reads, event replay, and logs are diagnostic evidence only. Code changes are made only after a concrete P0/P1/P2 issue is reproduced and recorded.

**Tech Stack:** Vue 2 frontend via `npm run serve`, Go backend in Docker/local dev flow, MySQL event store, Redis, RabbitMQ, Qdrant, WebSocket, REST `/v1/*`, Gemini and DeepSeek provider configuration through `backend/.env`.

---

## Source Design

- Design spec: `docs/superpowers/specs/2026-05-04-stabilization-manual-qa-design.md`
- Issue ledger to create: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Task register to create: `docs/superpowers/specs/2026-05-04-stabilization-task-register.md`
- Go/No-Go report to create: `docs/superpowers/specs/2026-05-04-stabilization-go-no-go.md`
- Local raw evidence directory: `/tmp/botc-stabilization-evidence/`

## Validity Reset And Execution Gate

User decision on 2026-05-04: browser/manual functional observations made before real API key/provider configuration are not accepted as valid stabilization tests. They may remain as preliminary notes, but all Layer 1/2/3/4 manual QA gates are treated as unprocessed until the provider gate is completed.

Execution ordering override:

1. Keep Task 1 and Task 2 as setup/preflight work.
2. Before counting any Task 3, Task 4, or Task 5 manual browser result as valid, complete Task 6 Step 1 through Step 6 for at least one real provider without leaking secrets.
3. Task 6 Step 7, the in-game AutoDM trigger, can run later as part of Layer 4, but provider availability must be established before the next accepted manual game-flow test.
4. Any issue discovered only during pre-key manual browser work is a candidate issue, not an accepted P0/P1/P2, until reproduced after the provider gate.
5. Current provider gate status after non-game checking: Gemini passed with `backend/.env`; DeepSeek returned insufficient balance; in-game AutoDM/RAG validation still needs a runtime with repo-level `docs/rules` mounted.

## File Structure

Planned documentation artifacts:

- Create `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
  - One record per P0/P1/P2 item.
  - Redacted summary only; raw screenshots/logs stay in `/tmp/botc-stabilization-evidence/`.
- Create `docs/superpowers/specs/2026-05-04-stabilization-task-register.md`
  - One total register for allowed tasks, forbidden tasks, provider-gated tasks, and backlog/future features.
- Create `docs/superpowers/specs/2026-05-04-stabilization-go-no-go.md`
  - Final pass summary, unresolved issues, workarounds, and Go/No-Go decision.
- Modify `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`
  - Check off steps as they complete.
  - Update the status line after every completed step.

Possible code files, only if evidence proves a defect:

- Frontend REST/API or missing route issues may touch `frontend/src/services/ApiService.js` and `backend/internal/api/api.go`.
- FontAwesome registration issues may touch `frontend/src/main.js`.
- Night-flow defects may touch files under `backend/internal/engine/` or `backend/internal/game/`, with special care around `backend/internal/engine/engine.go` and `backend/internal/game/night.go`.
- WebSocket/state sync defects may touch `frontend/src/store/plugins/websocket.js`, `frontend/src/store/plugins/ws_game_events.js`, `frontend/src/store/plugins/ws_state_sync.js`, or `backend/internal/realtime/`.
- Projection/privacy defects may touch `backend/internal/projection/`.
- AutoDM/provider defects may touch `backend/internal/config/config.go`, `backend/internal/agent/`, or `backend/internal/agent/llm/`.

No code file should be changed before there is an issue-ledger record with reproduction evidence.

Static/preflight documentation and low-risk fixes are allowed before browser gameplay. Gameplay-flow fixes remain gated by accepted reproduction evidence after provider availability.

## Task 1: Create Stabilization Branch And Evidence Ledger

**Files:**
- Create: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [x] **Step 1: Confirm starting state**

Run:

```bash
git status --short
git log -1 --oneline
```

Expected:

- `AGENTS.md` is now tracked; local `.codex/hooks*` artifacts are ignored and should not appear in normal `git status`.
- No unexpected tracked changes are present.
- Record the commit hash in the issue ledger header.

- [x] **Step 2: Create implementation branch**

Run:

```bash
git switch -c codex/stabilization-manual-qa
```

Expected:

- Current branch is `codex/stabilization-manual-qa`.
- If the branch already exists, run `git switch codex/stabilization-manual-qa` and record that in the ledger.

- [x] **Step 3: Create raw evidence directory**

Run:

```bash
mkdir -p /tmp/botc-stabilization-evidence
```

Expected:

- Directory exists and is outside git.

- [x] **Step 4: Create issue ledger**

Create `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md` with this exact structure:

```markdown
# Stabilization Issue Ledger

Date: 2026-05-04
Plan: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`
Design: `docs/superpowers/specs/2026-05-04-stabilization-manual-qa-design.md`
Starting commit: record the exact `git log -1 --oneline` output from Task 1 Step 1.
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

## Issues

No issues recorded yet.
```

- [x] **Step 5: Commit ledger setup**

Run:

```bash
git add docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: add stabilization QA execution plan"
```

Expected:

- Commit includes only the plan and issue ledger.

## Task 2: Restore And Record Local Test Environment

**Files:**
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [x] **Step 1: Record service state**

Run:

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | sort
curl -fsS http://localhost:8080/health
lsof -nP -iTCP:8081 -sTCP:LISTEN || true
lsof -nP -iTCP:8092 -sTCP:LISTEN || true
```

Expected:

- Backend health returns `ok`.
- If backend is down, record the failure as STAB-001 and restart dependencies before continuing.
- Frontend may be down at this point.

- [x] **Step 2: Start dependencies if needed**

If required services are missing, run:

```bash
cd /Users/abble/Blood-on-the-Clocktower-auto-dm/backend
make docker-up
```

Expected:

- MySQL, Redis, RabbitMQ, Qdrant, Prometheus, Grafana, and backend dependencies are available.
- Do not destroy existing volumes unless the user explicitly approves a reset.

- [x] **Step 3: Start frontend on port 8081**

Run in a long-lived terminal:

```bash
cd /Users/abble/Blood-on-the-Clocktower-auto-dm/frontend
npm run serve -- --port 8081
```

Expected:

- Frontend serves at `http://localhost:8081/`.
- If 8081 is occupied, record the process using the port and decide whether to reuse it or switch ports before browser testing.

- [x] **Step 4: Record version facts**

Run:

```bash
node --version
npm --version
docker --version
docker exec botc_backend_eval sh -lc 'go version' 2>/dev/null || true
```

Expected:

- Version output is copied into the ledger header or environment section.

- [x] **Step 5: Commit environment notes**

Run:

```bash
git add docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: record stabilization environment"
```

Expected:

- Commit contains only documentation and plan status updates.

## Task 2A: Brainstorm Coverage Review And Static Preflight

**Files:**
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-manual-qa-design.md`
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Create/modify: `docs/superpowers/specs/2026-05-04-stabilization-task-register.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`
- Optional low-risk static fixes only after ledger entry exists.

- [x] **Step 1: Record user validity correction**

Record that pre-key browser/manual observations are not accepted as stabilization evidence.

Expected:

- Design, plan, and ledger all state that provider availability must be established before accepted manual gameplay QA.
- Any previous pre-key observations are candidate notes only.

- [x] **Step 2: Record brainstorm decisions and static work register**

Record in the design and ledger:

```text
scope choice, release target, device coverage, AutoDM inclusion, real API policy, model/provider choices, key handling, known static risks, and future-feature boundary.
```

Expected:

- A new session can recover the full brainstorm outcome without relying on screenshots or prior chat context.

- [x] **Step 3: Static-check route and frontend API alignment**

Inspect without browser gameplay:

```bash
rg -n "assistant|/v1/rooms|askAssistant|Route\\(" frontend/src backend/internal/api
```

Expected:

- Confirm whether frontend calls `/v1/rooms/{room_id}/assistant` and whether backend registers it.
- Open or update a Candidate/P1 ledger item. Do not implement a backend feature unless the user approves that behavior as needed.

- [x] **Step 4: Static-check FontAwesome registrations**

Inspect without browser gameplay:

```bash
rg -n "fa-|icon=|spinner|moon|library.add|faSpinner|faMoon" frontend/src
```

Expected:

- Confirm whether `spinner` and `moon` are used but not registered.
- If confirmed, this is a low-risk static P2 candidate and may be fixed with `frontend/src/main.js` plus frontend lint/build verification.

- [x] **Step 5: Static-check port and API fallback consistency**

Inspect:

```bash
rg -n "8081|8092|8888|8080|VUE_APP|API_BASE|devServer|localhost" README.md frontend/vue.config.js frontend/src/services frontend/.env* backend/.env.example
```

Expected:

- Record whether README, Vue config, API fallback, and env files agree.
- Decide whether this is a docs/config fix or deferred P2.

- [x] **Step 6: Static-check night/defense/vote risk areas**

Inspect:

```bash
rg -n "timeout|defense|nomination|vote|NominatorEnded|NomineeEnded|Copy\\(|night.action|phase.day" backend/internal/engine backend/internal/game backend/internal/room
```

Expected:

- Record static risks and any candidate fixes.
- Do not accept or commit gameplay-flow fixes until the issue is reproduced after the provider gate, unless the user explicitly approves a purely static bugfix.

- [x] **Step 7: Static-check Codex plan hook alignment**

Inspect:

```bash
rg -n "claude|Codex|\\.Codex|\\.codex|plans|sync-plan" AGENTS.md .Codex .codex 2>/dev/null || true
```

Expected:

- Record whether plan hooks use paths inconsistent with AGENTS rules.
- Fix only if it blocks plan execution or the user approves hook cleanup.

- [x] **Step 8: Static-check provider config and model defaults**

Inspect:

```bash
rg -n "GEMINI_API_KEY|AUTODM_LLM|DEEPSEEK|deepseek|gemini|BaseURL|Model" backend/.env.example backend/internal/config backend/internal/agent backend/cmd
```

Expected:

- Record current variable names, base URLs, defaults, and any mismatch with chosen provider gate.
- Do not search for or print real keys.

- [x] **Step 9: Static-check redline files and verification constraints**

Run:

```bash
wc -l backend/internal/engine/engine.go backend/internal/agent/autodm.go backend/internal/game/night.go frontend/src/store/plugins/ws_game_events.js frontend/src/components/VoteOverlay.vue 2>/dev/null || true
which go || true
node --version
npm --version
```

Expected:

- Record redline/hotspot boundaries and test runtime constraints.
- Do not refactor large files as part of preflight.

- [x] **Step 10: Commit preflight documentation or low-risk static fixes**

Run:

```bash
git status --short
git add docs/superpowers/specs/2026-05-04-stabilization-manual-qa-design.md docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: record stabilization preflight coverage"
```

Expected:

- Commit documentation first.
- If low-risk static fixes are also made, use separate fix commits with exact file adds, never `git add .`.

## Task 3: Execute Layer 1 Environment Browser Smoke

**Files:**
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [ ] **Step 1: Open frontend in browser**

Use browser or computer control to open:

```text
http://localhost:8081/
```

Expected:

- App loads without an error-level browser console entry from initial load through first interaction.
- Record browser name/version and screenshot path in `/tmp/botc-stabilization-evidence/`.

- [ ] **Step 2: Complete first interaction**

Interact with the first screen as a real user:

```text
Open app -> create or quick-login as a test user -> reach a state where a room can be created.
```

Expected:

- WebSocket connection establishes.
- No fatal UI overlay blocks the app.

- [ ] **Step 3: Record Layer 1 result**

Append to the ledger:

```markdown
## Layer 1 Result

- Status: pass/fail
- Browser:
- Frontend URL:
- Backend health:
- WebSocket:
- Console errors:
- Evidence paths:
- Issues opened:
```

- [ ] **Step 4: Gate on Layer 1**

If Layer 1 fails with P0:

```text
Stop Layer 2. Open a STAB issue, repair it, and rerun Layer 1.
```

If Layer 1 passes:

```text
Proceed to Layer 2.
```

- [ ] **Step 5: Commit Layer 1 evidence summary**

Run:

```bash
git add docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: record layer 1 stabilization smoke"
```

Expected:

- Raw screenshots/logs remain in `/tmp/botc-stabilization-evidence/`.

## Task 4: Execute Layer 2 Five-Player Quick Closure

**Files:**
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [ ] **Step 1: Prepare five-player room**

Using real browser interaction:

```text
Create room -> join as primary player -> add four bots or browser-controlled seats -> seat all players -> start game.
```

Expected:

- Room ID is visible or recoverable from URL/state and recorded.
- Player names/seats are recorded.

- [ ] **Step 2: Run first night**

Continue through:

```text
Start game -> complete visible first-night prompts -> wait for day transition.
```

Expected:

- Day phase begins within the hard-stall threshold after all visible required actions are submitted.
- If stuck, open P0 or P1 depending on whether continuation is possible without backend restart/data repair.

- [ ] **Step 3: Run day, nomination, vote, and execution**

Continue through:

```text
Day chat/discussion -> nominate a player -> complete defense/vote sequence -> resolve execution.
```

Expected:

- Vote sequence and execution resolve through UI-visible events.
- No player identity or private information leak is observed.

- [ ] **Step 4: Continue to win/loss or clear blocker**

Continue:

```text
Repeat night/day/vote flow until win/loss resolution or a recorded blocking defect.
```

Expected:

- A completed five-player run reaches end state.

- [ ] **Step 5: Capture event evidence**

For the tested room, run:

```bash
test -n "$ROOM_ID"
docker exec botc_mysql mysql -uroot -ppassword -D agentdm -e \
"SELECT seq,event_type,actor_user_id,LEFT(payload_json,300) AS payload,server_ts FROM events WHERE room_id='${ROOM_ID}' ORDER BY seq DESC LIMIT 30;"
```

Expected:

- Before running, set `ROOM_ID` in the shell to the exact room ID copied from the browser URL or app state.
- Recent events are copied into a redacted ledger summary or raw evidence file.
- Do not commit raw payloads if they contain secrets or tokens.

- [ ] **Step 6: Record Layer 2 result**

Append to the ledger:

```markdown
## Layer 2 Result

- Status: pass/fail
- Room ID:
- Player/seats:
- End phase:
- Latest event seq:
- Hard stalls observed:
- Identity/privacy observations:
- Issues opened:
- Evidence paths:
```

- [ ] **Step 7: Gate on Layer 2**

If any P0 is found:

```text
Stop Layer 3. Enter Task 7 repair loop. After repair, repeat all of Task 4.
```

If a P1 is found:

```text
Fix before Layer 3 unless the workaround is explicit and does not affect Layer 3 coverage.
```

- [ ] **Step 8: Commit Layer 2 evidence summary**

Run:

```bash
git add docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: record layer 2 five-player QA"
```

Expected:

- Commit contains documentation only unless Task 7 repairs were already performed and committed separately.

## Task 5: Execute Layer 3 Seven-Player Release-Grade Flow

**Files:**
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [ ] **Step 1: Prepare seven-player room**

Using real browser interaction:

```text
Create fresh room -> create multiple player browser views/tabs/profiles -> add bots only as needed -> seat seven players -> start game.
```

Expected:

- At least two distinct browser-controlled player views are used for visibility checks.
- Seat/player mapping is recorded.

- [ ] **Step 2: Verify identity and private visibility**

From multiple player views, observe:

```text
Own role visibility -> other player role hidden unless allowed -> evil/team/private info visible only to allowed viewers.
```

Expected:

- Any private-information leak opens a P0.
- Any recoverable projection mismatch opens P1.

- [ ] **Step 3: Run seven-player night/day/vote flow**

Continue through:

```text
Night prompts -> day discussion -> nomination -> vote -> execution -> subsequent phase transition.
```

Expected:

- Flow reaches the next meaningful phase without hard stall.
- Player views remain consistent after updates.

- [ ] **Step 4: Test refresh reconnect**

Perform:

```text
Refresh one active player tab -> confirm state recovers -> continue a player action if the phase allows it.
```

Expected:

- Player identity and room state recover.
- No private information leak occurs after refresh.

- [ ] **Step 5: Test WebSocket interruption if supported**

Use browser tools or desktop controls to simulate one interruption:

```text
Temporarily set browser offline or interrupt the WebSocket connection -> restore online -> confirm state catches up.
```

Expected:

- State resyncs without requiring backend restart or database repair.
- If tool support is unavailable, record "not executed - tool unavailable" in the ledger.

- [ ] **Step 6: Test different-room isolation**

Using real browser interaction:

```text
Open or create a second room -> verify player state/events/chat from Room A do not appear in Room B.
```

Expected:

- No cross-room state or private information leak.

- [ ] **Step 7: Test mobile responsive viewports**

Use desktop browser responsive viewport mode for:

```text
375x667
390x844
768x1024
```

For each viewport, verify:

```text
join -> seat -> view role -> respond to visible night prompt -> chat -> nominate -> vote -> refresh recovery.
```

Expected:

- Major actions are visible and clickable.
- Real touch, virtual keyboard, iOS Safari, backgrounding, and real network changes are not covered and must be noted as out of scope.

- [ ] **Step 8: Capture event and replay evidence**

Run:

```bash
test -n "$ROOM_ID"
docker exec botc_mysql mysql -uroot -ppassword -D agentdm -e \
"SELECT seq,event_type,actor_user_id,LEFT(payload_json,300) AS payload,server_ts FROM events WHERE room_id='${ROOM_ID}' ORDER BY seq DESC LIMIT 50;"
```

If authenticated browser access is available, also inspect:

```text
GET /v1/rooms/$ROOM_ID/replay?to_seq=$LATEST_SEQ
```

Expected:

- Before running, set `ROOM_ID` to the exact room ID and `LATEST_SEQ` to the latest sequence observed in the event query or UI state.
- Event order is monotonic.
- Replay/projection does not contradict observed live state.

- [ ] **Step 9: Record Layer 3 result**

Append to the ledger:

```markdown
## Layer 3 Result

- Status: pass/fail
- Room ID:
- Player/seats:
- Browser contexts:
- Refresh/reconnect result:
- Different-room isolation result:
- Mobile viewport results:
- Event/replay result:
- Issues opened:
- Evidence paths:
```

- [ ] **Step 10: Gate on Layer 3**

If any P0 is found:

```text
Enter Task 7 repair loop, rerun affected Layer 3 checks, and rerun Layer 2 if engine/night/vote code is touched.
```

If P1 remains:

```text
Fix or document workaround before Go.
```

- [ ] **Step 11: Commit Layer 3 evidence summary**

Run:

```bash
git add docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: record layer 3 seven-player QA"
```

Expected:

- Commit contains redacted documentation and plan status.

## Task 6: Execute Layer 4 AutoDM Provider Chain

**Files:**
- Modify: `backend/.env` (untracked, never commit)
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [x] **Step 1: Confirm key availability without printing secrets**

Run:

```bash
test -f /Users/abble/Blood-on-the-Clocktower-auto-dm/backend/.env && \
  awk -F= '/^(GEMINI_API_KEY|AUTODM_LLM_API_KEY|AUTODM_LLM_PROVIDER|AUTODM_LLM_MODEL|AUTODM_LLM_BASE_URL)=/ {print $1"=SET"}' \
  /Users/abble/Blood-on-the-Clocktower-auto-dm/backend/.env
```

Expected:

- Output shows variable names only.
- If no key is available, pause Layer 4 and ask the user to provide or place the key in `backend/.env`.
- Current result: `backend/.env` exists with provider variables present; variable-name-only checks were run without printing secret values.

- [x] **Step 2: Choose primary models for this pass**

Record in the ledger:

```text
Primary Gemini model: gemini-3-flash-preview
Primary DeepSeek model: deepseek-v4-pro
Cost/latency candidates deferred: gemini-3.1-flash-lite-preview, deepseek-v4-flash
```

Expected:

- Detailed four-model quality ranking is deferred.
- Current result: primary Gemini model and primary DeepSeek model are recorded in the design, ledger, and task register.

- [x] **Step 3: Configure Gemini path if key is available**

Set `backend/.env` values locally:

```env
AUTODM_ENABLED=true
AUTODM_LLM_MODEL=gemini-3-flash-preview
AUTODM_LLM_TIMEOUT_SEC=60
```

Expected:

- Set `GEMINI_API_KEY` to the user-supplied Gemini key in `backend/.env`; never copy the key into this plan, the ledger, chat, or commits.
- `backend/.env` remains untracked.
- Do not paste key into commits or chat.
- Current result: Gemini was configured as the active backend provider with `gemini-3-flash-preview`; a direct minimal Gemini request returned HTTP 200.

- [ ] **Step 4: Configure DeepSeek path if key is available**

For DeepSeek validation, set `backend/.env` values locally:

```env
AUTODM_ENABLED=true
AUTODM_LLM_PROVIDER=deepseek
AUTODM_LLM_BASE_URL=https://api.deepseek.com/v1
AUTODM_LLM_MODEL=deepseek-v4-pro
AUTODM_LLM_TIMEOUT_SEC=60
```

Expected:

- Set `AUTODM_LLM_API_KEY` to the user-supplied DeepSeek key in `backend/.env`; never copy the key into this plan, the ledger, chat, or commits.
- Only one provider configuration is active at a time.
- The active provider/model is recorded without key values.

- [x] **Step 5: Restart or start backend with env**

Use the project-supported path:

```bash
cd /Users/abble/Blood-on-the-Clocktower-auto-dm/backend
make run-env
```

If backend is currently running in a container, record the active runtime and restart strategy before replacing it.

Expected:

- Backend reports the selected provider/model through health or logs without exposing key material.
- Current result: replaced the existing `botc_backend_eval` Docker container with the same name and port, using `backend/.env` plus host Docker service addresses. Backend `/health` returned ok.

- [x] **Step 6: Provider minimal connectivity**

Run:

```bash
curl -fsS http://localhost:8080/v1/llm/health
```

Expected:

- Response shows provider/model/connectivity status.
- Record provider, model, status, duration, and redacted error class only.
- Current result: `/v1/llm/health` returned provider `gemini`, model `gemini-3-flash-preview`, enabled `true`, status `ok`. DeepSeek direct minimal request returned HTTP 402 with redacted class `Insufficient Balance`; DeepSeek backend-active verification remains unchecked until balance is available.

- [ ] **Step 7: Trigger in-game AutoDM flow**

Using browser interaction:

```text
Create or reuse a test room -> start/continue a flow that emits AutoDM-relevant events -> observe at least one host-facing or player-facing AutoDM output.
```

Expected:

- AutoDM output is tied to the active room.
- Room does not freeze.
- No secrets appear in UI, logs, or committed docs.

- [ ] **Step 8: Classify AutoDM behavior**

Record:

```markdown
## Layer 4 Result

- Status: pass/fail/blocked-missing-key
- Provider:
- Model:
- Minimal connectivity:
- In-game trigger:
- Timeout/error handling:
- Semantic correctness notes:
- Issues opened:
- Evidence paths:
```

Expected:

- Semantic hosting errors that mislead legal actions, vote results, death state, role information, or phase state are P1.

- [ ] **Step 9: Commit Layer 4 evidence summary**

Run:

```bash
git add docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: record AutoDM provider QA"
```

Expected:

- `backend/.env` is not staged.

## Task 7: P0/P1 Repair Loop

**Files:**
- Modify: issue-specific files only after evidence exists.
- Modify: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [ ] **Step 1: Select one issue**

Choose the highest-severity open issue:

```text
P0 before P1. If multiple P0 exist, choose startup/game-flow blockers before UI polish.
```

Expected:

- Exactly one issue is being repaired.

- [ ] **Step 2: Reproduce and freeze evidence**

Before editing, update the issue record with:

```text
reproduction steps, room id, phase, latest event seq, console error, backend log window, recent events, suspected layer.
```

Expected:

- The issue can be understood without replaying the whole conversation.

- [ ] **Step 3: Inspect event/replay evidence**

Run:

```bash
test -n "$ROOM_ID"
docker exec botc_mysql mysql -uroot -ppassword -D agentdm -e \
"SELECT seq,event_type,actor_user_id,LEFT(payload_json,300) AS payload,server_ts FROM events WHERE room_id='${ROOM_ID}' ORDER BY seq DESC LIMIT 50;"
```

Expected:

- Before running, set `ROOM_ID` to the room ID recorded in the selected issue.
- Decide whether the defect is UI projection, WebSocket delivery, command handling, event persistence, bot/AutoDM behavior, or environment.

- [ ] **Step 4: Identify minimal file set**

Record the intended file set in the issue before editing:

```text
Files to inspect:
Files likely to modify:
Regression required:
```

Expected:

- Hotspot files are avoided unless needed.

- [ ] **Step 5: Add or identify a focused verification**

For backend logic defects, prefer:

```bash
cd /Users/abble/Blood-on-the-Clocktower-auto-dm/backend
go test ./internal/engine ./internal/game ./internal/projection ./internal/store
```

For frontend defects, prefer:

```bash
cd /Users/abble/Blood-on-the-Clocktower-auto-dm/frontend
npm run lint-ci
```

Expected:

- If local Go is unavailable, record that backend unit tests must run in the Go container or after Go becomes available.
- Manual browser regression remains required.

- [ ] **Step 6: Apply minimal code fix**

Use `apply_patch` for manual edits. Do not change unrelated files. Do not edit `backend/.env` except for provider configuration.

Expected:

- Patch is limited to the selected issue.

- [ ] **Step 7: Run relevant verification**

Run the focused verification from Step 5 and any package-specific command needed for the changed files.

Expected:

- Verification passes or the failure is recorded with exact output and next action.

- [ ] **Step 8: Run required manual regression**

Use the design regression rules:

```text
Always rerun failing manual path + Layer 1 smoke.
If engine/night/vote changed: rerun full Layer 2.
If projection/event/store/WebSocket changed: rerun identity and refresh/reconnect checks.
If AutoDM/provider changed: rerun provider minimal connectivity and one in-game AutoDM trigger.
```

Expected:

- Issue status becomes fixed, workaround, deferred, or blocked.

- [ ] **Step 9: Commit the fix**

Run:

```bash
git status --short
git add docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git add path/to/each/code-file-changed-for-this-issue
git commit -m "fix: STAB-123 short issue summary"
```

Expected:

- Replace `path/to/each/code-file-changed-for-this-issue` with the exact files listed in the issue record; do not run `git add .`.
- Replace `STAB-123 short issue summary` with the selected issue ID and concrete summary.
- Commit includes the fix, ledger update, and plan status only.
- `backend/.env`, raw screenshots, raw logs, API keys, cookies, and tokens are not staged.

- [ ] **Step 10: Repeat until P0/P1 gate is clear**

Repeat Task 7 until:

```text
No P0 remains.
Every P1 is fixed or has a documented workaround preserving the tested flow.
```

Expected:

- Proceed to final Go/No-Go.

## Task 8: Produce Go/No-Go Report

**Files:**
- Create: `docs/superpowers/specs/2026-05-04-stabilization-go-no-go.md`
- Modify: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`

- [ ] **Step 1: Create Go/No-Go report**

Create `docs/superpowers/specs/2026-05-04-stabilization-go-no-go.md` with:

```markdown
# Stabilization Go/No-Go Report

Date:
Branch:
Design:
Plan:
Timebox used:

## Decision

Decision: Go/No-Go
Reason:

## Environment

- Commit tested:
- Backend runtime:
- Frontend URL:
- Browser(s):
- Provider/model:

## Layer Results

- Layer 1:
- Layer 2:
- Layer 3:
- Layer 4:

## Open Issues

- P0:
- P1:
- P2:
- Backlog:

## Workarounds

- Issue:
- Workaround:
- Risk:

## Evidence

- Ledger:
- Raw evidence directory:

## Next Recommended Work

- Stabilization follow-up:
- Future feature candidate:
```

- [ ] **Step 2: Fill report from ledger**

Expected:

- Report includes no secrets.
- If Layer 4 is blocked only by missing API keys, decision states whether non-AutoDM stabilization can proceed separately.

- [ ] **Step 3: Final verification**

Run:

```bash
rg -n 'AI[z]a|s[k]-[A-Za-z0-9_-]{12,}|Authorization:[ ]Bearer|GEMINI_API_KEY[=].*[^<]|AUTODM_LLM_API_KEY[=].*[^<]' \
  docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md \
  docs/superpowers/specs/2026-05-04-stabilization-go-no-go.md \
  .Codex/plans/2026-05-04-001-stabilization-manual-qa.md || true
git diff --check
git status --short
```

Expected:

- No raw secrets are found.
- Diff check passes.
- Only intended files are staged or modified.

- [ ] **Step 4: Commit final report**

Run:

```bash
git add docs/superpowers/specs/2026-05-04-stabilization-go-no-go.md .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: add stabilization go-no-go report"
```

Expected:

- Final report is committed.

## Task 9: 回环检查：更新所有受影响的 AGENTS.md 和文件头注释

**Files:**
- Inspect: `AGENTS.md`
- Inspect: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`
- Inspect any code files changed during Task 7.

- [ ] **Step 1: Inspect AGENTS impact**

Run:

```bash
git diff --name-only HEAD~10..HEAD | sort
```

Expected:

- Determine whether any changed area has local instructions requiring AGENTS updates.
- `AGENTS.md` is tracked as of the repository hygiene pass; update it only when repository operating instructions change.

- [ ] **Step 2: Inspect file header comments**

For any changed code file, verify existing header/comment conventions still describe the file accurately.

Expected:

- No stale header comments are introduced.

- [ ] **Step 3: Update plan status**

Mark all completed steps in this plan and update the status line below.

- [ ] **Step 4: Commit final plan status**

Run:

```bash
git add .Codex/plans/2026-05-04-001-stabilization-manual-qa.md
git commit -m "docs: complete stabilization plan status"
```

Expected:

- Final plan status is committed.

## 状态：🔄 进行中 - Task 6 Step 6 已完成；Gemini provider gate 通过；DeepSeek blocked-insufficient-balance；下一步是 Task 3 Layer 1 或 Task 6 Step 7 in-game AutoDM 触发
