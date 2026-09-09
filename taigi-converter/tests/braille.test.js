import { test } from "node:test";
import assert from "node:assert/strict";
import { convert } from "../src/converter.js";
import { toBraille, fromBraille, isBraille } from "../src/braille.js";

function tl(text) {
  return convert(text, "tl", "braille");
}

test("initials", () => {
  assert.equal(tl("pa pha ba ma ta tha na la"), "⠏⠁⠤ ⠋⠁⠤ ⠃⠁⠤ ⠍⠁⠤ ⠙⠁⠤ ⠞⠁⠤ ⠝⠁⠤ ⠇⠁⠤");
  assert.equal(tl("ka kha ga nga ha"), "⠟⠁⠤ ⠅⠁⠤ ⠛⠁⠤ ⠬⠁⠤ ⠓⠁⠤");
  assert.equal(tl("tsa tsha sa ja a"), "⠡⠁⠤ ⠉⠁⠤ ⠎⠁⠤ ⠚⠁⠤ ⠁⠤");
});

test("tones", () => {
  assert.equal(tl("pa pá pà pah pâ pā pa̍h"), "⠏⠁⠤ ⠏⠁⠂ ⠏⠁⠄ ⠏⠁⠢ ⠏⠁⠆ ⠏⠁⠒ ⠏⠁⠔");
  assert.equal(tl("pa̋"), "⠏⠁⠘");
  assert.equal(toBraille("pa6"), "⠏⠁⠂");
});

test("simple finals", () => {
  assert.equal(tl("i u e o oo m ng"), "⠊⠤ ⠥⠤ ⠑⠤ ⠕⠤ ⠪⠤ ⠍⠤ ⠬⠤");
});

test("compound finals", () => {
  assert.equal(tl("ai au ia io iu ua ue ui iau uai"), "⠜⠤ ⠳⠤ ⠽⠤ ⠗⠤ ⠱⠤ ⠺⠤ ⠫⠤ ⠷⠤ ⠹⠤ ⠾⠤");
});

test("nasal and stop-paired finals", () => {
  assert.equal(tl("am an ang im in ing"), "⠩⠤ ⠧⠤ ⠭⠤ ⠣⠤ ⠖⠤ ⠵⠤");
  assert.equal(tl("ong iam ian iang iong un uan"), "⠯⠤ ⠿⠤ ⠲⠤ ⠸⠤ ⠮⠤ ⠌⠤ ⠻⠤");
  assert.equal(tl("om op"), "⠼⠤ ⠼⠢");
});

test("entering tones share the sonorant final cell", () => {
  assert.equal(tl("ah ap at ak"), "⠁⠢ ⠩⠢ ⠧⠢ ⠭⠢");
  assert.equal(tl("ih ip it ik"), "⠊⠢ ⠣⠢ ⠖⠢ ⠵⠢");
  assert.equal(tl("oh ok uh ut ooh"), "⠕⠢ ⠯⠢ ⠥⠢ ⠌⠢ ⠪⠢");
  assert.equal(tl("tsha̍p tshi̍t si̍p"), "⠉⠩⠔ ⠉⠖⠔ ⠎⠣⠔");
  assert.equal(tl("o̍h lo̍h kio̍h"), "⠕⠔ ⠇⠕⠔ ⠟⠗⠔");
});

test("nasalized finals prefix dot six before the syllable", () => {
  assert.equal(tl("ann enn inn onn"), "⠠⠁⠤ ⠠⠑⠤ ⠠⠊⠤ ⠠⠕⠤");
  assert.equal(tl("uann uinn iann iunn ionn"), "⠠⠺⠤ ⠠⠷⠤ ⠠⠽⠤ ⠠⠱⠤ ⠠⠗⠤");
  assert.equal(tl("ainn uainn aunn iaunn"), "⠠⠜⠤ ⠠⠾⠤ ⠠⠳⠤ ⠠⠹⠤");
  assert.equal(tl("tiann sann tshiunn phinn"), "⠠⠙⠽⠤ ⠠⠎⠁⠤ ⠠⠉⠱⠤ ⠠⠋⠊⠤");
  assert.equal(tl("sannh"), "⠠⠎⠁⠢");
});

test("syllabic nasals", () => {
  assert.equal(tl("m̄ n̂g hng m̂"), "⠍⠒ ⠬⠆ ⠓⠬⠤ ⠍⠆");
  assert.equal(tl("nn̄g"), "⠝⠬⠒");
  assert.equal(tl("hmh ngh"), "⠓⠍⠢ ⠬⠢");
});

test("words drop hyphens and keep spaces", () => {
  assert.equal(tl("guá sī tâi-uân-lâng"), "⠛⠺⠂ ⠎⠊⠒ ⠙⠜⠆⠻⠆⠇⠭⠆");
  assert.equal(tl("kah-ì"), "⠟⠁⠢⠊⠄");
});

test("khin-siann double hyphen", () => {
  assert.equal(tl("tsia̍h--ah"), "⠡⠽⠔⠤⠤⠁⠢");
  assert.equal(tl("khin--khì"), "⠅⠖⠤⠤⠤⠅⠊⠄");
});

