#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { convert, toToneMark, toToneNumber } from "../src/converter.js";

const SYSTEM_ALIASES = {
  tl: "tl",
  tailo: "tl",
  "tai-lo": "tl",
  poj: "poj",
  pehoeji: "poj",
  "peh-oe-ji": "poj",
  tps: "zhuyin",
  zhuyin: "zhuyin",
  bpmf: "zhuyin",
  bopomofo: "zhuyin",
  fangyin: "zhuyin",
  braille: "braille",
  br: "braille",
};
const TONE_ALIASES = {
  mark: "mark",
  number: "number",
  num: "number",
};

const HELP = `Usage: tai <from> <to|mark|number|num> [options] [text...]
  tai -f <system> -t <system> [options] [text...]

Convert between Taiwanese phonetic systems.

Systems:
  tl          Tai-lo (aliases: tailo, tai-lo)
  poj         Pe-oh-e-ji (aliases: pehoeji, peh-oe-ji)
  tps         Taiwanese Phonetic Symbols (aliases: zhuyin, bpmf, bopomofo, fangyin)
  braille     Taiwanese braille (alias: br)

Options:
  -f, --from <system>    Source system
  -t, --to <system>      Target system
      --tone <mark|number|num>
                         Tone format for output when --from equals --to
      --mark             Shortcut for --tone mark
      --number           Shortcut for --tone number
      --num              Alias for --number
      --ascii, --poj-ascii
                         Use oo/nn instead of POJ o͘/ⁿ in output
  -h, --help             Show this help
  -v, --version          Show version

Input is taken from positional arguments, or from stdin if none given.

Examples:
  tai tl poj "peh8-oe7-ji7"
  echo "tai5-gi2" | tai tl tps
  tai tl num "pe̍h-uē-jī"
  tai poj mark "peh8-oe7-ji7"
  tai -f tl -t poj --ascii "o͘-á"
  tai tl braille "tâi-gí"
  tai braille tl "⠙⠜⠆⠛⠊⠂"
`;

function fail(msg, code = 2) {
  process.stderr.write(`tai: ${msg}\n`);
  if (code === 2) process.stderr.write(`Try 'tai --help' for usage.\n`);
  process.exit(code);
}

function resolveSystem(name, flag) {
  if (!name) fail(`missing --${flag}`);
  const key = name.toLowerCase();
  if (!(key in SYSTEM_ALIASES)) fail(`unknown system '${name}' for --${flag} (expected tl, poj, tps, zhuyin, or braille)`);
  return SYSTEM_ALIASES[key];
}

function isSystem(name) {
  return Boolean(name) && name.toLowerCase() in SYSTEM_ALIASES;
}

function normalizeTone(name) {
  return TONE_ALIASES[name?.toLowerCase()];
}

function applyAscii(text) {
  return text
    .replaceAll("o͘", "oo")
    .replaceAll("O͘", "OO")
    .replaceAll("ⁿ", "nn")
    .replaceAll("ᴺ", "NN");
}

async function readStdin() {
  let data = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

function readVersion() {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8"));
  return pkg.version;
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs({
      options: {
        from: { type: "string", short: "f" },
        to: { type: "string", short: "t" },
        tone: { type: "string" },
        mark: { type: "boolean", default: false },
        number: { type: "boolean", default: false },
        num: { type: "boolean", default: false },
        ascii: { type: "boolean", default: false },
        "poj-ascii": { type: "boolean", default: false },
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", short: "v", default: false },
      },
      allowPositionals: true,
      strict: true,
    });
  } catch (err) {
    fail(err.message);
  }

  const { values, positionals } = parsed;

  if (values.help) {
    process.stdout.write(HELP);
    return;
  }
  if (values.version) {
    process.stdout.write(readVersion() + "\n");
    return;
  }

  const args = [...positionals];
  const toneFlags = [
    values.tone ? normalizeTone(values.tone) || values.tone : undefined,
    values.mark ? "mark" : undefined,
    values.number ? "number" : undefined,
    values.num ? "number" : undefined,
  ].filter(Boolean);
  if (toneFlags.length > 1 && new Set(toneFlags).size > 1) {
    fail(`choose only one tone format`);
  }
  let tone = toneFlags[0];

  let from;
  let to;
  if (!values.from && !values.to && args.length >= 2 && isSystem(args[0]) && normalizeTone(args[1])) {
    const positionalTone = normalizeTone(args[1]);
    if (tone && tone !== positionalTone) fail(`choose only one tone format`);
    from = resolveSystem(args.shift(), "from");
    args.shift();
    to = from;
    tone = positionalTone;
  } else if (!values.from && !values.to && args.length >= 2 && isSystem(args[0]) && isSystem(args[1])) {
    from = resolveSystem(args.shift(), "from");
    to = resolveSystem(args.shift(), "to");
  } else if (!values.from && !values.to && args.length >= 1 && isSystem(args[0]) && tone) {
    from = resolveSystem(args.shift(), "from");
    to = from;
  } else if (!values.from && !values.to && args.length > 0 && normalizeTone(args[0])) {
    const command = args[0];
    fail(`missing source system before '${args[0]}' (try 'tai tl ${command} ...' or 'tai poj ${command} ...')`);
  } else {
    from = resolveSystem(values.from, "from");
    to = resolveSystem(values.to, "to");
  }

  if (tone && !["mark", "number"].includes(tone)) {
    fail(`invalid --tone '${tone}' (expected mark, number, or num)`);
  }
  if (tone && from !== to) {
    fail(`--tone only applies when --from and --to are the same system`);
  }
  if (tone && from === "zhuyin") {
    fail(`--tone does not apply to tps`);
  }
  if (tone && from === "braille") {
    fail(`--tone does not apply to braille`);
  }

  let input;
  let inputFromArgs = false;
  if (args.length > 0) {
    input = args.join(" ");
    inputFromArgs = true;
  } else if (!process.stdin.isTTY) {
    input = await readStdin();
  } else {
    fail(`no input (pass text as arguments or pipe via stdin)`);
  }

  let output;
  try {
    if (from === to) {
      if (tone === "number") {
        output = toToneNumber(input);
      } else if (tone === "mark") {
        output = toToneMark(input, from);
      } else {
        output = input;
      }
    } else {
      output = convert(input, from, to);
    }
  } catch (err) {
    fail(err.message, 1);
  }

  if (values.ascii || values["poj-ascii"]) output = applyAscii(output);
  if (inputFromArgs && output && !output.endsWith("\n")) output += "\n";

  process.stdout.write(output);
}

process.stdout.on("error", (err) => {
  if (err.code === "EPIPE") process.exit(0);
  throw err;
});

main().catch((err) => fail(err.message, 1));
