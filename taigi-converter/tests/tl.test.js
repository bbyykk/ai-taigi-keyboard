import { describe, it } from "node:test";
import { strictEqual } from "node:assert";
import { toTl } from "../src/tl.js";

describe("toTl", () => {
  it("simple tone 2", () => strictEqual(toTl("k", "a", "2"), "k\u00e1"));
  it("tone 1 no mark", () => strictEqual(toTl("k", "a", "1"), "ka"));
  it("tone 3 grave", () => strictEqual(toTl("k", "a", "3"), "k\u00e0"));
  it("tone 4 no mark", () => strictEqual(toTl("k", "ah", "4"), "kah"));
  it("tone 5 circumflex", () => strictEqual(toTl("k", "a", "5"), "k\u00e2"));
  it("tone 7 macron", () => strictEqual(toTl("k", "a", "7"), "k\u0101"));
  it("tone 8 vertical", () => strictEqual(toTl("k", "ah", "8"), "ka\u030dh"));
  it("tone on a priority", () => strictEqual(toTl("k", "ai", "2"), "k\u00e1i"));
  it("tone on oo", () => strictEqual(toTl("k", "oo", "5"), "k\u00f4o"));
  it("tone on e", () => strictEqual(toTl("t", "e", "7"), "t\u0113"));
  it("tone on o", () => strictEqual(toTl("k", "o", "2"), "k\u00f3"));
  it("ui tone on i", () => strictEqual(toTl("k", "ui", "3"), "ku\u00ec"));
  it("iu tone on u", () => strictEqual(toTl("tsh", "iu", "7"), "tshi\u016b"));
  it("ng tone on n", () => strictEqual(toTl("", "ng", "5"), "n\u0302g"));
  it("m tone", () => strictEqual(toTl("", "m", "7"), "m\u0304"));
  it("no initial", () => strictEqual(toTl("", "a", "2"), "\u00e1"));
  it("complex final", () => strictEqual(toTl("k", "iang", "5"), "ki\u00e2ng"));
  it("tone 9", () => strictEqual(toTl("k", "a", "9"), "ka\u030b"));
});
