import trie from "./dictionary.js";

function stripToneNumber(syllable) {
  return syllable.replace(/[0-9]$/, "").toLowerCase();
}

function segmentRun(syllables) {
  const result = [];
  let i = 0;

  while (i < syllables.length) {
    let node = trie;
    let bestLen = 0;
    for (let j = i; j < syllables.length; j++) {
      const key = stripToneNumber(syllables[j]);
      if (!node[key]) break;
      node = node[key];
      if ("" in node && (j - i + 1) >= 2) {
        bestLen = j - i + 1;
      }
    }

    if (bestLen > 0) {
      result.push(syllables.slice(i, i + bestLen).join("-"));
      i += bestLen;
    } else {
      result.push(syllables[i]);
      i++;
    }
  }

  return result.join(" ");
}

function segmentLine(line) {
  const tokens = [];
  let current = "";

  for (const ch of line) {
    if (/[a-zA-Z0-9]/.test(ch) || ch === "-") {
      current += ch;
    } else {
      if (current) {
        tokens.push({ type: "run", value: current });
        current = "";
      }
      tokens.push({ type: "other", value: ch });
    }
  }
  if (current) tokens.push({ type: "run", value: current });

  return tokens.map((tok, i) => {
    if (tok.type !== "run") {
      const next = tokens[i + 1];
      if (/[,.?]/.test(tok.value) && next && next.type === "run") {
        return tok.value + " ";
      }
      return tok.value;
    }
    const syllables = tok.value.split("-").filter(Boolean);
    if (syllables.length <= 1) return tok.value;
    return segmentRun(syllables);
  }).join("");
}

export function segmentWords(text) {
  let out = text.split("\n").map(segmentLine).join("\n");
  if (/[,.?]/.test(out)) {
    out = out.replace(/[a-zA-Z]/, ch => ch.toUpperCase());
  }
  return out;
}
