# taigi-cli

[![npm version](https://img.shields.io/npm/v/@taigikeyboard/taigi-cli.svg)](https://www.npmjs.com/package/@taigikeyboard/taigi-cli)
[![npm downloads](https://img.shields.io/npm/dm/@taigikeyboard/taigi-cli.svg)](https://www.npmjs.com/package/@taigikeyboard/taigi-cli)
[![node](https://img.shields.io/node/v/@taigikeyboard/taigi-cli.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@taigikeyboard/taigi-cli.svg)](./LICENSE)

Bidirectional converter between Taiwanese phonetic systems: Tâi-lô (TL), Pe̍h-ōe-jī (POJ), Taiwanese Phonetic Symbols (TPS), and Taiwanese braille, with tone mark / tone number conversion.

## Demo

![taigi-cli demo](https://raw.githubusercontent.com/taigikeyboard/taigi-converter/main/assets/taigi-cli-demo.gif)

## Features

- Convert between TL, POJ, TPS, and Taiwanese braille
- Tone mark ↔ tone number conversion
- Handles mixed text with punctuation and hyphens
- Preserves letter casing

## Install

```bash
npm install -g @taigikeyboard/taigi-cli
```

Or run without installing:

```bash
npx -p @taigikeyboard/taigi-cli tai tl poj "peh8-oe7-ji7"
```

## CLI

```
tai <from> <to|mark|number|num> [--ascii] [text...]
tai -f <system> -t <system> [--tone mark|number|num] [--ascii] [text...]
```

Systems: `tl`, `poj`, `tps`, `braille`. The CLI also accepts common aliases like `tailo`, `tai-lo`, `zhuyin`, and `br`.
Input comes from arguments, or from stdin if none given.

```bash
tai tl poj "peh8-oe7-ji7"                   # pe̍h-ōe-jī
echo "tai5-gi2" | tai tl tps                # ㄉㄞˊ ㆣㄧˋ
tai tl num "pe̍h-uē-jī"                     # peh8-ue7-ji7
tai poj mark "peh8-oe7-ji7"                 # pe̍h-ōe-jī
tai -f poj -t poj --tone number --ascii "o͘-á"
tai tl braille "tâi-gí"                     # ⠙⠜⠆⠛⠊⠂
tai braille tl "⠙⠜⠆⠛⠊⠂"                # tâi-gí
```

Use `mark`, `number`, or `num` as the second argument to convert tone format inside the same romanization system.
`num` is an alias for `number`.
`--tone`, `--mark`, `--number`, and `--num` are also available when `--from` and `--to` are the same (TL or POJ).
`--ascii` / `--poj-ascii` rewrites POJ `o͘`/`ⁿ` as `oo`/`nn`.

### Stdin and files

If no text argument is provided, `tai` reads UTF-8 text from stdin and writes the converted text to stdout.

```bash
echo "tai5-gi2" | tai tl tps
tai tl poj < input.txt > output.txt
cat input.txt | tai poj tl
```

Newlines are preserved, so `tai` can process multi-line files.

## API

```js
import { convert, toToneNumber, toToneMark } from "@taigikeyboard/taigi-cli";

convert("tshiu-a", "tl", "poj");       // "chhiu-a"
convert("chhiu-a", "poj", "tl");       // "tshiu-a"
convert("tshiu7 a2", "tl", "zhuyin");  // TPS output
convert("tâi-gí", "tl", "braille");    // "⠙⠜⠆⠛⠊⠂"
convert("⠙⠜⠆⠛⠊⠂", "braille", "tl"); // "tâi-gí"

toToneNumber("Gâu-tsá");               // "Gau5-tsa2"
toToneMark("tshiu7-a2");               // "tshiú-á"
toToneMark("tshiu7-a2", "poj");        // "chhiú-á"
```

Note: the programmatic API uses `"zhuyin"` as the system name for TPS.

## Web

Live at [taigikeyboard.tw](https://taigikeyboard.tw).

## Development

Node.js 22+, no dependencies, tests via built-in `node:test`.

```bash
npm test
```
