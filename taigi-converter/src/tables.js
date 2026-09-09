export const TL_INITIALS = new Set([
  "p", "ph", "m", "b", "t", "th", "n", "l", "k", "kh", "ng", "g",
  "ts", "tsh", "s", "j", "h", ""
]);

export const TL_FINALS = new Set([
  "a", "ah", "ap", "at", "ak", "ann", "annh", "am", "an", "ang",
  "e", "eh", "enn", "ennh",
  "i", "ih", "ip", "it", "ik", "inn", "innh", "im", "in", "ing",
  "o", "oh", "oo", "ooh", "op", "ok", "om", "ong", "onn", "onnh",
  "u", "uh", "ut", "un",
  "ai", "aih", "ainn", "ainnh", "au", "auh", "aunn", "aunnh",
  "ia", "iah", "iap", "iat", "iak", "iam", "ian", "iang", "iann", "iannh",
  "io", "ioh", "iok", "iong", "ionn",
  "iu", "iuh", "iut", "iunn", "iunnh",
  "ua", "uah", "uat", "uak", "uan", "uann", "uannh",
  "ue", "ueh", "uenn", "uennh",
  "ui", "uih", "uinn", "uinnh",
  "iau", "iauh", "iaunn", "iaunnh",
  "uai", "uaih", "uainn", "uainnh",
  "m", "mh", "ng", "ngh",
  "ioo", "iooh", "iai", "iaih",
  "er", "erh", "erk", "erm", "ere", "ereh", "eng",
  "ir", "irh", "irp", "irt", "irk", "irm", "irn", "irng", "iri", "irinn", "ie",
  "or", "orh", "ior", "iorh",
  "uang", "oi", "oih", "ee", "eeh"
]);

export const TONE_NUM_TO_COMBINING = {
  "1": "", "2": "\u0301", "3": "\u0300", "4": "",
  "5": "\u0302", "6": "\u030c", "7": "\u0304", "8": "\u030d", "9": "\u0306"
};

export const COMBINING_TO_TONE_NUM = {};
for (const [k, v] of Object.entries(TONE_NUM_TO_COMBINING)) {
  if (v) COMBINING_TO_TONE_NUM[v] = k;
}

export const COMBINING_PATTERN = /[\u0301\u0300\u0302\u030c\u0304\u030d\u030b\u0306]/;

export const POJ_INITIAL_FROM_TL = { "ts": "ch", "tsh": "chh" };
export const TL_INITIAL_FROM_POJ = { "ch": "ts", "chh": "tsh" };

export const POJ_FINAL_SUBS = [
  ["nn", "\u207f"], ["oo", "o\u0358"],
  ["ua", "oa"], ["ue", "oe"], ["ing", "eng"], ["ik", "ek"]
];

export const POJ_TRAD_FINAL_SUBS = [
  ["nn", "\u207f"], ["oo", "o\u0358"],
  ["ir", "u\u0324"], ["er", "o\u0324"], ["ee", "e\u0358"],
  ["ua", "oa"], ["ue", "oe"], ["ing", "eng"], ["ik", "ek"]
];

export const POJ_TRAD_CH_FINAL_INITIALS = new Set(["i", "e"]);

export const TL_FINAL_SUBS = [
  ["\u207f", "nn"], ["o\u0358", "oo"],
  ["oa", "ua"], ["oe", "ue"], ["eng", "ing"], ["ek", "ik"]
];

export const ZHUYIN_INITIALS = [
  ["tshi", "\u3111\u3127"], ["tsi", "\u3110\u3127"], ["tsh", "\u3118"],
  ["ph", "\u3106"], ["th", "\u310a"], ["ts", "\u3117"],
  ["si", "\u3112\u3127"], ["ji", "\u31a2\u3127"],
  ["kh", "\u310e"], ["ng", "\u312b"],
  ["p", "\u3105"], ["m", "\u3107"], ["b", "\u31a0"],
  ["t", "\u3109"], ["n", "\u310b"], ["l", "\u310c"],
  ["s", "\u3119"], ["j", "\u31a1"], ["k", "\u310d"], ["g", "\u31a3"], ["h", "\u310f"]
];

export const ZHUYIN_VOWELS = [
  ["ainn", "\u31ae"], ["aunn", "\u31af"], ["ann", "\u31a9"], ["enn", "\u31a5"],
  ["inn", "\u31aa"], ["onn", "\u31a7"], ["unn", "\u31ab"],
  ["ang", "\u3124"], ["ong", "\u31b2"], ["oo", "\u31a6"], ["ee", "\u311d"],
  ["er", "\u311c"], ["or", "\u311c"], ["ir", "\u31a8"],
  ["ai", "\u311e"], ["au", "\u3120"], ["am", "\u31b0"], ["an", "\u3122"],
  ["om", "\u31b1"], ["ng", "\u31ad"],
  ["a", "\u311a"], ["e", "\u31a4"], ["i", "\u3127"], ["o", "\u311b"], ["u", "\u3128"],
  ["m", "\u31ac"], ["n", "\u3123"]
];

