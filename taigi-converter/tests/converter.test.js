import { describe, it } from "node:test";
import { strictEqual, ok, throws } from "node:assert";
import { convert, toToneNumber, toToneNumberAscii, toToneMark } from "../src/converter.js";
import { toZhuyin } from "../src/zhuyin.js";

describe("TailoTpsConverter consonants", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("basic consonant", () => strictEqual(cv("pa1"), "\u3105\u311a "));
  it("aspirated consonant", () => strictEqual(cv("pha1"), "\u3106\u311a "));
  it("multi char consonant tshi", () => strictEqual(cv("tshi1"), "\u3111\u3127 "));
  it("multi char consonant tsi", () => strictEqual(cv("tsi1"), "\u3110\u3127 "));
  it("ng consonant", () => strictEqual(cv("nga1"), "\u312b\u311a "));
});

describe("TailoTpsConverter vowels", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("single vowel", () => strictEqual(cv("a1"), "\u311a "));
  it("nasal vowel", () => strictEqual(cv("ann1"), "\u31a9 "));
  it("compound vowel", () => strictEqual(cv("ai1"), "\u311e "));
  it("double vowel oo", () => strictEqual(cv("oo1"), "\u31a6 "));
});

describe("TailoTpsConverter tones", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("tone 1", () => strictEqual(cv("ka1"), "\u310d\u311a "));
  it("tone 2", () => strictEqual(cv("ka2"), "\u310d\u311a\u02cb"));
  it("tone 3", () => strictEqual(cv("ka3"), "\u310d\u311a\u02ea"));
  it("tone 5", () => strictEqual(cv("ka5"), "\u310d\u311a\u02ca"));
  it("tone 7", () => strictEqual(cv("ka7"), "\u310d\u311a\u02eb"));
  it("tone p4", () => strictEqual(cv("kap4"), "\u310d\u311a\u31b4"));
  it("tone t4", () => strictEqual(cv("kat4"), "\u310d\u311a\u31b5"));
  it("tone k4", () => strictEqual(cv("kak4"), "\u310d\u311a\u31bb"));
  it("tone h4", () => strictEqual(cv("kah4"), "\u310d\u311a\u31b7"));
  it("tone p8 standard", () => strictEqual(cv("kap8"), "\u310d\u311a\u31b4\u0307"));
  it("tone p8 encode safe", () => {
    const result = "kap8".split("\n").map(line =>
      line.split(" ").map(t => toZhuyin(t, { encodeSafe: true })).join("")
    ).join("\n");
    strictEqual(result, "\u310d\u311a\u31b4\u02d9");
  });
});

describe("TailoTpsConverter special cases", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("standalone m", () => strictEqual(cv("m1"), "\u31ac "));
  it("standalone ng", () => strictEqual(cv("ng1"), "\u31ad "));
  it("ng with consonant", () => strictEqual(cv("kang1"), "\u310d\u3124 "));
});

describe("TailoTpsConverter punctuation", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("comma", () => ok(cv("ka1,").includes("\uff0c")));
  it("period", () => ok(cv("ka1.").includes("\u3002")));
  it("question mark", () => ok(cv("ka1?").includes("\uff1f")));
});

describe("TailoTpsConverter multi syllable", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("two syllables", () => strictEqual(cv("su5 pek8"), "\u3119\u3128\u02ca\u3105\u31a4\u31bb\u0307"));
  it("reference example", () => {
    const text = "tiau1 su5 pek8 te7 tshai2 un5 kan1,";
    const result = cv(text);
    strictEqual(result, "\u3109\u3127\u3120 \u3119\u3128\u02ca\u3105\u31a4\u31bb\u0307\u3109\u31a4\u02eb\u3118\u311e\u02cb\u3128\u3123\u02ca\u310d\u3122 \uff0c");
  });
});

describe("TailoTpsConverter multiline", () => {
  const cv = (text) => text.split("\n").map(line =>
    line.split(" ").map(t => toZhuyin(t)).join("")
  ).join("\n");

  it("multiline input", () => strictEqual(cv("ka1\nsu5"), "\u310d\u311a \n\u3119\u3128\u02ca"));
});

