import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { segmentWords } from "../src/segmenter.js";

describe("segmentWords", () => {
  it("passes through single syllable", () => {
    assert.equal(segmentWords("oo1"), "oo1");
  });

  it("keeps dictionary word joined", () => {
    assert.equal(segmentWords("kan1-a2"), "kan1-a2");
  });

  it("keeps multi-syllable dictionary word joined", () => {
    assert.equal(segmentWords("li2-ho2"), "li2-ho2");
  });

  it("splits separate words with space", () => {
    assert.equal(segmentWords("ho2-lang5-tsiah8-png7"), "ho2-lang5 tsiah8-png7");
  });

  it("handles mixed single and multi-syllable words", () => {
    assert.equal(segmentWords("gua2-beh4-lim1-tsui2"), "gua2-beh4 lim1-tsui2");
  });

  it("handles long phrase with multiple words", () => {
    assert.equal(
      segmentWords("li2-ho2-gua2-si7-tai5-uan5-lang5"),
      "li2-ho2 gua2-si7-tai5-uan5-lang5"
    );
  });

  it("preserves punctuation with space after", () => {
    assert.equal(segmentWords("li2-ho2.gua2-beh4"), "Li2-ho2. gua2-beh4");
    assert.equal(segmentWords("li2-ho2,gua2-beh4"), "Li2-ho2, gua2-beh4");
  });

  it("capitalizes first letter when punctuation present", () => {
    assert.equal(segmentWords("gua2-beh4,lim1-tsui2."), "Gua2-beh4, lim1-tsui2.");
  });

  it("does not capitalize without punctuation", () => {
    assert.equal(segmentWords("gua2-beh4-lim1-tsui2"), "gua2-beh4 lim1-tsui2");
  });

  it("preserves newlines", () => {
    assert.equal(segmentWords("li2-ho2\ntsiah8-png7"), "li2-ho2\ntsiah8-png7");
  });

  it("handles empty string", () => {
    assert.equal(segmentWords(""), "");
  });

  it("passes through non-syllable text", () => {
    assert.equal(segmentWords("hello world"), "hello world");
  });
});
