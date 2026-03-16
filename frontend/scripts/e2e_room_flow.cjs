const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const https = require("node:https");
const net = require("node:net");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

const repoRoot = path.resolve(__dirname, "..", "..");
const frontendDir = path.resolve(__dirname, "..");
const backendDir = path.resolve(repoRoot, "backend");
const artifactDir = path.resolve(
  repoRoot,
  process.env.BOTC_E2E_ARTIFACT_DIR || "tmp/e2e-room-flow"
);
const frontendUrl = process.env.BOTC_E2E_FRONTEND_URL || "http://127.0.0.1:8081";
const backendUrl = process.env.BOTC_E2E_BACKEND_URL || "http://127.0.0.1:8080";
const keepServers = process.env.BOTC_E2E_KEEP_SERVERS === "1";
const skipDocker = process.env.BOTC_E2E_SKIP_DOCKER === "1";
const startTimeoutMs = 120000;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function createLogger(logName) {
  const logPath = path.join(artifactDir, logName);
  const stream = fs.createWriteStream(logPath, { flags: "a" });
  return {
    logPath,
    write(line) {
      stream.write(line);
    },
    close() {
      stream.end();
    }
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function requestOnce(urlString) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      url,
      {
        method: "GET",
        timeout: 2000
      },
      res => {
        res.resume();
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 500, statusCode: res.statusCode });
      }
    );
    req.on("timeout", () => req.destroy(new Error(`timeout requesting ${urlString}`)));
    req.on("error", reject);
    req.end();
  });
}

async function waitForHttp(urlString, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await requestOnce(urlString);
      if (response.ok) return;
    } catch (_err) {
      // Retry until timeout.
    }
    await sleep(500);
  }
  throw new Error(`timed out waiting for ${urlString}`);
}

async function waitForPort(host, port, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port });
        socket.once("connect", () => {
          socket.destroy();
          resolve();
        });
        socket.once("error", err => {
          socket.destroy();
          reject(err);
        });
      });
      return;
    } catch (_err) {
      await sleep(500);
    }
  }
  throw new Error(`timed out waiting for ${host}:${port}`);
}

async function isHttpReady(urlString) {
  try {
    const response = await requestOnce(urlString);
    return response.ok;
  } catch (_err) {
    return false;
  }
}

function spawnProcess(name, command, args, options = {}) {
  const logger = createLogger(`${name}.log`);
  logger.write(`$ ${command} ${args.join(" ")}\n`);

  const child = spawn(command, args, {
    cwd: options.cwd,
    env: options.env || process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let exited = false;
  let exitCode = null;
  let exitSignal = null;

  child.stdout.on("data", chunk => logger.write(chunk.toString()));
  child.stderr.on("data", chunk => logger.write(chunk.toString()));
  child.on("exit", (code, signal) => {
    exited = true;
    exitCode = code;
    exitSignal = signal;
    logger.write(`\n[exit] code=${code} signal=${signal}\n`);
    logger.close();
  });

  return {
    name,
    child,
    logPath: logger.logPath,
    get exited() {
      return exited;
    },
    get exitCode() {
      return exitCode;
    },
    get exitSignal() {
      return exitSignal;
    }
  };
}

async function runCommand(name, command, args, options = {}) {
  const logger = createLogger(`${name}.log`);
  logger.write(`$ ${command} ${args.join(" ")}\n`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env || process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => {
      const text = chunk.toString();
      stdout += text;
      logger.write(text);
    });
    child.stderr.on("data", chunk => {
      const text = chunk.toString();
      stderr += text;
      logger.write(text);
    });
    child.on("error", err => {
      logger.write(`\n[error] ${String(err)}\n`);
      logger.close();
      reject(err);
    });
    child.on("exit", code => {
      logger.write(`\n[exit] code=${code}\n`);
      logger.close();
      if (code === 0) {
        resolve({ stdout, stderr, logPath: logger.logPath });
        return;
      }
      reject(new Error(`${name} failed with exit code ${code}. See ${logger.logPath}`));
    });
  });
}

async function stopProcess(proc) {
  if (!proc || proc.exited) return;
  proc.child.kill("SIGINT");
  const start = Date.now();
  while (!proc.exited && Date.now() - start < 5000) {
    await sleep(100);
  }
  if (!proc.exited) {
    proc.child.kill("SIGKILL");
  }
}

async function waitForProcessReady(proc, urlString, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (proc.exited) {
      throw new Error(`${proc.name} exited early. See ${proc.logPath}`);
    }
    if (await isHttpReady(urlString)) return;
    await sleep(500);
  }
  throw new Error(`timed out waiting for ${proc.name} to become ready at ${urlString}`);
}

async function visible(page, selector) {
  try {
    return await page.locator(selector).first().isVisible({ timeout: 250 });
  } catch (_err) {
    return false;
  }
}

async function text(page, selector) {
  try {
    return (await page.locator(selector).first().textContent({ timeout: 1000 })) || "";
  } catch (_err) {
    return "";
  }
}

