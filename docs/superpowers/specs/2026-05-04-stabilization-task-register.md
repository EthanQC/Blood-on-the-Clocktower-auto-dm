# Stabilization Task Register

Date: 2026-05-04
Repository: `/Users/abble/Blood-on-the-Clocktower-auto-dm`
Plan: `.Codex/plans/2026-05-04-001-stabilization-manual-qa.md`
Issue ledger: `docs/superpowers/specs/2026-05-04-stabilization-issue-ledger.md`

This register tracks every known task for the current stabilization flow, including work allowed now, work explicitly forbidden in this round, tasks blocked until provider gate or accepted manual QA, and backlog/future-feature candidates. It is a planning and recovery artifact, not accepted gameplay evidence.

## A. Allowed Now - Non-Manual Stabilization Tasks

| ID | Title | Category | Status | Allowed now | Blocker | Source | Next action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-001 | Restore git/worktree context | Allowed non-manual | completed | yes | none | User request; AGENTS recovery rule | Keep status summary current | Current branch is `main`; `AGENTS.md` is tracked and generated `.codex/hooks*` / `.playwright-cli/` artifacts are ignored. |
| A-002 | Review design/plan/ledger coverage | Allowed non-manual | completed | yes | none | User request; Task 2A Steps 1-2 | Keep new omissions in this register | Design, plan, and ledger now record provider gate, small-alpha target, future-feature boundary, static risks, and candidate status. |
| A-003 | Create task register | Allowed non-manual | completed | yes | none | User request | Maintain through fix commits | This file is the task total ledger. |
| A-004 | Task 2A static preflight | Allowed non-manual | completed | yes | none | Plan Task 2A | Keep raw command outputs in `/tmp/botc-stabilization-evidence/` | Static checks only; no browser gameplay. |
| A-005 | Route/API static alignment check | Allowed non-manual | completed | yes | none | Task 2A Step 3; STATIC-001 | Defer feature decision | Frontend calls assistant endpoint; backend route missing. Candidate P1 only, not an accepted runtime issue. |
| A-006 | FontAwesome static check | Allowed non-manual | completed | yes | none | Task 2A Step 4; STAB-001; STATIC-002 | Commit low-risk fix separately | `spinner` and `moon` were used but not registered. |
| A-007 | FontAwesome low-risk fix | Allowed static fix | static fix committed | yes | accepted browser reproduction still blocked | User allowed low-risk static fixes; STAB-001 | Reproduce after provider gate before accepted closure | Verification: frontend `lint-ci` and `build` exited 0; manual closure remains unprocessed. |
| A-008 | Port/API fallback static check | Allowed non-manual | completed | yes | none | Task 2A Step 5; STATIC-003 | Commit low-risk config fix separately | README/.env.local use 8081/8080; vue config/API fallback did not. |
| A-009 | Port/API fallback low-risk fix | Allowed static fix | static fix committed | yes | accepted browser verification still blocked | User allowed config fixes; STATIC-003 | Recheck during accepted Layer 1 after provider gate | Verification: frontend `lint-ci` and `build` exited 0; browser observation not run. |
| A-010 | Night/defense/vote static risk check | Allowed non-manual | completed | yes | provider-gated reproduction for severity | Task 2A Step 6; STATIC-004; STAB-002 | Keep gameplay repair blocked | Night timeout disabled; defense copy candidate exists; no accepted gameplay defect before provider gate. |
| A-011 | State.Copy defense progress candidate fix | Allowed static candidate fix | static candidate fix committed | yes | accepted manual reproduction/regression blocked | Existing uncommitted patch; STATIC-014; STAB-002 | Reproduce and regress after provider gate | Docker Go focused test exited 0; STAB-002 remains candidate/unprocessed. |
| A-012 | Plan hook path static check | Allowed non-manual | cleaned-local | yes | none | Task 2A Step 7; STATIC-007 | Keep ignored unless intentionally reworked | Untracked local hook artifacts referred to `.claude/plans`; `.gitignore` now ignores local `.codex/hooks*` artifacts while tracked plans remain under `.Codex/plans`. |
| A-013 | Provider config static check | Allowed non-manual | completed | yes | DeepSeek balance missing | Task 2A Step 8; STATIC-012 | Use Gemini for current accepted QA; retry DeepSeek after top-up | Gemini default matches baseline; DeepSeek must be explicitly configured for selected baseline. |
| A-014 | Provider gate non-game file/variable check | Allowed non-manual | gemini-passed / deepseek-insufficient-balance | yes | DeepSeek account balance missing | User request; Task 6 Step 1 | Continue accepted manual QA on Gemini; retry DeepSeek after top-up | No variables printed; `/v1/llm/health` reports Gemini enabled. |
| A-015 | Provider model selection record | Allowed non-manual | completed | yes | DeepSeek balance missing for live run | Design decisions; Task 6 Step 2 | Use Gemini baseline for current QA; retry DeepSeek after top-up | Gemini baseline `gemini-3-flash-preview`; DeepSeek baseline `deepseek-v4-pro`; cost/latency candidates deferred. |
| A-016 | Redline/test runtime check | Allowed non-manual | completed | yes | host Go unavailable | Task 2A Step 9; STATIC-006; STATIC-010 | Use Docker Go when needed | Hotspot files exceed redlines; Node v25.8.1/npm 11.11.0 recorded. |
| A-017 | `.env.example` provider guidance review | Allowed config/docs review | static docs/config fix committed | yes | DeepSeek balance missing | Task 2A Step 8; STATIC-012 | Keep guidance current if provider defaults change | Added commented DeepSeek provider-gate example and Gemini model candidate notes; no real `.env` or runtime default changed. |
| A-018 | Static fix verification | Allowed non-manual | completed for current static fixes | yes | browser/manual verification blocked | User request | Preserve raw outputs in `/tmp` | Frontend lint/build and Docker Go unit test outputs saved under `/tmp/botc-stabilization-evidence/`. |
| A-019 | Update ledger/design/plan state | Allowed documentation | completed | yes | none | User request; Plan execution rules | Keep plan status current | Task 3/4/5/7 stay unchecked. |
| A-020 | Self-check before final | Allowed non-manual | completed | yes | none | User request | Keep final output with delivery summary | Required `rg` checks and `git diff --check` produced no findings; status should remain clean except ignored local dependency/env artifacts. |
| A-021 | Necessary documentation commit | Allowed git action | completed | yes | none | User request | No further doc commit unless final status changes | Used exact path staging; no `git add .`. |
| A-022 | Necessary static fix commits | Allowed git action | completed | yes | none | User request | Keep generated artifacts out of commits | Static fixes were committed separately; `backend/.env` and raw evidence were not staged. |
| A-023 | Local repository hygiene | Allowed cleanup | completed | yes | none | User request 2026-05-08 | Keep status clean after future tool runs | Committed AGENTS, ignored generated artifacts, and removed transient Playwright/hook outputs. Keep `backend/.env` ignored and never staged. |
| A-024 | Record RAG runtime mount issue | Allowed documentation | completed | yes | none | ENV-001; STATIC-015 | Keep visible before Layer 4 AutoDM/RAG validation | Current backend eval container exposes provider health but not repo-level `docs/rules`. |

