const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "components", "RoleCard.vue");
let text = fs.readFileSync(filePath, "utf8");

text = text.replace(
  ':disabled="Boolean(selectedDemonTargetId)"',
  ':disabled="Boolean(selectedDemonTargetId) || dayNumber === 1"'
);
text = text.replace(
  ':disabled="Boolean(selectedDemonTargetId)" @change="toggleSuicide"',
  ':disabled="Boolean(selectedDemonTargetId) || dayNumber === 1" @change="toggleSuicide"'
);
if (!text.includes("首夜恶魔不能杀人")) {
  text = text.replace(
    '自杀（仅当你确定要转移恶魔时）\\n      </label>\\n      <p v-if="!demonReady" class="muted hint">',
    '自杀（仅当你确定要转移恶魔时）\\n      </label>\\n      <p v-if="dayNumber === 1" class="muted hint">首夜恶魔不能杀人。</p>\\n      <p v-if="!demonReady" class="muted hint">'
  );
}

fs.writeFileSync(filePath, text, "utf8");
