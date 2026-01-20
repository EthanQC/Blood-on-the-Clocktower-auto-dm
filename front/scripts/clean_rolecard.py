from pathlib import Path
import re

path = Path(r"e:/桌面/Blood-on-the-Clocktower/src/components/RoleCard.vue")
text = path.read_text(encoding="utf-8")

# Normalize demon type and remove legacy isDemon line if present.
text = re.sub(
    r"^const isDemonFixed.*$",
    'const isDemonFixed = computed(() => props.player?.role?.type === "恶魔");',
    text,
    flags=re.M,
)
text = re.sub(r"^const isDemon\\b.*$", "", text, flags=re.M)

# Deduplicate demonTargets line.
text = text.replace(
    "const demonTargets = computed(() => livingOthers.value);\n"
    "const demonTargets = computed(() => livingOthers.value);\n",
    "const demonTargets = computed(() => livingOthers.value);\n",
)

# Deduplicate suicideChecked/toggleSuicide block.
pattern = re.compile(r"const suicideChecked[\\s\\S]*?^};\\n", re.M)
seen = False
def keep_first(match):
    global seen
    if not seen:
        seen = True
        return match.group(0)
    return ""
text = pattern.sub(keep_first, text)

path.write_text(text, encoding="utf-8")