## B. Explicitly Not Allowed In This Round

| ID | Title | Category | Status | Allowed now | Blocker | Source | Next action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B-001 | Manual browser functional QA | Not allowed in cleanup turn | recorded | no | user requested repo hygiene only | User request | Wait for explicit start | Includes agent-controlled browser testing. |
| B-002 | Create-room/join/seat/start-game manual flow | Not allowed in cleanup turn | recorded | no | user requested repo hygiene only | User request | Defer | No accepted or preliminary browser gameplay in this cleanup turn. |
| B-003 | Five-player game manual QA | Not allowed in cleanup turn | recorded | no | Layer 1 not yet accepted | User request; Plan Task 4 | Defer to accepted Layer 2 | Existing pre-key observations remain candidate only. |
| B-004 | Seven-player game manual QA | Not allowed in cleanup turn | recorded | no | Layer 2 not yet accepted | User request; Plan Task 5 | Defer to accepted Layer 3 | No representative release-grade run now. |
| B-005 | Mobile viewport manual QA | Not allowed in cleanup turn | recorded | no | user requested repo hygiene only | User request; Design Layer 3 | Defer | Desktop responsive viewport checks wait. |
| B-006 | AutoDM in-game flow QA | Not allowed in cleanup turn | recorded | no | user requested repo hygiene only; ENV-001 for RAG closure | User request; Plan Task 6 Step 7 | Defer to Layer 4 after runtime fix or explicit AutoDM-only start | Minimal provider health is complete; in-game flow is not. |
| B-007 | Scripted player-flow simulation as substitute for QA | Not allowed now | recorded | no | user forbids substitute evidence | User request | Do not run | Backend unit tests are allowed; scripted gameplay replacement is not. |
| B-008 | Counting pre-key browser observations as evidence | Not allowed | recorded | no | validity reset | User decision 2026-05-04 | Keep only candidate notes | Applies to Layer 1/2 notes and STAB-001/STAB-002. |
| B-009 | New feature development | Not allowed now | recorded | no | stabilization scope | User request; design scope | Backlog only | Includes assistant endpoint feature work unless separately approved. |
| B-010 | Large refactor | Not allowed now | recorded | no | stabilization scope and redline rules | User request; AGENTS | Defer | Especially avoid large historical files. |
| B-011 | Full night-flow repair | Not allowed now | recorded | no | requires accepted reproduction/manual regression | User request | Defer until provider-gated issue | Static review only this round. |
| B-012 | Full vote/execution repair | Not allowed now | recorded | no | requires accepted reproduction/manual regression | User request | Defer until provider-gated issue | Static review only this round. |
| B-013 | AutoDM in-game behavior repair | Not allowed now | recorded | no | requires real provider and gameplay evidence | User request | Defer | Provider configuration review only. |
| B-014 | Production deployment | Not allowed now | recorded | no | out of scope | User request; design scope | Backlog | No deploy work. |
| B-015 | Security audit | Not allowed now | recorded | no | out of scope | User request; design scope | Backlog | Secret hygiene checks are allowed; broad audit is not. |
| B-016 | Long-duration load testing | Not allowed now | recorded | no | out of scope | User request; design scope | Backlog | No loadtest execution. |
| B-017 | Full model quality A/B | Not allowed now | recorded | no | out of scope | User request; design scope | Backlog | Model choices are recorded only. |
| B-018 | Real phone mobile testing | Not allowed now | recorded | no | deferred coverage | User request; design scope | Backlog | Desktop mobile viewport later; true devices deferred. |
| B-019 | Commit `backend/.env` or leak secrets | Not allowed now | recorded | no | security rule | User request; design evidence rules | Never stage or print | Also no Authorization headers, cookies, or full provider request bodies. |