describe("convert API", () => {
  it("tl to poj basic", () => ok(convert("tshi\u016b-\u00e1", "tl", "poj").includes("chh")));
  it("poj to tl basic", () => ok(convert("chhi\u016b-\u00e1", "poj", "tl").includes("tsh")));

  it("tl to poj with n+grave U+01F9 (\u01f9)", () => strictEqual(convert("ts\u01f9g", "tl", "poj"), "ch\u01f9g"));
  it("tl to poj title-case (Ts\u01f9g) preserves capitalization", () => strictEqual(convert("Ts\u01f9g", "tl", "poj"), "Ch\u01f9g"));
  it("tl to poj all-uppercase with N+grave U+01F8 (TS\u01f8G)", () => strictEqual(convert("TS\u01f8G", "tl", "poj"), "CH\u01f8G"));
  it("tl to poj aspirated n+grave (tsh\u01f9g)", () => strictEqual(convert("tsh\u01f9g", "tl", "poj"), "chh\u01f9g"));
  it("poj to tl roundtrip n+grave", () => strictEqual(convert("ch\u01f9g", "poj", "tl"), "ts\u01f9g"));
  it("standalone \u01f9g passthrough (same in tl and poj)", () => strictEqual(convert("\u01f9g", "tl", "poj"), "\u01f9g"));
  it("mixed-script preserves hanzi (\u6211\u662f ts\u00ed)", () => strictEqual(convert("\u6211\u662f ts\u00ed", "tl", "poj"), "\u6211\u662f ch\u00ed"));
  it("mixed-script with hanzi and ts\u01f9g", () => strictEqual(convert("\u7b97 ts\u01f9g", "tl", "poj"), "\u7b97 ch\u01f9g"));
  it("zhuyin block left untouched in tl-to-poj", () => strictEqual(convert("\u310d\u311a\u02cb ts\u00ed", "tl", "poj"), "\u310d\u311a\u02cb ch\u00ed"));
  it("tl to zhuyin", () => ok(convert("tshiu7 a2", "tl", "zhuyin").includes("\u3111\u3127\u3128\u02eb")));
  it("same system passthrough", () => strictEqual(convert("hello", "tl", "tl"), "hello"));
  it("unknown source", () => throws(() => convert("hello", "xyz", "tl"), /Unknown source/));
  it("unknown target", () => throws(() => convert("hello", "tl", "xyz"), /Unknown target/));
  it("zhuyin to tl", () => ok(convert("\u310d\u311a\u02cb", "zhuyin", "tl").includes("k\u00e1")));
  it("zhuyin to poj", () => ok(convert("\u3111\u3127\u3128\u02eb", "zhuyin", "poj").includes("chh")));
  it("tl to zhuyin uppercase", () => ok(convert("L\u0101u-b\u00fa", "tl", "zhuyin").includes("\u310c\u3120\u02eb")));
  it("tl to zhuyin space separated", () => {
    const result = convert("tshiu7 a2", "tl", "zhuyin");
    strictEqual(result, "\u3111\u3127\u3128\u02eb \u311a\u02cb");
  });
  it("tl to zhuyin punct separated", () => {
    const result = convert("s\u00ed, g\u00edn", "tl", "zhuyin");
    strictEqual(result, "\u3112\u3127\u02cb \uff0c \u30a3\u3127\u3123\u02cb".replace("\u30a3", "\u31a3"));
  });
  it("Han-ts\u00ee m\u0304-kiann lo\u030dh-th\u00f3o nu\u0101", () => {
    strictEqual(convert("Han-ts\u00ee m\u0304-kiann lo\u030dh-th\u00f3o nu\u0101", "tl", "zhuyin"),
      "\u310f\u3122 \u3110\u3127\u02ca \u31ac\u02eb \u310d\u3127\u31a9 \u310c\u311b\u31b7\u0307 \u310a\u31a6\u02cb \u310b\u3128\u311a\u02eb");
  });
  it("Tai5-uan5 Tai5-gi2 Lo5-ma2-ji7", () => {
    strictEqual(convert("Tai5-uan5 Tai5-gi2 Lo5-ma2-ji7", "tl", "zhuyin"),
      "\u3109\u311e\u02ca \u3128\u3122\u02ca \u3109\u311e\u02ca \u31a3\u3127\u02cb \u310c\u311b\u02ca \u3107\u311a\u02cb \u31a2\u3127\u02eb");
  });
  it("Oo kan-\u00e1 t\u00e9 t\u0101u-i\u00fb", () => {
    strictEqual(convert("Oo kan-\u00e1 t\u00e9 t\u0101u-i\u00fb", "tl", "zhuyin"),
      "\u31a6 \u310d\u3122 \u311a\u02cb \u3109\u31a4\u02cb \u3109\u3120\u02eb \u3127\u3128\u02ca");
  });
  it("Thinn-kong thi\u00e0nn g\u014dng-l\u00e2ng", () => {
    strictEqual(convert("Thinn-kong thi\u00e0nn g\u014dng-l\u00e2ng", "tl", "zhuyin"),
      "\u310a\u31aa \u310d\u31b2 \u310a\u3127\u31a9\u02ea \u31a3\u31b2\u02eb \u310c\u3124\u02ca");
  });
  it("Tsia\u030dh h\u00f3 t\u00e0u sio-p\u00f2", () => {
    strictEqual(convert("Tsia\u030dh h\u00f3 t\u00e0u sio-p\u00f2", "tl", "zhuyin"),
      "\u3110\u3127\u311a\u31b7\u0307 \u310f\u311b\u02cb \u3109\u3120\u02ea \u3112\u3127\u311b \u3105\u311b\u02ea");
  });
  it("Ts\u00fbn ku\u00e8 tsu\u00ed b\u00f4 h\u00fbn", () => {
    strictEqual(convert("Ts\u00fbn ku\u00e8 tsu\u00ed b\u00f4 h\u00fbn", "tl", "zhuyin"),
      "\u3117\u3128\u3123\u02ca \u310d\u3128\u31a4\u02ea \u3117\u3128\u3127\u02cb \u31a0\u311b\u02ca \u310f\u3128\u3123\u02ca");
  });
  it("\u016a tshu\u00ec k\u00f3ng kah b\u00f4 nu\u0101", () => {
    strictEqual(convert("\u016a tshu\u00ec k\u00f3ng kah b\u00f4 nu\u0101", "tl", "zhuyin"),
      "\u3128\u02eb \u3118\u3128\u3127\u02ea \u310d\u31b2\u02cb \u310d\u311a\u31b7 \u31a0\u311b\u02ca \u310b\u3128\u311a\u02eb");
  });
  it("Tsi\u030dt ki tsh\u00e1u, tsi\u030dt ti\u00e1m l\u014do", () => {
    strictEqual(convert("Tsi\u030dt ki tsh\u00e1u, tsi\u030dt ti\u00e1m l\u014do", "tl", "zhuyin"),
      "\u3110\u3127\u31b5\u0307 \u310d\u3127 \u3118\u3120\u02cb \uff0c \u3110\u3127\u31b5\u0307 \u3109\u3127\u31b0\u02cb \u310c\u31a6\u02eb");
  });
  it("Ts\u00ecng-l\u00e2ng \u00ea \u00ec-ki\u00e0n i it-kh\u00e0i hu\u00e1n-tu\u00ec.", () => {
    strictEqual(convert("Ts\u00ecng-l\u00e2ng \u00ea \u00ec-ki\u00e0n i it-kh\u00e0i hu\u00e1n-tu\u00ec.", "tl", "zhuyin"),
      "\u3110\u3127\u3125\u02ea \u310c\u3124\u02ca \u31a4\u02ca \u3127\u02ea \u310d\u3127\u3122\u02ea \u3127 \u3127\u31b5 \u310e\u311e\u02ea \u310f\u3128\u3122\u02cb \u3109\u3128\u3127\u02ea \u3002");
  });
  it("\u908a pinn", () => strictEqual(convert("pinn", "tl", "zhuyin"), "\u3105\u31aa"));
  it("\u76ae phu\u00ea", () => strictEqual(convert("phu\u00ea", "tl", "zhuyin"), "\u3106\u3128\u31a4\u02ca"));
  it("\u6728 ba\u030dk", () => strictEqual(convert("ba\u030dk", "tl", "zhuyin"), "\u31a0\u311a\u31bb\u0307"));
  it("\u8349 tsh\u00e1u", () => strictEqual(convert("tsh\u00e1u", "tl", "zhuyin"), "\u3118\u3120\u02cb"));
  it("\u71b1 jua\u030dh", () => strictEqual(convert("jua\u030dh", "tl", "zhuyin"), "\u31a1\u3128\u311a\u31b7\u0307"));
  it("\u798f hok", () => strictEqual(convert("hok", "tl", "zhuyin"), "\u310f\u31a6\u31bb"));
  it("\u706b h\u00e9r", () => strictEqual(convert("h\u00e9r", "tl", "zhuyin"), "\u310f\u311c\u02cb"));
  it("\u886b sann", () => strictEqual(convert("sann", "tl", "zhuyin"), "\u3119\u31a9"));
  it("\u9ec3 n\u0302g", () => strictEqual(convert("n\u0302g", "tl", "zhuyin"), "\u31ad\u02ca"));
  it("er\u011b tone 6", () => strictEqual(convert("er\u011b", "tl", "zhuyin"), "\u311c\u31a4\u02c7"));
  it("--ah neutral tone", () => strictEqual(convert("--ah", "tl", "zhuyin"), "\u00b7\u311a\u31b7"));
  it("tl to poj ing to eng", () => ok(convert("p\u00eeng", "tl", "poj").includes("\u00eang")));
  it("preserves non syllable text", () => ok(convert("hello-world", "tl", "poj").includes("-")));
  it("preserves case title", () => ok(convert("T\u00e2i-g\u00ed", "tl", "poj")[0] === "T"));
  it("uppercase nasalization uses capital modifier", () => ok(convert("PIANN", "tl", "poj").includes("\u1d3a")));
  it("title case nasalization stays lowercase", () => ok(convert("Piann", "tl", "poj").includes("\u207f")));
});

