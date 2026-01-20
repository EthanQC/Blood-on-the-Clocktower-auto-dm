const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "components", "RoleCard.vue");
let text = fs.readFileSync(filePath, "utf8");

text = text.replace(/const isDemon[^\n]*\n/, 'const isDemon = computed(() => props.player?.role?.type === "恶魔");\n');

if (!text.includes("const demonTargets")) {
  text = text.replace(
    /const livingOthers[^\n]*\n/,
    (match) => `${match}const demonTargets = computed(() => livingOthers.value);\n`
  );
}

if (!text.includes("const suicideChecked")) {
  text = text.replace(
    /const updateDemonTarget[\s\S]*?\n};\n/,
    (match) =>
      `${match}\nconst suicideChecked = computed(() => selectedDemonTargetId.value === props.player?.id);\n\n` +
      `const toggleSuicide = (event) => {\n` +
      `  if (!props.player?.id) {\n` +
      `    return;\n` +
      `  }\n` +
      `  const nextId = event.target.checked ? props.player.id : "";\n` +
      `  emit("update-night-selection", {\n` +
      `    playerId: props.player.id,\n` +
      `    selection: { ...nightSelection.value, demonTargetId: nextId },\n` +
      `  });\n` +
      `};\n`
  );
}

if (!text.includes(".suicide")) {
  text = text.replace(
    /\.pair\s*\{[\s\S]*?\}\n/,
    (match) =>
      `${match}\n.suicide {\n` +
      `  display: flex;\n` +
      `  align-items: center;\n` +
      `  gap: 8px;\n` +
      `  font-size: 12px;\n` +
      `  color: var(--text-muted);\n` +
      `}\n`
  );
}

fs.writeFileSync(filePath, text, "utf8");