## C. Requires Provider Gate Or Accepted Manual QA First

| ID | Title | Category | Status | Allowed now | Blocker | Source | Next action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C-001 | Place/configure real provider credentials | Provider gate | completed-for-gemini | no | DeepSeek balance missing | User request; Task 6 | Rotate exposed chat-posted keys and keep real values only in local env | Credentials must not be printed or committed. |
| C-002 | Minimal provider health probe | Provider gate | gemini-passed | no | DeepSeek balance missing | User request; Task 6 Step 6 | Use Gemini for accepted QA; retry DeepSeek after top-up | Report provider/model/status/duration/redacted error class only. |
| C-003 | Accepted Layer 1 smoke | Post-provider manual QA | ready-on-gemini | yes | none for Gemini | Plan Task 3 | Start accepted Layer 1 | Prior Layer 1 result is unprocessed. |
| C-004 | Accepted Layer 2 five-player closure | Post-provider manual QA | ready-after-layer-1 | yes | Layer 1 not yet accepted | Plan Task 4 | Start after accepted Layer 1 | Prior five-player notes are candidate only. |
| C-005 | Accepted Layer 3 seven-player flow | Post-provider manual QA | ready-after-layer-2 | yes | Layer 2 not yet accepted | Plan Task 5 | Start after Layer 2 gate | Includes identity/private info, refresh/reconnect, room isolation, mobile viewport. |
| C-006 | Accepted Layer 4 AutoDM in-game trigger | Post-provider manual QA | ready-on-gemini-after-runtime-fix | yes | RAG container mount needs correction before accepted RAG closure | Plan Task 6 Step 7; ENV-001 | Start after Layer 1 or explicit AutoDM-only decision, using runtime with `docs/rules` available | Must observe real provider output tied to active room. |
| C-007 | Reproduce and reclassify STAB-001 | Post-provider issue triage | ready-on-gemini | yes | accepted browser reproduction missing | STAB-001 | Rerun browser path during Layer 1/2 | Static fix can reduce risk, but accepted issue status remains unprocessed. |
| C-008 | Reproduce and reclassify STAB-002 | Post-provider issue triage | ready-on-gemini | yes | accepted defense regression missing | STAB-002 | Rerun defense path during Layer 2 | Static unit fix can be committed as candidate; accepted fix still requires manual regression. |
| C-009 | P0/P1 repair loop | Post-provider repair | blocked-by-provider-gate | no | accepted reproduction missing | Plan Task 7 | Start only after accepted issue evidence | Includes failing path, event/replay evidence, minimal fix, regression. |
| C-010 | Go/No-Go report | Post-provider summary | blocked-by-provider-gate | no | Layers 1-4 unresolved | Plan Task 8 | Produce after accepted QA or explicit stop decision | Current pass pauses before this. |

