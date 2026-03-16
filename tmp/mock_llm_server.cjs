const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const PORT = Number(process.env.MOCK_LLM_PORT || 18081);
const LOG_PATH = path.resolve(
  "/Users/qingchang/Blood-on-the-Clocktower-auto-dm",
  process.env.MOCK_LLM_LOG || "tmp/mock-llm-requests.jsonl"
);
const EMBEDDING_DIM = Number(process.env.MOCK_LLM_EMBED_DIM || 1536);

fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function embedText(text) {
  const values = new Array(EMBEDDING_DIM).fill(0);
  const input = String(text || "");
  for (let i = 0; i < input.length; i += 1) {
    values[i % EMBEDDING_DIM] += input.charCodeAt(i) / 255;
  }
  return values;
}

function logRequest(pathname, payload) {
  fs.appendFileSync(LOG_PATH, `${JSON.stringify({
    ts: new Date().toISOString(),
    path: pathname,
    payload
  })}\n`);
}

function chatCompletion(payload) {
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const lastUserMessage = [...messages].reverse().find(message => message.role === "user");
  const content = `mock:${String(lastUserMessage?.content || "ok").slice(0, 120)}`;

  return {
    id: `mock-${Date.now()}`,
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content
        },
        finish_reason: "stop"
      }
    ],
    usage: {
      prompt_tokens: JSON.stringify(payload).length,
      completion_tokens: content.length,
      total_tokens: JSON.stringify(payload).length + content.length
    }
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  const rawBody = await readBody(req);
  let payload = {};
  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch (_err) {
      payload = { rawBody };
    }
  }
  logRequest(url.pathname, payload);

  if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(chatCompletion(payload)));
    return;
  }

  if (req.method === "POST" && url.pathname === "/v1/embeddings") {
    const inputs = Array.isArray(payload.input) ? payload.input : [payload.input];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      data: inputs.map((input, index) => ({
        index,
        embedding: embedText(input)
      }))
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `unhandled ${req.method} ${url.pathname}` }));
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`mock llm listening on http://127.0.0.1:${PORT}\n`);
});