describe("issue #4 tone-marked TL to POJ regressions", () => {
  const cases = [
    ["inn",
      "inn ínn ìnn inn înn ǐnn īnn i̍nn i̋nn",
      "iⁿ íⁿ ìⁿ iⁿ îⁿ ǐⁿ īⁿ i̍ⁿ ĭⁿ"],
    ["iunn",
      "iunn iúnn iùnn iunn iûnn iǔnn iūnn iu̍nn iűnn",
      "iuⁿ iúⁿ iùⁿ iuⁿ iûⁿ iǔⁿ iūⁿ iu̍ⁿ iŭⁿ"],
    ["ing",
      "ing íng ìng ing îng ǐng īng i̍ng i̋ng",
      "eng éng èng eng êng ěng ēng e̍ng ĕng"],
    ["oo",
      "oo óo òo oo ôo ǒo ōo o̍o őo",
      "o͘ ó͘ ò͘ o͘ ô͘ ǒ͘ ō͘ o̍͘ ŏ͘"],
    ["Oo",
      "Oo Óo Òo Oo Ôo Ǒo Ōo O̍o Őo",
      "O͘ Ó͘ Ò͘ O͘ Ô͘ Ǒ͘ Ō͘ O̍͘ Ŏ͘"],
    ["OO",
      "OO ÓO ÒO OO ÔO ǑO ŌO O̍O ŐO",
      "O͘ Ó͘ Ò͘ O͘ Ô͘ Ǒ͘ Ō͘ O̍͘ Ŏ͘"],
    ["sui",
      "sui suí suì sui suî suǐ suī sui̍ sui̋",
      "sui súi sùi sui sûi sǔi sūi su̍i sŭi"],
    ["tsi",
      "tsi tsí tsì tsi tsî tsǐ tsī tsi̍ tsi̋",
      "chi chí chì chi chî chǐ chī chi̍ chĭ"],
    ["tso",
      "tso tsó tsò tso tsô tsǒ tsō tso̍ tső",
      "cho chó chò cho chô chǒ chō cho̍ chŏ"],
    ["tsu",
      "tsu tsú tsù tsu tsû tsǔ tsū tsu̍ tsű",
      "chu chú chù chu chû chǔ chū chu̍ chŭ"],
    ["tshi",
      "tshi tshí tshì tshi tshî tshǐ tshī tshi̍ tshi̋",
      "chhi chhí chhì chhi chhî chhǐ chhī chhi̍ chhĭ"],
    ["tsho",
      "tsho tshó tshò tsho tshô tshǒ tshō tsho̍ tshő",
      "chho chhó chhò chho chhô chhǒ chhō chho̍ chhŏ"],
    ["tshu",
      "tshu tshú tshù tshu tshû tshǔ tshū tshu̍ tshű",
      "chhu chhú chhù chhu chhû chhǔ chhū chhu̍ chhŭ"],
    ["tsng",
      "tsng tsńg tsǹg tsng tsn̂g tsňg tsn̄g tsn̍g tsn̋g",
      "chng chńg chǹg chng chn̂g chňg chn̄g chn̍g chn̆g"],
    ["tshng",
      "tshng tshńg tshǹg tshng tshn̂g tshňg tshn̄g tshn̍g tshn̋g",
      "chhng chhńg chhǹg chhng chhn̂g chhňg chhn̄g chhn̍g chhn̆g"]
  ];
  for (const [syllable, marked, poj] of cases) {
    it(`${syllable} tones 1-9`, () => {
      const numbered = Array.from({ length: 9 }, (_, i) => syllable + (i + 1)).join(" ");
      strictEqual(toToneMark(numbered, "tl"), marked);
      strictEqual(convert(marked, "tl", "poj"), poj);
    });
  }
});

