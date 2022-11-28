import packageJSON from "./package.json" assert { type: "json" }

const v = packageJSON.version

console.log(v)
