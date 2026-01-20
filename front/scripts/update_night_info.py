import re
from pathlib import Path

path = Path(r"e:/桌面/Blood-on-the-Clocktower/src/App.vue")
text = path.read_text(encoding="utf-8")

replace_call = (
    "if (!nightInfoDelivered.value[player.id]) {\n"
    "          deliverInfo(player);\n"
    "          nightInfoDelivered.value = { ...nightInfoDelivered.value, [player.id]: true };\n"
    "        }"
)
text = text.replace("deliverInfo(player);", replace_call)

# Replace poisoner block in resolveNight
text = re.sub(
    r"\n\s*if\s*\(poisoner\)\s*\{[\s\S]*?\n\s*\}\n",
    "\n  if (poisoner && !nightPoisonApplied.value) {\n    applyPoisoner(poisoner);\n  }\n",
    text,
    count=1,
)

path.write_text(text, encoding="utf-8")