describe("tone mark placement keeps er/ir digraph intact (ere, ereh, irinn finals)", () => {
  const cases = [
    ["pere",
      "pere peré perè pere perê perě perē pere̍ pere̋",
      "pere peré perè pere perê perě perē pere̍ perĕ"],
    ["pereh",
      "pereh peréh perèh pereh perêh perěh perēh pere̍h pere̋h",
      "pereh peréh perèh pereh perêh perěh perēh pere̍h perĕh"],
    ["pirinn",
      "pirinn pirínn pirìnn pirinn pirînn pirǐnn pirīnn piri̍nn piri̋nn",
      "piriⁿ piríⁿ pirìⁿ piriⁿ pirîⁿ pirǐⁿ pirīⁿ piri̍ⁿ pirĭⁿ"]
  ];
  for (const [syllable, marked, poj] of cases) {
    it(`${syllable} tones 1-9`, () => {
      const numbered = Array.from({ length: 9 }, (_, i) => syllable + (i + 1)).join(" ");
      strictEqual(toToneMark(numbered, "tl"), marked);
      strictEqual(convert(marked, "tl", "poj"), poj);
    });
  }
});

describe("traditional POJ (poj-trad): ir/er/ee vowels", () => {
  const cases = [
    ["hir",
      "hir hír hìr hir hîr hǐr hīr hi̍r hi̋r",
      "hṳ hṳ́ hṳ̀ hṳ hṳ̂ hṳ̌ hṳ̄ hṳ̍ hṳ̆"],
    ["ter",
      "ter tér tèr ter têr těr tēr te̍r te̋r",
      "to̤ tó̤ tò̤ to̤ tô̤ tǒ̤ tō̤ to̤̍ tŏ̤"],
    ["kee",
      "kee kée kèe kee kêe kěe kēe ke̍e ke̋e",
      "ke͘ ké͘ kè͘ ke͘ kê͘ kě͘ kē͘ ke̍͘ kĕ͘"],
    ["pirinn",
      "pirinn pirínn pirìnn pirinn pirînn pirǐnn pirīnn piri̍nn piri̋nn",
      "pṳiⁿ pṳ́iⁿ pṳ̀iⁿ pṳiⁿ pṳ̂iⁿ pṳ̌iⁿ pṳ̄iⁿ pṳ̍iⁿ pṳ̆iⁿ"],
    ["tere",
      "tere teré terè tere terê terě terē tere̍ tere̋",
      "to̤e tó̤e tò̤e to̤e tô̤e tǒ̤e tō̤e to̤̍e tŏ̤e"],
  ];
  for (const [syllable, marked, trad] of cases) {
    it(`${syllable} tones 1-9`, () => {
      const numbered = Array.from({ length: 9 }, (_, i) => syllable + (i + 1)).join(" ");
      strictEqual(toToneMark(numbered, "tl"), marked);
      strictEqual(convert(marked, "tl", "poj-trad"), trad);
    });
  }

  it("light tone (9) on bare a uses tilde, not breve", () => {
    strictEqual(convert("a̋", "tl", "poj-trad"), "ã");
  });

  it("light tone (9) elsewhere still uses breve", () => {
    strictEqual(convert("hi̋r", "tl", "poj-trad"), "hṳ̆");
  });
});

