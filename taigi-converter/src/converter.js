import { isStopTone, normalizeToTl, parseSyllable, splitInitialFinal, stripToneMark } from "./phonetics.js";
import { toTl } from "./tl.js";
import { toPoj, toPojTrad } from "./poj.js";
import { fromZhuyin, toZhuyin } from "./zhuyin.js";
import { fromBraille, toBraille } from "./braille.js";
import { segmentWords } from "./segmenter.js";

const SYSTEMS = new Set(["tl", "poj", "zhuyin", "braille"]);
const TARGETS = new Set(["tl", "poj", "poj-trad", "zhuyin", "braille"]);

function pojAssembler(target) {
  return target === "poj-trad" ? toPojTrad : toPoj;
}

const SYLLABLE_RE = /([\p{Script=Latin}\p{M}ⁿᴺ]+[0-9]?)/gu;

export function convert(text, source, target) {
  if (!SYSTEMS.has(source)) throw new Error(`Unknown source system: ${source}`);
  if (!TARGETS.has(target)) throw new Error(`Unknown target system: ${target}`);
  if (source === target) return text;
  if (source === "zhuyin") {
    const numbered = segmentWords(fromZhuyin(text));
    if (target === "braille") return toBraille(numbered);
    return toToneMark(numbered, target);
  }

  if (source === "braille") {
    const numbered = fromBraille(text);
    if (target === "tl") return toToneMark(numbered, "tl");
    return convert(numbered, "tl", target);
  }

  if (target === "braille") {
    return toBraille(toToneNumber(text));
  }

  if (target === "zhuyin") {
    const numbered = toToneNumber(text);
    return numbered.split("\n").map(line => {
      const parts = [];
      line.split(" ").forEach(word => {
        const prefix = word.startsWith("--") ? "--" : "";
        const bare = prefix ? word.slice(2) : word;
        bare.split("-").forEach((t, i) => {
          if (!t) return;
          const tps = toZhuyin((i === 0 ? prefix : "") + t).trimEnd();
          tps.split(/([。，？．「」]+)/).forEach(s => {
            if (s) parts.push(s);
          });
        });
      });
      return parts.join(" ");
    }).join("\n");
  }

  const assembler = target === "tl" ? toTl : pojAssembler(target);
  return text.replace(SYLLABLE_RE, (match) => {
    try {
      const [initial, final, tone] = parseSyllable(match);
      const caseType = detectCase(match);
      const result = assembler(initial, final, tone);
      return applyCase(result, caseType);
    } catch {
      return match;
    }
  });
}

export function toToneNumber(text) {
  const decomposed = text.normalize("NFD");
  const result = [];
  let i = 0;
  while (i < decomposed.length) {
    const ch = decomposed[i];
    if (/\p{L}/u.test(ch) || ch === "\u0358" || ch === "\u207f" || ch === "\u1d3a") {
      const syllableStart = i;
      while (i < decomposed.length && (
        /\p{L}/u.test(decomposed[i]) ||
        /^\p{M}/u.test(decomposed[i]) ||
        decomposed[i] === "\u0358" || decomposed[i] === "\u207f" || decomposed[i] === "\u1d3a"
      )) { i++; }
      if (i < decomposed.length && /[0-9]/.test(decomposed[i])) {
        result.push(decomposed.slice(syllableStart, i + 1));
        i++;
        continue;
      }
      const chunk = decomposed.slice(syllableStart, i);
      const nfcChunk = chunk.normalize("NFC");
      const [bare, tone] = stripToneMark(nfcChunk);
      if (tone) {
        result.push(bare.normalize("NFC") + tone);
      } else {
        const bareNfc = bare.normalize("NFC");
        try {
          const [, final] = splitInitialFinal(normalizeToTl(bareNfc.toLowerCase()));
          result.push(bareNfc + (isStopTone(final) ? "4" : "1"));
        } catch {
          result.push(bareNfc);
        }
      }
    } else {
      result.push(decomposed[i]);
      i++;
    }
  }
  return result.join("");
}

export function toToneNumberAscii(text) {
  return toToneNumber(text)
    .replaceAll("o͘", "oo")
    .replaceAll("O͘", "OO")
    .replaceAll("ⁿ", "nn")
    .replaceAll("ᴺ", "NN");
}

export function toToneMark(text, system = "tl") {
  const assembler = system === "tl" ? toTl : pojAssembler(system);
  return text.replace(SYLLABLE_RE, (match) => {
    if (!/[0-9]$/.test(match)) return match;
    try {
      const [initial, final, tone] = parseSyllable(match);
      const caseType = detectCase(match);
      const result = assembler(initial, final, tone);
      return applyCase(result, caseType);
    } catch {
      return match;
    }
  });
}

function detectCase(text) {
  const alpha = [...text].filter(c => /\p{L}/u.test(c)).join("");
  if (!alpha) return "lower";
  if (alpha === alpha.toUpperCase()) return "upper";
  if (alpha[0] === alpha[0].toUpperCase()) return "title";
  return "lower";
}

function applyCase(text, caseType) {
  if (caseType === "upper") return text.toUpperCase().replaceAll("\u207f", "\u1d3a");
  if (caseType === "title") return text ? text[0].toUpperCase() + text.slice(1) : text;
  return text;
}
