# taigi-converter

## Overview

- Bidirectional converter between Taigi phonetic systems: TL, POJ, and Zhuyin (TPS)
- Supports tone mark / tone number conversion
- Ported and extended from [Tailo-TPS-Converter](references/Tailo-TPS-Converter) and [KeSi](references/KeSi)

## Project Structure

- `src/` - ES module source
  - `tables.js` - all mapping data (initials, finals, tones, TL/POJ/Zhuyin maps)
  - `phonetics.js` - syllable parsing (`parseSyllable`, `stripToneMark`, `isStopTone`)
  - `tl.js` - TL (Tai-lo) assembly with tone mark placement
  - `poj.js` - POJ (Pe-oh-e-ji) assembly with tone mark placement
  - `zhuyin.js` - Zhuyin/TPS conversion (tone-numbered TL input)
  - `converter.js` - public API (`convert`, `toToneNumber`, `toToneMark`)
  - `index.js` - re-exports public API
- `tests/` - test suite (Node.js built-in test runner)
- `web/index.html` - single-page web interface
- `references/` - original reference implementations (gitignored)

## Development

- **Runtime**: Node.js 22+
- **Test framework**: `node:test` (built-in)
- No external dependencies

## Commands

- `node --test tests/` - run tests
- `npx serve docs/` or `python3 -m http.server -d web 8000` - local web testing

## Web Interface

- `web/index.html` - Single-page app importing from `../src/converter.js`
- Deployed to GitHub Pages via `.github/workflows/deploy.yml`
- No build step required - pure HTML/CSS/JS with ES modules

## Conventions

- No comments in code
- English only
- No emojis in code or docs
