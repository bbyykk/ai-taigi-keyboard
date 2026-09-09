import {
  BRAILLE_INITIALS, BRAILLE_FINALS, BRAILLE_TONES,
  BRAILLE_NASAL, BRAILLE_KHIN, BRAILLE_PUNCTUATION
} from "./tables.js";
import { parseSyllable } from "./phonetics.js";
import { toTl } from "./tl.js";

const TOKEN_RE = /[\p{Script=Latin}\p{M}ⁿᴺ]+[0-9]?|--|./gsu;

const BRAILLE_RE = /[⠁-⣿]/;

const REV_INITIALS = new Map(
  [...BRAILLE_INITIALS].filter(([tl]) => tl).map(([tl, cell]) => [cell, tl])
);
const REV_FINALS = new Map([...BRAILLE_FINALS].map(([tl, cell]) => [cell, tl]));
const REV_TONES = new Map();
for (const [num, cell] of BRAILLE_TONES) {
  if (!REV_TONES.has(cell)) REV_TONES.set(cell, num);
}
const REV_PUNCT_PAIRS = [
  ["⠠⠦", "'"], ["⠠⠴", "'"], ["⠐⠣", "("], ["⠐⠜", ")"],
  ["⠂", ","], ["⠲", "."], ["⠖", "!"], ["⠆", ";"], ["⠒", ":"], ["⠴", '"']
];

export function syllableToBraille(initial, final, tone) {
  const initialCell = BRAILLE_INITIALS.get(initial);
  const toneCell = BRAILLE_TONES.get(tone);
  let base = final;
  let nasal = false;
  if (base.endsWith("nnh")) {
    nasal = true;
    base = base.slice(0, -3);
  } else if (base.endsWith("nn")) {
    nasal = true;
    base = base.slice(0, -2);
  } else if (base.endsWith("h")) {
    base = base.slice(0, -1);
  } else if (base.endsWith("p")) {
    base = base.slice(0, -1) + "m";
  } else if (base.endsWith("t")) {
    base = base.slice(0, -1) + "n";
  } else if (base.endsWith("k")) {
    base = base.slice(0, -1) + "ng";
  }
  const finalCell = BRAILLE_FINALS.get(base);
  if (initialCell === undefined || finalCell === undefined || toneCell === undefined) {
    return null;
  }
  return (nasal ? BRAILLE_NASAL : "") + initialCell + finalCell + toneCell;
}

function encodeToken(token) {
  try {
    const [initial, final, tone] = parseSyllable(token);
    const cells = syllableToBraille(initial, final, tone);
    if (cells !== null) return cells;
    return toTl(initial, final, tone);
  } catch {
    return token;
  }
}

export function isBraille(text) {
  return BRAILLE_RE.test(text);
}

function rebuildFinal(base, tone, nasal) {
  const stop = tone === "4" || tone === "8";
  if (nasal) {
    if (!/[aiueo]$/.test(base)) return null;
    return base + "nn" + (stop ? "h" : "");
  }
  if (!stop) return base;
  if (base === "m" || base === "ng") return base + "h";
  if (base.endsWith("ng")) return base.slice(0, -2) + "k";
  if (base.endsWith("m")) return base.slice(0, -1) + "p";
  if (base.endsWith("n")) return base.slice(0, -1) + "t";
  return base + "h";
}

function readSyllable(text, start) {
  let i = start;
  let nasal = false;
  if (text[i] === BRAILLE_NASAL) {
    nasal = true;
    i++;
  }
  for (const withInitial of [true, false]) {
    let j = i;
    let initial = "";
    if (withInitial) {
      initial = REV_INITIALS.get(text[j]);
      if (initial === undefined) continue;
      j++;
    }
    const base = REV_FINALS.get(text[j]);
    if (base === undefined) continue;
    j++;
    const tone = REV_TONES.get(text[j]);
    if (tone === undefined) continue;
    j++;
    const final = rebuildFinal(base, tone, nasal);
    if (final === null) continue;
    return { length: j - start, value: initial + final + tone };
  }
  return null;
}

export function fromBraille(text) {
  const parts = [];
  let i = 0;
  while (i < text.length) {
    const syllable = readSyllable(text, i);
    if (syllable) {
      parts.push({ type: "syllable", value: syllable.value });
      i += syllable.length;
      continue;
    }
    if (text.startsWith(BRAILLE_KHIN, i)) {
      parts.push({ type: "khin" });
      i += BRAILLE_KHIN.length;
      continue;
    }
    if (text[i] === "⠀") {
      if (!/\s/.test(text[i + 1] ?? " ")) parts.push({ type: "other", value: " " });
      i++;
      continue;
    }
    if (text[i] === "⠦") {
      const next = text[i + 1] ?? "⠀";
      parts.push({ type: "other", value: next === "⠀" || /\s/.test(next) ? "?" : '"' });
      i++;
      continue;
    }
    let matched = false;
    for (const [cells, ascii] of REV_PUNCT_PAIRS) {
      if (text.startsWith(cells, i)) {
        parts.push({ type: "other", value: ascii });
        i += cells.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    parts.push({ type: "other", value: text[i] });
    i++;
  }

  let result = "";
  for (let k = 0; k < parts.length; k++) {
    const part = parts[k];
    if (part.type === "khin") {
      result += "--";
      continue;
    }
    if (part.type === "syllable" && parts[k - 1]?.type === "syllable") {
      result += "-";
    }
    result += part.value;
  }
  return result;
}

export function toBraille(text) {
  let result = "";
  let quoteOpen = false;
  for (const match of text.matchAll(TOKEN_RE)) {
    const token = match[0];
    if (token === "--") {
      result += BRAILLE_KHIN;
      continue;
    }
    if (token === "-") continue;
    if (/^[\p{Script=Latin}ⁿᴺ]/u.test(token)) {
      result += encodeToken(token);
      continue;
    }
    if (token === '"') {
      result += quoteOpen ? "⠴⠀" : "⠦";
      quoteOpen = !quoteOpen;
      continue;
    }
    const punct = BRAILLE_PUNCTUATION.get(token);
    result += punct !== undefined ? punct : token;
  }
  return result;
}
