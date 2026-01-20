const fs = require("fs");
const path = require("path");

const target = process.argv[2] || "src/App.vue";
const start = Number(process.argv[3] || 860);
const end = Number(process.argv[4] || 1030);
const filePath = path.isAbsolute(target) ? target : path.join(__dirname, "..", target);
const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

for (let i = start; i <= end && i <= lines.length; i += 1) {
  const line = lines[i - 1];
  process.stdout.write(`${i}: ${line}\n`);
}
