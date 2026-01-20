const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "components", "RoleCard.vue");
let text = fs.readFileSync(filePath, "utf8");

text = text.replace(
  /const isDemonFixed[^\n]*\n/g,
  'const isDemonFixed = computed(() => props.player?.role?.type === "\\u6076\\u9b54");\n'
);
text = text.replace(/const isDemon[^\n]*\n/g, "");

text = text.replace(
  ':disabled="Boolean(selectedDemonTargetId)"',
  ':disabled="Boolean(selectedDemonTargetId) || dayNumber === 1"'
);
text = text.replace(
  ':disabled="Boolean(selectedDemonTargetId)" @change="toggleSuicide"',
  ':disabled="Boolean(selectedDemonTargetId) || dayNumber === 1" @change="toggleSuicide"'
);
text = text.replace(
  '</label>\n      <p v-if="!demonReady" class="muted hint">',
  '</label>\n      <p v-if="dayNumber === 1" class="muted hint">首夜恶魔不能杀人。</p>\n      <p v-if="!demonReady" class="muted hint">'
);

text = text.replace(
  'case "imp":\n      return Boolean(selectedDemonTargetId.value);',
  'case "imp":\n      return props.dayNumber === 1 ? true : Boolean(selectedDemonTargetId.value);'
);

fs.writeFileSync(filePath, text, "utf8");
