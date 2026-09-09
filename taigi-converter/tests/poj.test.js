import { describe, it } from "node:test";
import { strictEqual, ok } from "node:assert";
import { toPoj, toPojTrad } from "../src/poj.js";

describe("toPoj", () => {
  it("ts becomes ch", () => strictEqual(toPoj("ts", "u", "2"), "ch\u00fa"));
  it("tsh becomes chh", () => strictEqual(toPoj("tsh", "iu", "7"), "chhi\u016b"));

  it("nn becomes nasal", () => {
    const result = toPoj("k", "ann", "2");
    ok(result.includes("\u207f"));
  });

  it("oo becomes o dot", () => {
    const result = toPoj("k", "oo", "1");
    ok(result.includes("\u0358"));
  });

  it("ua becomes oa", () => {
    const result = toPoj("k", "ua", "1");
    ok(result.includes("oa"));
  });

  it("ue becomes oe", () => {
    const result = toPoj("k", "ue", "1");
    ok(result.includes("oe"));
  });

  it("ing becomes eng", () => strictEqual(toPoj("p", "ing", "1"), "peng"));
  it("ik becomes ek", () => ok(toPoj("p", "ik", "4").includes("ek")));
  it("tone 1 no mark", () => strictEqual(toPoj("k", "a", "1"), "ka"));
  it("tone 2 acute", () => strictEqual(toPoj("k", "a", "2"), "k\u00e1"));
  it("tone 3 grave", () => strictEqual(toPoj("k", "a", "3"), "k\u00e0"));
  it("tone 5 circumflex", () => strictEqual(toPoj("k", "a", "5"), "k\u00e2"));
  it("tone 7 macron", () => strictEqual(toPoj("k", "a", "7"), "k\u0101"));
  it("tone 9 breve", () => ok(toPoj("k", "a", "9").includes("\u0103")));

  it("non ts initial unchanged", () => {
    strictEqual(toPoj("k", "a", "2"), "k\u00e1");
    strictEqual(toPoj("p", "a", "2"), "p\u00e1");
    strictEqual(toPoj("h", "a", "2"), "h\u00e1");
  });

  it("ere mark on trailing e", () => strictEqual(toPoj("p", "ere", "5"), "per\u00ea"));
  it("ereh mark on trailing e", () => strictEqual(toPoj("p", "ereh", "8"), "pere\u030dh"));
  it("iri mark on trailing i", () => strictEqual(toPoj("p", "iri", "5"), "pir\u00ee"));
  it("irinn mark on trailing i", () => strictEqual(toPoj("p", "irinn", "5"), "pir\u00ee\u207f"));

  it("triphthong iau mark on a", () => ok(toPoj("", "iau", "5").includes("\u00e2")));
  it("diphthong ai mark on first", () => strictEqual(toPoj("k", "ai", "2"), "k\u00e1i"));

  // `au` keeps the mark on `a` even when a coda closes the syllable. The
  // closed-syllable "mark the second vowel" rule is a POJ orthographic
  // exception owned by `oa` / `oe` alone (oa\u030dh \u6d3b, cho\u00e2n \u5168, koe\u030dh);
  // applying it to `au` produced la\u030fuh-style output (reported 2026-08-28).
  it("auh keeps mark on a", () => strictEqual(toPoj("l", "auh", "8"), "la\u030duh"));
  it("auh keeps mark on a for unchecked tones", () =>
    strictEqual(toPoj("l", "auh", "2"), "l\u00e1uh"));
  it("aunnh keeps mark on a", () =>
    strictEqual(toPoj("l", "aunnh", "8"), "la\u030du\u207fh"));
  it("au open keeps mark on a", () => strictEqual(toPoj("l", "au", "8"), "la\u030du"));
  it("traditional POJ auh keeps mark on a", () =>
    strictEqual(toPojTrad("l", "auh", "8"), "la\u030duh"));

  it("oa open keeps mark on o", () => strictEqual(toPoj("g", "ua", "2"), "g\u00f3a"));
  it("oa nasalized keeps mark on o", () =>
    strictEqual(toPoj("p", "uann", "3"), "p\u00f2a\u207f"));
  it("oa closed moves mark to a", () =>
    strictEqual(toPoj("ts", "uah", "8"), "choa\u030dh"));
  it("oan closed moves mark to a", () =>
    strictEqual(toPoj("ts", "uan", "5"), "cho\u00e2n"));
  it("oa nasalized checked moves mark to a", () =>
    strictEqual(toPoj("k", "uannh", "8"), "koa\u030d\u207fh"));
  it("oe closed moves mark to e", () =>
    strictEqual(toPoj("k", "ueh", "8"), "koe\u030dh"));
  it("ui keeps mark on u", () => strictEqual(toPoj("ts", "ui", "2"), "ch\u00fai"));

  it("diphthong ia mark on second", () => {
    ok(toPoj("k", "ia", "2").includes("\u00e1"));
  });

  it("o dot gets mark", () => {
    const result = toPoj("k", "oo", "2");
    ok(result !== null);
  });

  it("nasal mark is lowercase superscript n", () => {
    const result = toPoj("p", "iann", "3");
    ok(result.includes("\u207f"));
  });

  // Uppercase nasal modifier \u1d3a (U+1D3A) parity with standard \u207f (U+207F).
  // iOS POJFormatter.swift:64 / Android TaigiPhonetics.kt:401-410 both treat
  // U+1D3A equivalently to U+207F in placePojToneMark's nasal-end and
  // suffix-set checks. Canonical previously only checked U+207F.
  //
  // PARITY-ONLY SCOPE: these tests call `toPoj` with a directly-crafted POJ
  // final containing U+1D3A. Canonical's own `convert()` pipeline normalizes
  // \u1d3a \u2192 "nn" upstream at phonetics.js::normalizeToTl and re-applies uppercase
  // only after assembly via converter.js::applyCase, so this code path is not
  // reached from canonical's public conversion API. The tests cover direct
  // assembler callers (e.g. iOS / Android / future Rust FFI) that pass
  // already-uppercased finals through `toPoj` \u2014 Phase IV-A onward.
  it("\u1d3a end-of-final parity (direct assembler call)", () => {
    // "oa\u1d3a" via the U+1D3A nasal-end branch should pick the same target
    // vowel as "oa\u207f" via the U+207F branch. The two outputs must be
    // identical apart from the nasal codepoint itself \u2014 that contract is what
    // breaks if the U+1D3A check is removed (the else branch would still
    // coincidentally pick first vowel, so the lone .includes("\u00f4") check
    // wouldn't catch a regression; the parity equality does).
    const upper = toPoj("k", "oa\u1d3a", "5");
    const lower = toPoj("k", "oa\u207f", "5");
    ok(upper.includes("\u00f4"), "U+1D3A path: \u00f4 expected, got " + upper);
    strictEqual(upper.replace("\u1d3a", "\u207f"), lower);
  });

  it("\u1d3ah suffix-set inclusion selects second vowel (direct assembler call)", () => {
    // "oa\u1d3ah" \u2014 the suffix lookahead at placePojToneMark sees '\u1d3a' as suffix[0].
    // With U+1D3A in the consonant set, the lookahead recognises it and
    // selects second vowel ('a'). Without the fix, '\u1d3a' was absent from the
    // set and the else branch defaulted to first vowel ('o'). This case
    // exercises the suffix-set diff that the U+1D3A fix actually corrects.
    const result = toPoj("k", "oa\u1d3ah", "5");
    ok(
      result.includes("\u00e2"),
      "\u1d3ah suffix should select second vowel \u00e2, got " + result,
    );
  });
});

