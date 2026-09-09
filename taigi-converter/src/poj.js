import {
  POJ_FINAL_SUBS, POJ_INITIAL_FROM_TL, POJ_TRAD_CH_FINAL_INITIALS,
  POJ_TRAD_FINAL_SUBS, TONE_NUM_TO_COMBINING
} from "./tables.js";

export function toPojTrad(initial, final, tone) {
  const pojFinal = applyFinalSubs(final, POJ_TRAD_FINAL_SUBS);
  const pojInitial = tradInitial(initial, pojFinal);
  let mark = TONE_NUM_TO_COMBINING[tone] || "";
  if (tone === "9") mark = final === "a" ? "̃" : "̆";
  const markedFinal = placePojToneMarkTrad(pojFinal, mark);
  return (pojInitial + markedFinal).normalize("NFC");
}

function tradInitial(initial, pojFinal) {
  if (initial === "tsh") return "chh";
  if (initial === "ts") return POJ_TRAD_CH_FINAL_INITIALS.has(pojFinal[0]) ? "ch" : "ts";
  return initial;
}

function placePojToneMarkTrad(final, mark) {
  if (!mark) return final;
  if (final.includes("ṳ")) return final.replace("ṳ", "ṳ" + mark);
  if (final.includes("o̤")) return final.replace("o̤", "o̤" + mark);
  if (final.includes("e͘")) return final.replace("e͘", "e" + mark + "͘");
  return placePojToneMark(final, mark);
}

export function toPoj(initial, final, tone) {
  const pojInitial = POJ_INITIAL_FROM_TL[initial] || initial;
  const pojFinal = applyFinalSubs(final, POJ_FINAL_SUBS);
  let mark = TONE_NUM_TO_COMBINING[tone] || "";
  if (tone === "9") mark = "\u0306";
  const markedFinal = placePojToneMark(pojFinal, mark);
  return (pojInitial + markedFinal).normalize("NFC");
}

function applyFinalSubs(final, subs) {
  let result = final;
  for (const [tlPart, pojPart] of subs) {
    result = result.replaceAll(tlPart, pojPart);
  }
  return result;
}

function placePojToneMark(final, mark) {
  if (!mark) return final;
  if (final.includes("o\u0358")) {
    return final.replace("o\u0358", "o" + mark + "\u0358");
  }
  if (/iau|oai/.test(final)) {
    return final.replace("a", "a" + mark);
  }
  if (final.includes("ere")) {
    return final.replace("ere", "ere" + mark);
  }
  if (final.includes("iri")) {
    return final.replace("iri", "iri" + mark);
  }
  const vowelsMatch = final.match(/[aeiou]{2}/);
  if (vowelsMatch) {
    const start = vowelsMatch.index;
    const first = final[start];
    const second = final[start + 1];
    const isOaOePair = first === "o" && (second === "a" || second === "e");
    const nasalWithoutHPrefix =
      (final.endsWith("\u207f") || final.endsWith("\u1d3a"))
      && !final.endsWith("h\u207f") && !final.endsWith("h\u1d3a");
    let target;
    if (first === "i") {
      target = second;
    } else if (isOaOePair && !nasalWithoutHPrefix) {
      const suffix = final.slice(start + 2);
      target = suffix && "nmgptkh\u207f\u1d3a".includes(suffix[0]) ? second : first;
    } else {
      target = first;
    }
    return final.replace(target, target + mark);
  }
  const single = final.match(/[aeiou]/);
  if (single) {
    const pos = single.index;
    return final.slice(0, pos) + final[pos] + mark + final.slice(pos + 1);
  }
  if (final.includes("ng")) return final.replace("n", "n" + mark);
  if (final.includes("m")) return final.replace("m", "m" + mark);
  return final;
}
