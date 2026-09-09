import { readFileSync, writeFileSync } from "node:fs";
import { stripToneMark } from "../src/phonetics.js";

const csv = readFileSync(new URL("../dictionary.csv", import.meta.url), "utf-8");
const lines = csv.split("\n").map(l => l.trim()).filter(Boolean);

const seen = new Set();
const multiSyllable = [];
for (const line of lines) {
  if (seen.has(line)) continue;
  seen.add(line);
  if (line.includes("-")) multiSyllable.push(line);
}

const trie = {};
for (const entry of multiSyllable) {
  const key = entry.replace(/--/g, "-");
  const syllables = key.split("-").map(s => stripToneMark(s)[0].toLowerCase());
  let node = trie;
  for (const syl of syllables) {
    if (!node[syl]) node[syl] = {};
    node = node[syl];
  }
  node[""] = 1;
}

const json = JSON.stringify(trie, null, 0);
writeFileSync(
  new URL("../src/dictionary.js", import.meta.url),
  `export default ${json};\n`
);

const keyCount = multiSyllable.length;
console.log(`Built trie from ${keyCount} multi-syllable entries`);
