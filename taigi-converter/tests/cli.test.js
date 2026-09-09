import { describe, it } from "node:test";
import { strictEqual, match } from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "bin", "tai.js");

function run(args, { input } = {}) {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    input,
    encoding: "utf8",
  });
  return { stdout: result.stdout, stderr: result.stderr, code: result.status };
}

describe("tai CLI", () => {
  describe("basic conversion", () => {
    it("tl -> poj via argv", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "poj", "peh8-oe7-ji7"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h-ōe-jī\n");
    });

    it("poj -> tl via argv", () => {
      const { stdout, code } = run(["-f", "poj", "-t", "tl", "chhiu-a"]);
      strictEqual(code, 0);
      strictEqual(stdout, "tshiu-a\n");
    });

    it("tl -> tps via argv", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "tps", "tai5-gi2"]);
      strictEqual(code, 0);
      match(stdout, /ㄉㄞ/);
    });

    it("long flags", () => {
      const { stdout, code } = run(["--from", "tl", "--to", "poj", "peh8"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h\n");
    });

    it("positional systems", () => {
      const { stdout, code } = run(["tl", "poj", "peh8-oe7-ji7"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h-ōe-jī\n");
    });

    it("accepts zhuyin alias for tps", () => {
      const { stdout, code } = run(["tl", "zhuyin", "tai5-gi2"]);
      strictEqual(code, 0);
      match(stdout, /ㄉㄞ/);
    });
  });

  describe("braille conversion", () => {
    it("tl -> braille via argv", () => {
      const { stdout, code } = run(["tl", "braille", "tâi-gí"]);
      strictEqual(code, 0);
      strictEqual(stdout, "⠙⠜⠆⠛⠊⠂\n");
    });

    it("braille -> tl via argv", () => {
      const { stdout, code } = run(["braille", "tl", "⠙⠜⠆⠛⠊⠂"]);
      strictEqual(code, 0);
      strictEqual(stdout, "tâi-gí\n");
    });

    it("braille -> poj via flags", () => {
      const { stdout, code } = run(["-f", "braille", "-t", "poj", "⠏⠑⠔⠫⠒⠚⠊⠒"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h-ōe-jī\n");
    });

    it("braille -> tps via argv", () => {
      const { stdout, code } = run(["braille", "tps", "⠙⠜⠆⠛⠊⠂"]);
      strictEqual(code, 0);
      match(stdout, /ㄉㄞ/);
    });

    it("accepts br alias", () => {
      const { stdout, code } = run(["tl", "br", "tâi-gí"]);
      strictEqual(code, 0);
      strictEqual(stdout, "⠙⠜⠆⠛⠊⠂\n");
    });

    it("reads braille from stdin", () => {
      const { stdout, code } = run(["-f", "braille", "-t", "tl"], { input: "⠙⠜⠆⠛⠊⠂" });
      strictEqual(code, 0);
      strictEqual(stdout, "tâi-gí");
    });

    it("rejects --tone with braille source", () => {
      const { stderr, code } = run(["-f", "braille", "-t", "braille", "--tone", "mark", "⠙⠜⠆"]);
      strictEqual(code, 2);
      match(stderr, /does not apply to braille/);
    });
  });

  describe("stdin", () => {
    it("reads stdin when no positional args", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "poj"], { input: "peh8" });
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h");
    });

    it("does not add a newline to stdin input", () => {
      const { stdout, code } = run(["tl", "poj"], { input: "peh8" });
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h");
    });

    it("argv takes precedence over stdin", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "poj", "tai5"], { input: "ignored" });
      strictEqual(code, 0);
      match(stdout, /tâi/);
    });

    it("preserves newlines from stdin", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "poj"], { input: "peh8\ntai5\n" });
      strictEqual(code, 0);
      match(stdout, /\n/);
    });
  });

  describe("tone conversion (same system)", () => {
    it("tl -> tl tone number", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "tl", "--tone", "number", "pe̍h-ōe-jī"]);
      strictEqual(code, 0);
      strictEqual(stdout, "peh8-oe7-ji7\n");
    });

    it("tl -> tl tone mark", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "tl", "--tone", "mark", "peh8-ji7"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h-jī\n");
    });

    it("poj -> poj tone mark", () => {
      const { stdout, code } = run(["-f", "poj", "-t", "poj", "--tone", "mark", "peh8-oe7-ji7"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h-ōe-jī\n");
    });

    it("positional tone number target", () => {
      const { stdout, code } = run(["tl", "number", "pe̍h-uē-jī"]);
      strictEqual(code, 0);
      strictEqual(stdout, "peh8-ue7-ji7\n");
    });

    it("positional tone num aliases number", () => {
      const { stdout, code } = run(["tl", "num", "pe̍h-uē-jī"]);
      strictEqual(code, 0);
      strictEqual(stdout, "peh8-ue7-ji7\n");
    });

    it("positional tone mark target keeps POJ spelling", () => {
      const { stdout, code } = run(["poj", "mark", "peh8-oe7-ji7"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h-ōe-jī\n");
    });

    it("--number shortcut flag with positional system", () => {
      const { stdout, code } = run(["tl", "--number", "pe̍h-uē-jī"]);
      strictEqual(code, 0);
      strictEqual(stdout, "peh8-ue7-ji7\n");
    });

    it("--num shortcut flag aliases --number", () => {
      const { stdout, code } = run(["tl", "--num", "pe̍h-uē-jī"]);
      strictEqual(code, 0);
      strictEqual(stdout, "peh8-ue7-ji7\n");
    });

    it("--tone num aliases --tone number", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "tl", "--tone", "num", "pe̍h-uē-jī"]);
      strictEqual(code, 0);
      strictEqual(stdout, "peh8-ue7-ji7\n");
    });

    it("--mark shortcut flag with positional system", () => {
      const { stdout, code } = run(["tl", "--mark", "peh8"]);
      strictEqual(code, 0);
      strictEqual(stdout, "pe̍h\n");
    });
  });

  describe("--ascii", () => {
    it("replaces o-dot and nasal", () => {
      const { stdout, code } = run(["-f", "poj", "-t", "poj", "--tone", "number", "--ascii", "o͘-á"]);
      strictEqual(code, 0);
      match(stdout, /oo/);
    });

    it("no-op when no POJ diacritics present", () => {
      const { stdout, code } = run(["-f", "tl", "-t", "poj", "--ascii", "tai5"]);
      strictEqual(code, 0);
      match(stdout, /tâi/);
    });

    it("--poj-ascii aliases --ascii", () => {
      const { stdout, code } = run(["-f", "poj", "-t", "poj", "--tone", "number", "--poj-ascii", "o͘-á"]);
      strictEqual(code, 0);
      match(stdout, /oo/);
    });
  });

  describe("errors", () => {
    it("exits 2 on missing --from", () => {
      const { stderr, code } = run(["-t", "poj", "text"]);
      strictEqual(code, 2);
      match(stderr, /missing --from/);
    });

    it("exits 2 on unknown system", () => {
      const { stderr, code } = run(["-f", "bogus", "-t", "poj", "text"]);
      strictEqual(code, 2);
      match(stderr, /unknown system 'bogus'/);
    });

    it("rejects --tone with different systems", () => {
      const { stderr, code } = run(["-f", "tl", "-t", "poj", "--tone", "mark", "tai5"]);
      strictEqual(code, 2);
      match(stderr, /--tone only applies/);
    });

    it("rejects --tone with tps", () => {
      const { stderr, code } = run(["-f", "tps", "-t", "tps", "--tone", "mark", "ㄉㄞˊ"]);
      strictEqual(code, 2);
      match(stderr, /does not apply to tps/);
    });

    it("rejects invalid --tone value", () => {
      const { stderr, code } = run(["-f", "tl", "-t", "tl", "--tone", "bogus", "tai5"]);
      strictEqual(code, 2);
      match(stderr, /invalid --tone/);
    });

    it("rejects conflicting tone shortcut flags", () => {
      const { stderr, code } = run(["tl", "--mark", "--number", "tai5"]);
      strictEqual(code, 2);
      match(stderr, /choose only one tone format/);
    });

    it("rejects bare tone command without a system", () => {
      const { stderr, code } = run(["number", "pe̍h-uē-jī"]);
      strictEqual(code, 2);
      match(stderr, /missing source system/);
      match(stderr, /tai tl number/);
    });
  });

  describe("--help and --version", () => {
    it("--help prints usage", () => {
      const { stdout, code } = run(["--help"]);
      strictEqual(code, 0);
      match(stdout, /Usage: tai/);
    });

    it("-h shorthand", () => {
      const { stdout, code } = run(["-h"]);
      strictEqual(code, 0);
      match(stdout, /Usage: tai/);
    });

    it("--version prints semver", () => {
      const { stdout, code } = run(["--version"]);
      strictEqual(code, 0);
      match(stdout, /^\d+\.\d+\.\d+/);
    });
  });
});