describe("traditional POJ (poj-trad): tone-number round trip for unmarked tone 1/4", () => {
  // Regression: toPojTrad's final NFC normalize composes u+diaeresis-below into
  // the single precomposed U+1E73, but o/e+diaeresis-below/dot-above-right have
  // no precomposed form and stay decomposed. normalizeToTl must reverse both
  // shapes so tone 1/4 (which carry no visible mark) can still be inferred.
  it("tone 1 (unmarked) on ir vowel infers correct digit", () => {
    strictEqual(toToneNumber(toToneMark("hir1", "poj-trad")), "hṳ1");
  });
  it("tone 4 (unmarked, stop) on ir vowel infers correct digit", () => {
    strictEqual(toToneNumber(toToneMark("irk4", "poj-trad")), "ṳk4");
  });
  it("tone 4 (unmarked, stop) on er vowel infers correct digit", () => {
    strictEqual(toToneNumber(toToneMark("erh4", "poj-trad")), "o̤h4");
  });
  it("tone 4 (unmarked, stop) on ee vowel infers correct digit", () => {
    strictEqual(toToneNumber(toToneMark("eeh4", "poj-trad")), "e͘h4");
  });
});

describe("traditional POJ (poj-trad): ts/ch initial split (per Barclay's Amoy dictionary)", () => {
  // Unaspirated ts splits by the following vowel: a/o/u -> ts, i/e -> ch.
  it("ts before a stays ts", () => strictEqual(convert("tsa", "tl", "poj-trad"), "tsa"));
  it("ts before u stays ts", () => strictEqual(convert("tsu", "tl", "poj-trad"), "tsu"));
  it("ts before o stays ts", () => strictEqual(convert("tso", "tl", "poj-trad"), "tso"));
  it("ts before i becomes ch", () => strictEqual(convert("tsi", "tl", "poj-trad"), "chi"));
  it("ts before e becomes ch", () => strictEqual(convert("tse", "tl", "poj-trad"), "che"));
  it("ts before nasal-only final (ng) stays ts", () => strictEqual(convert("tsng", "tl", "poj-trad"), "tsng"));
  it("ts before ir vowel (spelled u) stays ts", () => strictEqual(convert("hir", "tl", "poj-trad"), "hṳ"));
  it("ts before er vowel (spelled o) stays ts, via tser", () => strictEqual(convert("tser", "tl", "poj-trad"), "tso̤"));

  // Aspirated tsh is always chh, regardless of the following vowel - no split.
  it("tsh before a becomes chh", () => strictEqual(convert("tsha", "tl", "poj-trad"), "chha"));
  it("tsh before e becomes chh", () => strictEqual(convert("tshe", "tl", "poj-trad"), "chhe"));
  it("tsh before i becomes chh", () => strictEqual(convert("tshi", "tl", "poj-trad"), "chhi"));
  it("tsh before o becomes chh", () => strictEqual(convert("tsho", "tl", "poj-trad"), "chho"));
  it("tsh before u becomes chh", () => strictEqual(convert("tshu", "tl", "poj-trad"), "chhu"));
  it("tsh before nasal-only final (ng) becomes chh", () => strictEqual(convert("tshng", "tl", "poj-trad"), "chhng"));
  it("tsh before ir vowel (spelled u) becomes chh", () => strictEqual(convert("tshir", "tl", "poj-trad"), "chhṳ"));
  it("tsh before er vowel (spelled o) becomes chh, via tsher", () => strictEqual(convert("tsher", "tl", "poj-trad"), "chho̤"));

  it("other initials pass through unchanged", () => strictEqual(convert("kam", "tl", "poj-trad"), "kam"));
  it("preserves title case", () => strictEqual(convert("Tsia", "tl", "poj-trad"), "Chia"));
  it("preserves upper case", () => strictEqual(convert("TSIA", "tl", "poj-trad"), "CHIA"));
  it("preserves title case for aspirated non-split", () => strictEqual(convert("Tsho", "tl", "poj-trad"), "Chho"));
});