test("punctuation", () => {
  assert.equal(tl("lí hó, guá sī."), "⠇⠊⠂ ⠓⠕⠂⠂⠀ ⠛⠺⠂ ⠎⠊⠒⠲⠀");
  assert.equal(tl("án-tsuánn?"), "⠧⠂⠠⠡⠺⠂⠦⠀");
  assert.equal(tl("hó! sī; án:"), "⠓⠕⠂⠖⠀ ⠎⠊⠒⠆⠀ ⠧⠂⠒");
  assert.equal(tl("「hó」"), "⠦⠓⠕⠂⠴⠀");
  assert.equal(tl("“li” ‘ho’"), "⠦⠇⠊⠤⠴⠀ ⠠⠦⠓⠕⠤⠠⠴⠀");
  assert.equal(tl("(a)"), "⠐⠣⠁⠤⠐⠜⠀");
  assert.equal(tl('"li"'), "⠦⠇⠊⠤⠴⠀");
});

test("tone numbered input", () => {
  assert.equal(toBraille("hoo7-suann3-tsat4"), "⠓⠪⠒⠠⠎⠺⠄⠡⠧⠢");
  assert.equal(toBraille("lak8-gueh8-tang1"), "⠇⠭⠔⠛⠫⠔⠙⠭⠤");
});

test("unmappable syllables fall back to tone-marked romanization", () => {
  assert.equal(tl("uang uak"), "uang uak");
  assert.equal(tl("ua̍k"), "ua̍k".normalize("NFC"));
  assert.equal(tl("ir er ee"), "ir er ee");
});

test("digits and unknown characters pass through", () => {
  assert.equal(tl("123"), "123");
});

test("uppercase input converts case-insensitively", () => {
  assert.equal(tl("Guá Sī TÂI"), "⠛⠺⠂ ⠎⠊⠒ ⠙⠜⠆");
});

test("poj source", () => {
  assert.equal(convert("goá sī tâi-oân-lâng", "poj", "braille"), "⠛⠺⠂ ⠎⠊⠒ ⠙⠜⠆⠻⠆⠇⠭⠆");
  assert.equal(convert("chhân êng", "poj", "braille"), "⠉⠧⠆ ⠵⠆");
});

test("fromBraille decodes syllables", () => {
  assert.equal(fromBraille("⠓⠧⠤⠡⠊⠆ ⠍⠒⠠⠟⠽⠤ ⠇⠕⠔⠞⠪⠆ ⠝⠺⠒"), "han1-tsi5 m7-kiann1 loh8-thoo5 nua7");
  assert.equal(fromBraille("⠛⠺⠂ ⠎⠊⠒ ⠙⠜⠆⠻⠆⠇⠭⠆"), "gua2 si7 tai5-uan5-lang5");
});

test("braille source conversion", () => {
  assert.equal(convert("⠓⠧⠤⠡⠊⠆ ⠍⠒⠠⠟⠽⠤ ⠇⠕⠔⠞⠪⠆ ⠝⠺⠒", "braille", "tl"), "han-tsî m̄-kiann lo̍h-thôo nuā".normalize("NFC"));
  assert.equal(convert("⠓⠧⠤⠡⠊⠆", "braille", "poj"), "han-chî".normalize("NFC"));
  assert.equal(convert("⠛⠺⠂", "braille", "zhuyin"), "ㆣㄨㄚˋ");
});

test("fromBraille entering tones and nasals", () => {
  assert.equal(fromBraille("⠁⠢ ⠩⠢ ⠧⠢ ⠭⠢ ⠵⠢ ⠯⠢ ⠌⠢ ⠼⠢"), "ah4 ap4 at4 ak4 ik4 ok4 ut4 op4");
  assert.equal(fromBraille("⠠⠎⠁⠤ ⠠⠎⠁⠢ ⠠⠙⠽⠤"), "sann1 sannh4 tiann1");
  assert.equal(fromBraille("⠍⠒ ⠬⠆ ⠓⠬⠤ ⠝⠬⠒ ⠍⠢"), "m7 ng5 hng1 nng7 mh4");
});

test("fromBraille khin and punctuation", () => {
  assert.equal(fromBraille("⠡⠽⠔⠤⠤⠁⠢"), "tsiah8--ah4");
  assert.equal(fromBraille("⠅⠖⠤⠤⠤⠅⠊⠄"), "khin1--khi3");
  assert.equal(fromBraille("⠓⠕⠂⠂⠀ ⠛⠺⠂ ⠎⠊⠒⠲⠀"), "ho2, gua2 si7.");
  assert.equal(fromBraille("⠧⠂⠠⠡⠺⠂⠦⠀"), "an2-tsuann2?");
  assert.equal(fromBraille("⠦⠇⠊⠤⠴⠀"), '"li1"');
});

test("braille roundtrip", () => {
  const samples = [
    "guá sī tâi-uân-lâng",
    "hōo-suànn-tsat",
    "tsia̍h--ah",
    "kin-á-ji̍t thinn-khì tsin hó.",
    "tsi̍t nn̄g sann sì gōo la̍k tshit peh káu tsa̍p",
    "m̄ n̂g hng"
  ];
  for (const s of samples) {
    const braille = convert(s, "tl", "braille");
    assert.equal(convert(braille, "braille", "tl"), s.normalize("NFC"), s);
  }
});

test("isBraille", () => {
  assert.equal(isBraille("⠓⠧⠤"), true);
  assert.equal(isBraille("guá"), false);
  assert.equal(isBraille("⠀"), false);
});

test("zhuyin source", () => {
  assert.equal(convert("ㄍㄨㄚˋ", "zhuyin", "braille"), "⠟⠺⠂");
  assert.equal(convert("ㆣㄨㄚˋ", "zhuyin", "braille"), "⠛⠺⠂");
});