## D. Backlog / Future Feature Candidates

| ID | Title | Category | Status | Allowed now | Blocker | Source | Next action | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-001 | Hosting experience improvements | Backlog / future feature | recorded | no | stabilization first | User request; design future pool | Revisit after Go/No-Go | AI pacing, narration, exception explanations, host intervention, style templates, event recap. |
| D-002 | Player experience improvements | Backlog / future feature | recorded | no | stabilization first | User request; design future pool | Revisit after Go/No-Go | Action panel, night prompts, private/evil chat, vote feedback, death/spectator state, mobile ergonomics. |
| D-003 | Rules teaching features | Backlog / future feature | recorded | no | stabilization first | User request; design future pool | Revisit after Go/No-Go | Role explanations, phase guidance, invalid-action explanations, rules Q&A, tutorial, information-leak hints. |
| D-004 | Replay and records | Backlog / future feature | recorded | no | stabilization first | User request; design future pool | Revisit after Go/No-Go | Timeline, night actions, vote records, AI summary, deduction replay, exportable battle report. |
| D-005 | Content expansion | Backlog / future feature | recorded | no | stabilization first | User request; design future pool | Revisit after Go/No-Go | More roles, script management, custom scripts, balance suggestions, imports, localization. |
| D-006 | Room operations and host controls | Backlog / future feature | recorded | no | stabilization first | User request; design future pool | Revisit after Go/No-Go | Host console, reseat, substitute, kick, disconnect takeover, share link, spectators, permissions, identity. |
| D-007 | Model A/B routing and quality comparison | Backlog / future feature | recorded | no | stabilization first; DeepSeek balance missing | User request; design future pool | Revisit after stable baseline | Gemini/DeepSeek routing, quality rubrics, latency/cost measurement, model comparison. |
| D-008 | Deployment and operations capability | Backlog / future feature | recorded | no | stabilization first | User request; design future pool | Revisit after local alpha readiness | Deployment, backups, hosted observability, operational runbooks. |
