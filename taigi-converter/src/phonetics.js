import { COMBINING_TO_TONE_NUM, COMBINING_PATTERN, TL_FINALS, TL_INITIALS } from "./tables.js";

export function parseSyllable(text) {
  const [bare, tone] = stripToneMark(text);
  const normalized = normalizeToTl(bare.toLowerCase());
  const [initial, final] = splitInitialFinal(normalized);
  const finalTone = tone || (isStopTone(final) ? "4" : "1");
  return [initial, final, finalTone];
}

export function stripToneMark(text) {
  const decomposed = text.normalize("NFD");
  const match = decomposed.match(COMBINING_PATTERN);
  if (!match) {
    const numMatch = decomposed.match(/[1-9]$/);
    if (numMatch) {
      const bare = decomposed.slice(0, numMatch.index);
      return [bare.normalize("NFC"), numMatch[0]];
    }
    return [text.normalize("NFC"), ""];
  }
  const mark = match[0];
  const bare = decomposed.replace(mark, "");
  let toneNum;
  if (mark === "\u030b") {
    toneNum = "9";
  } else {
    toneNum = COMBINING_TO_TONE_NUM[mark] || "";
  }
  return [bare.normalize("NFC"), toneNum];
}

export function isStopTone(final) {
  const cleaned = final.toLowerCase().replaceAll("nn", "");
  return cleaned.endsWith("p") || cleaned.endsWith("t") || cleaned.endsWith("k") || cleaned.endsWith("h");
}

export function normalizeToTl(text) {
  return text
    .replaceAll("ch", "ts")
    .replaceAll("ou", "oo")
    .replaceAll("o\u0358", "oo")
    .replaceAll("\u1e73", "ir")
    .replaceAll("o\u0324", "er")
    .replaceAll("e\u0358", "ee")
    .replaceAll("\u207f", "nn")
    .replaceAll("\u1d3a", "nn")
    .replaceAll("oa", "ua")
    .replaceAll("oe", "ue")
    .replaceAll("eng", "ing")
    .replaceAll("ek", "ik")
    .replaceAll("oonn", "onn");
}

export function splitInitialFinal(text) {
  for (let i = 0; i <= text.length; i++) {
    const initial = text.slice(0, i);
    if (TL_INITIALS.has(initial)) {
      const final = text.slice(i);
      if (TL_FINALS.has(final)) return [initial, final];
    }
  }
  throw new Error(`Cannot parse syllable: ${text}`);
}