async function snap(page, filename) {
  await page.screenshot({ path: path.join(artifactDir, filename), fullPage: true });
}

async function waitForLobbySeat(page) {
  const start = Date.now();
  while (Date.now() - start < 10000) {
    if ((await page.locator(".player-slot.is-me").count()) > 0) return;
    const emptyCount = await page.locator(".player-slot.empty").count();
    if (emptyCount > 0) {
      await page.locator(".player-slot.empty").first().click();
    }
    await sleep(300);
  }
  throw new Error("timed out waiting for player seat in lobby");
}

async function driveNightUntilDay(page) {
  const start = Date.now();
  while (Date.now() - start < 90000) {
    const phaseText = await text(page, ".top-bar__phase");
    if (/Day\s*1\s*·\s*(Day|Nomination)/.test(phaseText)) return phaseText;

    if (await visible(page, ".night-overlay__continue")) {
      await page.locator(".night-overlay__continue").first().click();
      await sleep(500);
      continue;
    }
    if (await visible(page, ".night-overlay__done")) {
      await page.locator(".night-overlay__done").first().click();
      await sleep(500);
      continue;
    }
    if (await visible(page, ".night-overlay__skip")) {
      await page.locator(".night-overlay__skip").first().click();
      await sleep(500);
      continue;
    }

    if (await visible(page, ".square-view__night-targeting")) {
      const progressText = await text(page, ".square-view__night-progress");
      const match = progressText.match(/(\d+)\/(\d+)/);
      const required = match ? Number(match[2]) : 1;
      let selected = await page.locator(".player-node.is-night-selected").count();
      let selectable = await page.locator(".player-node.is-night-selectable").count();
      while (selected < required && selectable > 0) {
        await page.locator(".player-node.is-night-selectable").nth(selected).click();
        await sleep(250);
        selected = await page.locator(".player-node.is-night-selected").count();
        selectable = await page.locator(".player-node.is-night-selectable").count();
      }
      const confirm = page.locator(".square-view__night-btn").filter({ hasText: /Confirm/i }).first();
      if (await confirm.count()) {
        const disabled = await confirm.evaluate(el => el.classList.contains("disabled"));
        if (!disabled) {
          await confirm.click();
          await sleep(500);
          continue;
        }
      }
      if (await visible(page, ".square-view__night-btn--skip")) {
        await page.locator(".square-view__night-btn--skip").first().click();
        await sleep(500);
        continue;
      }
    }

    await sleep(500);
  }
  throw new Error("timed out reaching day phase");
}

async function waitForDayAfterReconnect(page, roomId) {
  await page.goto(`${frontendUrl}/#${roomId}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const phase = document.querySelector(".top-bar__phase")?.textContent || "";
    return /Day\s*1/.test(phase) && !!document.querySelector(".square-view__advance-btn");
  }, { timeout: 30000 });
}

async function addBots(page, roomId) {
  const response = await page.evaluate(async ({ roomIdArg, backendUrlArg }) => {
    const token = sessionStorage.getItem("botc_token");
    const res = await fetch(`${backendUrlArg}/v1/rooms/${roomIdArg}/bots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ count: 6, personality: "random" })
    });
    return {
      ok: res.ok,
      status: res.status,
      body: await res.text()
    };
  }, { roomIdArg: roomId, backendUrlArg: backendUrl });

  if (!response.ok) {
    throw new Error(`add bots failed: ${response.status} ${response.body}`);
  }
}

