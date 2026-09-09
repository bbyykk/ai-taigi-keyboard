import { describe, it } from "node:test";
import { strictEqual, throws } from "node:assert";
import { isStopTone, parseSyllable, stripToneMark } from "../src/phonetics.js";

describe("stripToneMark", () => {
  it("acute accent tone 2", () => {
    const [bare, tone] = stripToneMark("\u00e1");
    strictEqual(bare, "a");
    strictEqual(tone, "2");
  });

  it("grave accent tone 3", () => {
    const [bare, tone] = stripToneMark("\u00e0");
    strictEqual(bare, "a");
    strictEqual(tone, "3");
  });

  it("circumflex tone 5", () => {
    const [bare, tone] = stripToneMark("\u00e2");
    strictEqual(bare, "a");
    strictEqual(tone, "5");
  });

  it("macron tone 7", () => {
    const [bare, tone] = stripToneMark("\u0101");
    strictEqual(bare, "a");
    strictEqual(tone, "7");
  });

  it("vertical line tone 8", () => {
    const [bare, tone] = stripToneMark("a\u030d");
    strictEqual(bare, "a");
    strictEqual(tone, "8");
  });

  it("breve tone 9", () => {
    const [bare, tone] = stripToneMark("\u0103");
    strictEqual(bare, "a");
    strictEqual(tone, "9");
  });

  it("double acute tone 9", () => {
    const [bare, tone] = stripToneMark("a\u030b");
    strictEqual(bare, "a");
    strictEqual(tone, "9");
  });

  it("no tone mark", () => {
    const [bare, tone] = stripToneMark("a");
    strictEqual(bare, "a");
    strictEqual(tone, "");
  });

  it("tone number suffix", () => {
    const [bare, tone] = stripToneMark("ka2");
    strictEqual(bare, "ka");
    strictEqual(tone, "2");
  });

  it("multi char syllable", () => {
    const [bare, tone] = stripToneMark("tshi\u016b");
    strictEqual(bare, "tshiu");
    strictEqual(tone, "7");
  });
});

describe("isStopTone", () => {
  it("p ending", () => strictEqual(isStopTone("ap"), true));
  it("t ending", () => strictEqual(isStopTone("at"), true));
  it("k ending", () => strictEqual(isStopTone("ak"), true));
  it("h ending", () => strictEqual(isStopTone("ah"), true));

  it("non stop", () => {
    strictEqual(isStopTone("a"), false);
    strictEqual(isStopTone("an"), false);
    strictEqual(isStopTone("ang"), false);
  });

  it("nasal with h", () => strictEqual(isStopTone("annh"), true));
});

describe("parseSyllable", () => {
  it("simple syllable", () => {
    const [initial, final, tone] = parseSyllable("ka2");
    strictEqual(initial, "k");
    strictEqual(final, "a");
    strictEqual(tone, "2");
  });

  it("tone marked syllable", () => {
    const [initial, final, tone] = parseSyllable("k\u00e1");
    strictEqual(initial, "k");
    strictEqual(final, "a");
    strictEqual(tone, "2");
  });

  it("no initial", () => {
    const [initial, final, tone] = parseSyllable("a1");
    strictEqual(initial, "");
    strictEqual(final, "a");
    strictEqual(tone, "1");
  });

  it("complex final", () => {
    const [initial, final, tone] = parseSyllable("kang1");
    strictEqual(initial, "k");
    strictEqual(final, "ang");
    strictEqual(tone, "1");
  });

  it("stop tone inferred", () => {
    const [initial, final, tone] = parseSyllable("kah");
    strictEqual(initial, "k");
    strictEqual(final, "ah");
    strictEqual(tone, "4");
  });

  it("tone 1 inferred", () => {
    const [initial, final, tone] = parseSyllable("ka");
    strictEqual(initial, "k");
    strictEqual(final, "a");
    strictEqual(tone, "1");
  });

  it("aspirated initial", () => {
    const [initial, final, tone] = parseSyllable("pha3");
    strictEqual(initial, "ph");
    strictEqual(final, "a");
    strictEqual(tone, "3");
  });

  it("tsh initial", () => {
    const [initial, final, tone] = parseSyllable("tshiu7");
    strictEqual(initial, "tsh");
    strictEqual(final, "iu");
    strictEqual(tone, "7");
  });

  it("poj ch converts to ts", () => {
    const [initial, final, tone] = parseSyllable("chhi2");
    strictEqual(initial, "tsh");
    strictEqual(final, "i");
    strictEqual(tone, "2");
  });

  it("poj oa converts to ua", () => {
    const [initial, final, tone] = parseSyllable("koa1");
    strictEqual(initial, "k");
    strictEqual(final, "ua");
    strictEqual(tone, "1");
  });

  it("poj oe converts to ue", () => {
    const [initial, final, tone] = parseSyllable("koe1");
    strictEqual(initial, "k");
    strictEqual(final, "ue");
    strictEqual(tone, "1");
  });

  it("poj eng converts to ing", () => {
    const [initial, final, tone] = parseSyllable("peng5");
    strictEqual(initial, "p");
    strictEqual(final, "ing");
    strictEqual(tone, "5");
  });

  it("ng syllable", () => {
    const [initial, final, tone] = parseSyllable("ng5");
    strictEqual(initial, "");
    strictEqual(final, "ng");
    strictEqual(tone, "5");
  });

  it("m syllable", () => {
    const [initial, final, tone] = parseSyllable("m7");
    strictEqual(initial, "");
    strictEqual(final, "m");
    strictEqual(tone, "7");
  });

  it("invalid syllable", () => {
    throws(() => parseSyllable("xyz"), /Cannot parse syllable/);
  });

  // Special / dialectal finals — see knowledge/taigi-phonetics-reference.md §3.2.6.
  // Pattern siblings: irinn / irk / irp / irt / irm already in TL_FINALS;
  // er / erh / erm / ere / ereh already present; ee already present.
  // iri / erk / eeh follow the same dialectal pattern (non-nasalized iri form,
  // entering-tone variant of er, entering-tone variant of ee).
  it("special final iri", () => {
    const [initial, final, tone] = parseSyllable("iri1");
    strictEqual(initial, "");
    strictEqual(final, "iri");
    strictEqual(tone, "1");
  });

  it("special final erk (stop tone inferred)", () => {
    const [initial, final, tone] = parseSyllable("kerk");
    strictEqual(initial, "k");
    strictEqual(final, "erk");
    strictEqual(tone, "4");
  });

  it("special final eeh (stop tone inferred)", () => {
    const [initial, final, tone] = parseSyllable("keeh");
    strictEqual(initial, "k");
    strictEqual(final, "eeh");
    strictEqual(tone, "4");
  });
});
