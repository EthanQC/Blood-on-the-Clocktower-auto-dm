from pathlib import Path

path = Path(r"e:/桌面/Blood-on-the-Clocktower/src/App.vue")
text = path.read_text(encoding="utf-8")

old = (
    'const demon = activePlayers.value.find((player) => player.alive && player.role?.type === "恶魔");\n'
    "    if (demon) {\n"
)
new = (
    'const demon = activePlayers.value.find((player) => player.alive && player.role?.type === "恶魔");\n'
    "    if (demon && dayNumber.value > 1) {\n"
)

if old in text:
    text = text.replace(old, new, 1)

path.write_text(text, encoding="utf-8")
