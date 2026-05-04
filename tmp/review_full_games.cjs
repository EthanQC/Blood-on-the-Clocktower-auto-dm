const fs = require("node:fs");
const path = require("node:path");
const WebSocket = require("/Users/qingchang/Blood-on-the-Clocktower-auto-dm/frontend/node_modules/ws");

const BACKEND_URL = process.env.BOTC_REVIEW_BACKEND_URL || "http://127.0.0.1:8080";
const WS_URL = process.env.BOTC_REVIEW_WS_URL || "ws://127.0.0.1:8080/ws";
const GAME_COUNT = Number(process.env.BOTC_REVIEW_GAME_COUNT || 10);
const REPORT_PATH = path.resolve(
  "/Users/qingchang/Blood-on-the-Clocktower-auto-dm",
  process.env.BOTC_REVIEW_REPORT || "tmp/full-game-review-report.json"
);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function api(pathname, options = {}) {
  const response = await fetch(`${BACKEND_URL}${pathname}`, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${pathname} failed: ${response.status} ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function quickLogin(name) {
  return api("/v1/auth/quick", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
}

async function createRoom(token) {
  return api("/v1/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: "{}"
  });
}

async function joinRoom(token, roomId) {
  return api(`/v1/rooms/${roomId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: "{}"
  });
}

async function getState(token, roomId) {
  return api(`/v1/rooms/${roomId}/state`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

class Client {
  constructor({ name, token, userId, roomId }) {
    this.name = name;
    this.token = token;
    this.userId = userId;
    this.roomId = roomId;
    this.ws = null;
    this.reqSeq = 0;
    this.cmdSeq = 0;
    this.pendingNightPrompts = [];
    this.seenPromptKeys = new Set();
  }

  async connect() {
    await new Promise((resolve, reject) => {
      const ws = new WebSocket(`${WS_URL}?token=${encodeURIComponent(this.token)}`);
      this.ws = ws;
      let settled = false;

      ws.on("open", () => {
        this.sendRaw("subscribe", { room_id: this.roomId, last_seq: 0 });
      });

      ws.on("message", raw => {
        let msg;
        try {
          msg = JSON.parse(raw.toString());
        } catch (_err) {
          return;
        }

        if (!settled && msg.type === "subscribed") {
          settled = true;
          resolve();
          return;
        }

        if (msg.type !== "event") {
          return;
        }

        let pe = msg.payload;
        if (typeof pe === "string") {
          try {
            pe = JSON.parse(pe);
          } catch (_err) {
            return;
          }
        }
        if (!pe || pe.event_type !== "night.action.prompt") {
          return;
        }

        let data = pe.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch (_err) {
            data = {};
          }
        }
        const promptKey = `${pe.seq}:${data.user_id || this.userId}:${data.role_id || ""}`;
        if (this.seenPromptKeys.has(promptKey)) {
          return;
        }
        this.seenPromptKeys.add(promptKey);
        this.pendingNightPrompts.push({ key: promptKey, data: data || {} });
      });

      ws.on("error", err => {
        if (!settled) {
          settled = true;
          reject(err);
        }
      });

      ws.on("close", () => {
        if (!settled) {
          settled = true;
          reject(new Error(`${this.name} websocket closed before subscribe ack`));
        }
      });
    });
  }

  sendRaw(type, payload) {
    this.reqSeq += 1;
    this.ws.send(JSON.stringify({
      type,
      request_id: `${this.name}-req-${this.reqSeq}`,
      payload
    }));
  }

  sendCommand(type, data = {}) {
    this.cmdSeq += 1;
    this.sendRaw("command", {
      command_id: `${this.name}-cmd-${this.cmdSeq}`,
      idempotency_key: `${this.name}-idem-${this.cmdSeq}`,
      room_id: this.roomId,
      type,
      data
    });
  }

  takeNightPrompts() {
    const prompts = this.pendingNightPrompts;
    this.pendingNightPrompts = [];
    return prompts;
  }

  async close() {
    if (!this.ws) return;
    await new Promise(resolve => {
      const ws = this.ws;
      this.ws = null;
      ws.once("close", () => resolve());
      ws.close();
      setTimeout(resolve, 1000);
    });
  }
}

function alivePlayersInSeatOrder(state) {
  return (state.seat_order || [])
    .map(uid => state.players[uid])
    .filter(Boolean)
    .filter(player => player.alive && !player.is_dm);
}

function selectNightTargets(state, actorId, actionType, roleId) {
  const seatOrder = state.seat_order || [];
  const actor = state.players[actorId];
  const others = seatOrder
    .map(uid => state.players[uid])
    .filter(Boolean)
    .filter(player => player.user_id !== actorId && player.alive && !player.is_dm);

  if (actionType === "select_two") {
    return others.slice(0, 2).map(player => player.user_id);
  }

  if (actionType === "select_one") {
    if (roleId === "imp") {
      const preferred = others.find(player => player.user_id !== actor?.user_id);
      return preferred ? [preferred.user_id] : [];
    }
    return others[0] ? [others[0].user_id] : [];
  }

  return [];
}

function chooseNomination(state) {
  const alive = alivePlayersInSeatOrder(state);
  const nominators = alive.filter(player => !player.has_nominated);
  if (!nominators.length) return null;

  const nominator = nominators[0];
  const nominees = alive.filter(player => player.user_id !== nominator.user_id && !player.was_nominated);
  if (!nominees.length) return null;

  return {
    nominatorId: nominator.user_id,
    nomineeId: nominees[0].user_id
  };
}

async function waitFor(condition, { timeoutMs = 30000, intervalMs = 200, onTick } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await condition();
    if (result) return result;
    if (onTick) await onTick();
    await sleep(intervalMs);
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}

async function runSingleGame(gameIndex) {
  const ownerAuth = await quickLogin(`review-owner-${gameIndex}`);
  const room = await createRoom(ownerAuth.token);
  const roomId = room.room_id;

  const clients = [];
  const clientMap = new Map();
  const commandLog = [];

  async function addClient(auth, name) {
    const client = new Client({
      name,
      token: auth.token,
      userId: auth.user_id,
      roomId
    });
    await client.connect();
    clients.push(client);
    clientMap.set(auth.user_id, client);
    return client;
  }

  const ownerClient = await addClient(ownerAuth, `owner-${gameIndex}`);
  ownerClient.sendCommand("join", { name: `Owner-${gameIndex}` });

  for (let i = 0; i < 6; i += 1) {
    const auth = await quickLogin(`review-p${gameIndex}-${i + 2}`);
    await joinRoom(auth.token, roomId);
    const client = await addClient(auth, `p${i + 2}-${gameIndex}`);
    client.sendCommand("join", { name: `P${i + 2}-${gameIndex}` });
  }

  await waitFor(async () => {
    const state = await getState(ownerAuth.token, roomId);
    return state.phase === "lobby" && Object.keys(state.players || {}).length === 7;
  }, { timeoutMs: 30000 });

  ownerClient.sendCommand("start_game", { edition: "tb" });
  commandLog.push({ actor: ownerAuth.user_id, type: "start_game" });

  let lastDayHandled = -1;
  let safetyCounter = 0;

  while (safetyCounter < 1500) {
    safetyCounter += 1;
    const state = await getState(ownerAuth.token, roomId);

    if (state.phase === "ended") {
      const summary = {
        roomId,
        winner: state.winner,
        winReason: state.win_reason,
        dayCount: state.day_count,
        nightCount: state.night_count,
        players: Object.values(state.players || {}).map(player => ({
          userId: player.user_id,
          name: player.name,
          role: player.role,
          alive: player.alive,
          seatNumber: player.seat_number,
          team: player.team || ""
        })),
        commandLog
      };
      for (const client of clients) {
        await client.close();
      }
      return summary;
    }

    if (state.phase === "first_night" || state.phase === "night") {
      let acted = false;
      for (const client of clients) {
        for (const prompt of client.takeNightPrompts()) {
          const promptData = prompt.data || {};
          const actorId = promptData.user_id || client.userId;
          const targets = selectNightTargets(state, actorId, promptData.action_type, promptData.role_id);
          client.sendCommand("ability.use", { targets: JSON.stringify(targets) });
          commandLog.push({
            actor: actorId,
            type: "ability.use",
            phase: state.phase,
            role: promptData.role_id || "",
            targets
          });
          acted = true;
        }
      }
      await sleep(acted ? 150 : 100);
      continue;
    }

    if (state.nomination && !state.nomination.resolved) {
      const nomination = state.nomination;
      if (state.sub_phase === "defense") {
        if (!nomination.nominator_ended) {
          const client = clientMap.get(nomination.nominator);
          client.sendCommand("end_defense", {});
          commandLog.push({ actor: nomination.nominator, type: "end_defense", stage: "nominator" });
        } else if (!nomination.nominee_ended) {
          const client = clientMap.get(nomination.nominee);
          client.sendCommand("end_defense", {});
          commandLog.push({ actor: nomination.nominee, type: "end_defense", stage: "nominee" });
        }
        await sleep(100);
        continue;
      }

      if (state.sub_phase === "voting") {
        const voteOrder = Array.isArray(nomination.vote_order) ? nomination.vote_order : [];
        const idx = Number.isInteger(nomination.current_voter_idx) ? nomination.current_voter_idx : 0;
        const voterId = voteOrder[idx];
        if (voterId && !Object.prototype.hasOwnProperty.call(nomination.votes || {}, voterId)) {
          const client = clientMap.get(voterId);
          client.sendCommand("vote", { vote: "yes" });
          commandLog.push({ actor: voterId, type: "vote", vote: "yes" });
        }
        await sleep(100);
        continue;
      }
    }

    if ((state.phase === "day" || state.phase === "nomination") && (!state.nomination || state.nomination.resolved)) {
      if (state.on_the_block) {
        ownerClient.sendCommand("advance_phase", { phase: "night" });
        commandLog.push({ actor: ownerAuth.user_id, type: "advance_phase", target: "night", reason: "on_the_block" });
        await sleep(150);
        continue;
      }

      if (lastDayHandled !== state.day_count) {
        const choice = chooseNomination(state);
        if (choice) {
          const client = clientMap.get(choice.nominatorId);
          client.sendCommand("nominate", { nominee: choice.nomineeId });
          lastDayHandled = state.day_count;
          commandLog.push({
            actor: choice.nominatorId,
            type: "nominate",
            nominee: choice.nomineeId
          });
          await sleep(150);
          continue;
        }
        lastDayHandled = state.day_count;
      }

      ownerClient.sendCommand("advance_phase", { phase: "night" });
      commandLog.push({ actor: ownerAuth.user_id, type: "advance_phase", target: "night", reason: "no_nomination" });
      await sleep(150);
      continue;
    }

    await sleep(100);
  }

  for (const client of clients) {
    await client.close();
  }
  throw new Error(`game ${gameIndex} exceeded safety limit`);
}

async function main() {
  const results = [];
  const failures = [];

  for (let i = 0; i < GAME_COUNT; i += 1) {
    try {
      const game = await runSingleGame(i + 1);
      results.push(game);
      process.stdout.write(`game ${i + 1}/${GAME_COUNT}: ${game.winner} - ${game.winReason}\n`);
    } catch (error) {
      failures.push({ game: i + 1, error: String(error) });
      process.stdout.write(`game ${i + 1}/${GAME_COUNT}: FAIL ${String(error)}\n`);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    backendUrl: BACKEND_URL,
    gameCount: GAME_COUNT,
    passed: results.length,
    failed: failures.length,
    results,
    failures
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  process.stdout.write(`report: ${REPORT_PATH}\n`);

  if (failures.length) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
