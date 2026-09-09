import { TONE_NUM_TO_COMBINING } from "./tables.js";

export function toTl(initial, final, tone) {
  let mark = TONE_NUM_TO_COMBINING[tone] || "";
  if (tone === "9") mark = "\u030b";
  const markedFinal = placeTlToneMark(final, mark);
  return (initial + markedFinal).normalize("NFC");
}

function placeTlToneMark(final, mark) {
  if (!mark) return final;
  if (final.includes("a")) return final.replace("a", "a" + mark);
  if (final.includes("oo")) return final.replace("oo", "o" + mark + "o");
  if (final.includes("ere")) return final.replace("ere", "ere" + mark);
  if (final.includes("e")) return final.replace("e", "e" + mark);
  if (final.includes("o")) return final.replace("o", "o" + mark);
  if (final.includes("ui")) return final.replace("i", "i" + mark);
  if (final.includes("iu")) return final.replace("u", "u" + mark);
  if (final.includes("iri")) return final.replace("iri", "iri" + mark);
  if (final.includes("i")) return final.replace("i", "i" + mark);
  if (final.includes("u")) return final.replace("u", "u" + mark);
  if (final.includes("ng")) return final.replace("ng", "n" + mark + "g");
  if (final.includes("m")) return final.replace("m", "m" + mark);
  return final;
}