async function runRoomFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1400 }
  });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on("console", msg => {
    if (msg.type() === "error") {
      consoleErrors.push({ type: "console.error", text: msg.text() });
    }
  });
  page.on("pageerror", err => {
    consoleErrors.push({ type: "pageerror", text: String(err) });
  });

  try {
    await page.goto(frontendUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".home-screen__btn");
    await snap(page, "00-home.png");

    await page.locator(".home-screen__btn").first().click();
    await page.waitForSelector(".lobby-screen");
    await waitForLobbySeat(page);
    const roomId = await page.locator(".lobby-screen__room-value").getAttribute("title");
    if (!roomId) throw new Error("room id not found in lobby");
    await snap(page, "01-lobby.png");

    await addBots(page, roomId);
    await page.waitForFunction(() => {
      const header = document.querySelector(".player-grid__header");
      return header && /\(7\/7\)/.test(header.textContent || "");
    }, { timeout: 15000 });
    await snap(page, "02-lobby-full.png");

    if (await page.locator(".square-view__extend-btn").count()) {
      throw new Error("extend discussion button should not exist");
    }

    await page.locator(".lobby-screen__start-btn").click();
    await page.waitForSelector(".top-bar__phase");
    await driveNightUntilDay(page);
    await page.waitForSelector(".square-view__advance-btn", { timeout: 15000 });
    await snap(page, "03-day.png");

    await waitForDayAfterReconnect(page, roomId);
    await snap(page, "04-day-reconnected.png");

    await page.locator(".player-node[aria-label*='Seat 2']").first().click();
    await page.waitForSelector(".action-sheet-overlay");
    await page.locator(".action-sheet__action.nominate").click();

    await page.waitForSelector(".vote-overlay");
    const defense1Text = await text(page, ".vote-overlay__defense-text");
    if (!/Seat 1/.test(defense1Text)) {
      throw new Error(`expected nominator defense first, got: ${defense1Text}`);
    }
    if (!(await visible(page, ".vote-overlay__end-defense-btn"))) {
      throw new Error("expected end defense button for nominator");
    }
    await snap(page, "05-defense-1.png");

    await page.locator(".vote-overlay__end-defense-btn").click();
    await page.waitForFunction(() => {
      const overlay = document.querySelector(".vote-overlay");
      if (!overlay) return false;
      const body = overlay.textContent || "";
      return body.includes("Seat 2 defending") || body.includes("Waiting for Seat 2 to end defense");
    }, { timeout: 10000 });
    if (await visible(page, ".vote-overlay__end-defense-btn")) {
      throw new Error("end defense button should be hidden after nominator ends");
    }
    await snap(page, "06-defense-2.png");

    await page.waitForFunction(() => !!document.querySelector(".vote-overlay__progress-info"), { timeout: 15000 });
    await snap(page, "07-voting.png");

    await page.waitForSelector(".vote-overlay__my-turn", { timeout: 30000 });
    await snap(page, "08-my-turn.png");
    await page.locator(".vote-overlay__vote-btn.yes").click();

    await page.waitForSelector(".vote-overlay__result", { timeout: 30000 });
    await snap(page, "09-result.png");
    if (await visible(page, ".vote-overlay__close-btn")) {
      await page.locator(".vote-overlay__close-btn").click();
    }

    await page.waitForSelector(".square-view__advance-btn", { timeout: 15000 });
    await snap(page, "10-post-vote.png");
    await page.locator(".square-view__advance-btn").click();
    await page.waitForFunction(() => {
      const phase = document.querySelector(".top-bar__phase")?.textContent || "";
      return /Night/.test(phase) || !!document.querySelector(".night-overlay");
    }, { timeout: 15000 });
    await snap(page, "11-night-entered.png");

    if (consoleErrors.length) {
      throw new Error(`console errors detected: ${JSON.stringify(consoleErrors)}`);
    }

    const report = {
      roomId,
      frontendUrl,
      backendUrl,
      consoleErrors,
      checks: {
        noExtendButton: true,
        ownerCanEnterNight: true,
        ownerStillCanEnterNightAfterReconnect: true,
        nominatorDefenseFirst: true,
        botNomineeAutoEndsDefense: true,
        votingReached: true,
        hostVoted: true,
        nightReentered: true,
        consoleClean: true
      }
    };
    fs.writeFileSync(path.join(artifactDir, "report.json"), JSON.stringify(report, null, 2));
    return report;
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

async function main() {
  ensureDir(artifactDir);

  let backendProc = null;
  let frontendProc = null;
  const started = {
    docker: false,
    backend: false,
    frontend: false
  };

  try {
    if (!skipDocker) {
      await runCommand(
        "docker-compose-up",
        "docker",
        ["compose", "up", "-d", "mysql", "redis", "rabbitmq", "qdrant"],
        { cwd: backendDir }
      );
      started.docker = true;
      await Promise.all([
        waitForPort("127.0.0.1", 3316, startTimeoutMs),
        waitForPort("127.0.0.1", 6389, startTimeoutMs),
        waitForPort("127.0.0.1", 5672, startTimeoutMs)
      ]);
    }

    if (!(await isHttpReady(`${backendUrl}/v1/llm/health`))) {
      backendProc = spawnProcess(
        "backend-dev",
        "go",
        ["run", "./cmd/server"],
        {
          cwd: backendDir,
          env: { ...process.env, AUTODM_ENABLED: "false" }
        }
      );
      started.backend = true;
      await waitForProcessReady(backendProc, `${backendUrl}/v1/llm/health`, startTimeoutMs);
    }

    if (!(await isHttpReady(frontendUrl))) {
      frontendProc = spawnProcess(
        "frontend-dev",
        "npm",
        ["run", "dev", "--", "--host", "127.0.0.1", "--port", "8081"],
        {
          cwd: frontendDir
        }
      );
      started.frontend = true;
      await waitForProcessReady(frontendProc, frontendUrl, startTimeoutMs);
    }

    const report = await runRoomFlow();
    report.started = started;
    if (backendProc) report.backendLog = backendProc.logPath;
    if (frontendProc) report.frontendLog = frontendProc.logPath;
    fs.writeFileSync(path.join(artifactDir, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } catch (err) {
    const failure = {
      error: String(err),
      started,
      backendLog: backendProc ? backendProc.logPath : null,
      frontendLog: frontendProc ? frontendProc.logPath : null
    };
    fs.writeFileSync(path.join(artifactDir, "report.json"), JSON.stringify(failure, null, 2));
    console.error(String(err));
    process.exitCode = 1;
  } finally {
    if (!keepServers) {
      await stopProcess(frontendProc);
      await stopProcess(backendProc);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