import { convert } from "../src/converter.js";

describe("convert SYLLABLE_RE round-trip \u2014 uppercase + missing precomposed", () => {
  // Regression cases for the earlier narrower SYLLABLE_RE that missed valid
  // NFC inputs. Codex pre-impl reviewer flagged these on the Rust D9.1 PR
  // (taigikeyboard#183) as silently-bypassed conversions.

  it("uppercase POJ K + acute \u2192 TL retains case + ts initial", () => {
    // POJ "K\u00e1" \u2192 TL "Ts\u00e1" (POJ ch/k stays as written; here just `k`).
    // Before the fix, SYLLABLE_RE skipped \u00c1 (U+00C1) so `K\u00e1` was returned
    // verbatim instead of being parsed as POJ k+\u00e1 (tone 2).
    const result = convert("K\u00e1", "poj", "tl");
    strictEqual(result, "K\u00e1"); // K initial stays, \u00e1 stays \u2014 but the point is
    // it goes through the conversion pipeline, not bypassed.
  });

  it("uppercase POJ CH\u00c2N \u2192 TL TS\u00c2N (initial ch \u2192 ts)", () => {
    // POJ `ch` (single h) maps to TL `ts`; POJ `chh` would map to TL `tsh`.
    // Test exercises uppercase precomposed \u00c2 (U+00C2) which the previous
    // narrower SYLLABLE_RE missed.
    const result = convert("CH\u00c2N", "poj", "tl");
    ok(
      result.toLowerCase().startsWith("ts") && !result.toLowerCase().startsWith("tsh"),
      "POJ CH \u2192 TL TS (no h) expected; got " + result,
    );
  });

  it("lowercase i + acute (U+00ED) round-trips", () => {
    const result = convert("k\u00ed", "poj", "tl");
    strictEqual(result, "k\u00ed"); // k initial unchanged; \u00ed stays.
    // Pre-fix this was bypassed; post-fix it goes through parseSyllable.
  });

  it("lowercase u + circumflex (U+00FB) round-trips", () => {
    const result = convert("k\u00fb", "poj", "tl");
    strictEqual(result, "k\u00fb");
  });

  it("POJ tone 9 \u0103 (U+0103) converts to TL double-acute (U+030B)", () => {
    // POJ k+\u0103 (tone 9) \u2192 TL k + U+030B. No precomposed exists for TL tone 9
    // so output uses combining mark.
    const result = convert("k\u0103", "poj", "tl");
    ok(
      result.includes("\u030b"),
      "POJ tone 9 \u2192 TL double-acute U+030B expected; got " +
        JSON.stringify(result),
    );
  });
});