describe("toToneNumber", () => {
  it("basic", () => strictEqual(toToneNumber("k\u00e1"), "ka2"));
  it("tone 5", () => strictEqual(toToneNumber("k\u00e2"), "ka5"));
  it("tone 7", () => strictEqual(toToneNumber("k\u0101"), "ka7"));
  it("tone 8", () => strictEqual(toToneNumber("ka\u030dh"), "kah8"));
  it("already numbered", () => strictEqual(toToneNumber("ka2"), "ka2"));

  it("multi syllable", () => {
    const result = toToneNumber("G\u00e2u-ts\u00e1");
    ok(result.includes("5"));
    ok(result.includes("2"));
  });

  it("no tone", () => strictEqual(toToneNumber("ka"), "ka1"));
  it("stop tone no mark", () => strictEqual(toToneNumber("kah"), "kah4"));
  it("round-trip uppercase nasalization", () => {
    const poj = convert("PIANN", "tl", "poj");
    ok(poj.includes("\u1d3a"));
    const numbered = toToneNumber(poj);
    ok(/1$/.test(numbered.trim()));
  });
});

describe("toToneNumber POJ non-ASCII vs ASCII", () => {
  const pojToNum = (text) => toToneNumber(toToneMark(toToneNumber(text), "poj"));
  const pojToNumAscii = (text) => toToneNumberAscii(toToneMark(toToneNumber(text), "poj"));

  it("non-ASCII preserves o dot", () => ok(pojToNum("koo2").includes("o\u0358")));
  it("ASCII replaces o dot with oo", () => ok(!pojToNumAscii("koo2").includes("\u0358")));
  it("ASCII o dot output contains oo", () => ok(pojToNumAscii("koo2").includes("oo")));

  it("non-ASCII preserves nasal n", () => ok(pojToNum("kann2").includes("\u207f")));
  it("ASCII replaces nasal n with nn", () => ok(pojToNumAscii("kann2").includes("nn")));
  it("ASCII has no nasal n", () => ok(!pojToNumAscii("kann2").includes("\u207f")));

  it("non-ASCII preserves both in compound", () => {
    const result = pojToNum("oo5-ann2");
    ok(result.includes("o\u0358"));
    ok(result.includes("\u207f"));
  });

  it("ASCII replaces both in compound", () => {
    const result = pojToNumAscii("oo5-ann2");
    ok(!result.includes("\u0358"));
    ok(!result.includes("\u207f"));
    ok(result.includes("oo"));
    ok(result.includes("nn"));
  });

  it("toToneNumberAscii uppercase O dot \u2192 OO", () => {
    ok(!toToneNumberAscii("KO\u03582").includes("\u0358"));
    ok(toToneNumberAscii("KO\u03582").includes("OO"));
  });

  it("toToneNumberAscii uppercase nasal \u2192 NN", () => {
    ok(!toToneNumberAscii("KA\u1d3a2").includes("\u1d3a"));
    ok(toToneNumberAscii("KA\u1d3a2").includes("NN"));
  });

  it("toToneNumberAscii passes through already-ASCII input", () => {
    strictEqual(toToneNumberAscii("koo2"), toToneNumber("koo2"));
    strictEqual(toToneNumberAscii("kann2"), toToneNumber("kann2"));
  });
});

describe("toToneMark", () => {
  it("basic tl", () => strictEqual(toToneMark("ka2"), "k\u00e1"));
  it("tone 5", () => strictEqual(toToneMark("ka5"), "k\u00e2"));
  it("tone 7", () => strictEqual(toToneMark("ka7"), "k\u0101"));
  it("tone 1 no mark", () => strictEqual(toToneMark("ka1"), "ka"));
  it("poj system", () => ok(toToneMark("tshiu7", "poj").includes("chh")));

  it("multi syllable hyphenated", () => {
    const result = toToneMark("tshiu7-a2");
    ok(result.includes("\u016b"));
    ok(result.includes("\u00e1"));
  });
});