export const ZHUYIN_TONES = [
  ["1", " "], ["2", "\u02cb"], ["3", "\u02ea"],
  ["p4", "\u31b4"], ["t4", "\u31b5"], ["k4", "\u31bb"], ["h4", "\u31b7"],
  ["5", "\u02ca"], ["6", "\u02c7"], ["7", "\u02eb"],
  ["p8", "\u31b4\u0307"], ["t8", "\u31b5\u0307"], ["k8", "\u31bb\u0307"], ["h8", "\u31b7\u0307"],
  ["8", "\u0307"],
  ["9", "\u02c6"]
];

export const ZHUYIN_TONES_ENCODE_SAFE = [
  ["1", " "], ["2", "\u02cb"], ["3", "\u02ea"],
  ["p4", "\u31b4"], ["t4", "\u31b5"], ["k4", "\u31bb"], ["h4", "\u31b7"],
  ["5", "\u02ca"], ["6", "\u02c7"], ["7", "\u02eb"],
  ["p8", "\u31b4\u02d9"], ["t8", "\u31b5\u02d9"], ["k8", "\u31bb\u02d9"], ["h8", "\u31b7\u02d9"],
  ["8", "\u02d9"],
  ["9", "\u02c6"]
];

export const BRAILLE_INITIALS = new Map([
  ["p", "⠏"], ["ph", "⠋"], ["m", "⠍"], ["b", "⠃"],
  ["t", "⠙"], ["th", "⠞"], ["n", "⠝"], ["l", "⠇"],
  ["k", "⠟"], ["kh", "⠅"], ["ng", "⠬"], ["g", "⠛"],
  ["ts", "⠡"], ["tsh", "⠉"], ["s", "⠎"], ["j", "⠚"],
  ["h", "⠓"], ["", ""]
]);

export const BRAILLE_FINALS = new Map([
  ["a", "⠁"], ["i", "⠊"], ["u", "⠥"], ["e", "⠑"],
  ["o", "⠕"], ["oo", "⠪"], ["m", "⠍"], ["ng", "⠬"],
  ["ai", "⠜"], ["au", "⠳"], ["ia", "⠽"], ["io", "⠗"],
  ["iu", "⠱"], ["ua", "⠺"], ["ue", "⠫"], ["ui", "⠷"],
  ["iau", "⠹"], ["uai", "⠾"],
  ["am", "⠩"], ["iam", "⠿"], ["im", "⠣"], ["om", "⠼"],
  ["an", "⠧"], ["ian", "⠲"], ["in", "⠖"], ["un", "⠌"],
  ["uan", "⠻"],
  ["ang", "⠭"], ["iang", "⠸"], ["ing", "⠵"],
  ["ong", "⠯"], ["iong", "⠮"]
]);

export const BRAILLE_TONES = new Map([
  ["1", "⠤"], ["2", "⠂"], ["3", "⠄"], ["4", "⠢"],
  ["5", "⠆"], ["6", "⠂"], ["7", "⠒"], ["8", "⠔"],
  ["9", "⠘"]
]);

export const BRAILLE_NASAL = "⠠";

export const BRAILLE_KHIN = "⠤⠤";

export const BRAILLE_PUNCTUATION = new Map([
  [",", "⠂⠀"], ["，", "⠂⠀"], ["、", "⠂⠀"],
  [".", "⠲⠀"], ["。", "⠲⠀"],
  ["?", "⠦⠀"], ["？", "⠦⠀"],
  ["!", "⠖⠀"], ["！", "⠖⠀"],
  [";", "⠆⠀"], ["；", "⠆⠀"],
  [":", "⠒"], ["：", "⠒"],
  ["“", "⠦"], ["「", "⠦"],
  ["”", "⠴⠀"], ["」", "⠴⠀"],
  ["‘", "⠠⠦"], ["『", "⠠⠦"],
  ["’", "⠠⠴⠀"], ["』", "⠠⠴⠀"],
  ["(", "⠐⠣"], ["（", "⠐⠣"],
  [")", "⠐⠜⠀"], ["）", "⠐⠜⠀"]
]);

export const PUNCTUATION_CHARS = ["\uff0e", "\u300c", "\u300d", "\uff0c", "\u3002", "\uff1f", "--", ",", ".", "?", '"'];

export const PUNCTUATION_PAIRS = [
  ["\u3002", ". "], ["\u3002", "."],
  ["\u300c", '"'], ["\u300d", '"'],
  ["\uff0c", ", "], ["\uff0c", ","],
  ["\uff1f", "? "], ["\uff1f", "?"],
  ["\uff0e", "\u00b7 "], ["\uff0e", "\u00b7"]
];
