const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "components", "RoleCard.vue");
let text = fs.readFileSync(filePath, "utf8");

text = text.replace(
  'case "imp":\\n      return Boolean(selectedDemonTargetId.value);',
  'case "imp":\\n      return props.dayNumber === 1 ? true : Boolean(selectedDemonTargetId.value);'
);

fs.writeFileSync(filePath, text, "utf8");
