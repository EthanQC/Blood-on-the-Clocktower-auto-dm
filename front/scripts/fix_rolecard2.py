from pathlib import Path

path = Path(r"e:/桌面/Blood-on-the-Clocktower/src/components/RoleCard.vue")
text = path.read_text(encoding="utf-8")

text = text.replace(
    'const isDemonFixed = computed(() => props.player?.role?.type === "띳침");',
    'const isDemonFixed = computed(() => props.player?.role?.type === "恶魔");',
)
text = text.replace(
    'const isDemon = computed(() => props.player?.role?.type === "띳침");\n',
    "",
)
text = text.replace(
    "const demonTargets = computed(() => livingOthers.value);\n"
    "const demonTargets = computed(() => livingOthers.value);\n",
    "const demonTargets = computed(() => livingOthers.value);\n",
)

text = text.replace(
    "const suicideChecked = computed(() => selectedDemonTargetId.value === props.player?.id);\n\n"
    "const toggleSuicide = (event) => {\n"
    "  if (!props.player?.id) {\n"
    "    return;\n"
    "  }\n"
    "  const nextId = event.target.checked ? props.player.id : \"\";\n"
    "  emit(\"update-night-selection\", {\n"
    "    playerId: props.player.id,\n"
    "    selection: { ...nightSelection.value, demonTargetId: nextId },\n"
    "  });\n"
    "};\n\n"
    "const suicideChecked = computed(() => selectedDemonTargetId.value === props.player?.id);\n\n"
    "const toggleSuicide = (event) => {\n"
    "  if (!props.player?.id) {\n"
    "    return;\n"
    "  }\n"
    "  const nextId = event.target.checked ? props.player.id : \"\";\n"
    "  emit(\"update-night-selection\", {\n"
    "    playerId: props.player.id,\n"
    "    selection: { ...nightSelection.value, demonTargetId: nextId },\n"
    "  });\n"
    "};\n",
    "const suicideChecked = computed(() => selectedDemonTargetId.value === props.player?.id);\n\n"
    "const toggleSuicide = (event) => {\n"
    "  if (!props.player?.id) {\n"
    "    return;\n"
    "  }\n"
    "  const nextId = event.target.checked ? props.player.id : \"\";\n"
    "  emit(\"update-night-selection\", {\n"
    "    playerId: props.player.id,\n"
    "    selection: { ...nightSelection.value, demonTargetId: nextId },\n"
    "  });\n"
    "};\n",
)

path.write_text(text, encoding="utf-8")
