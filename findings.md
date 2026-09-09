# Findings

## Upstream

- Repository README describes a shared Rust engine in `engine/` for phonetics, composing, lexicon/ranking, next-word prediction, and dispatch.
- Existing platform glue is Swift/InputMethodKit (`macos/`), Kotlin/JNI (`android/`), and Rust/Windows TSF (`windows/`). There is no Linux front end.
- `engine/dispatch::process_request(&[u8]) -> Vec<u8>` is a stable protobuf bytes-in/bytes-out seam, but a native Linux front end can link the Rust crates directly for less FFI overhead.
- `engine/composing::Engine` and `EngineHandle` expose the state machine; `lexicon` owns mmap/FST dictionary artifacts. The repository already includes `dictionaries/*.fst` and `*.bin` artifacts.
- The engine workspace is Rust 1.86, edition 2021, with `unsafe_code` forbidden except the controlled mmap/FFI crates.
- Dictionary licensing is mixed and the compiled merged dictionary is explicitly non-commercial; any Linux package must preserve `dictionary/LICENSE` and attribution and should not assume commercial redistribution rights.

## Linux integration

- Fcitx 5 officially supports X11 and Wayland and provides a documented shared-library input-method addon layout under `share/fcitx5` plus `lib/fcitx5`.
- IBus exposes an `IBusEngine` abstraction and is deeply integrated into GNOME/Ubuntu, but implementing both Fcitx 5 and IBus immediately would duplicate the front end.
- Recommended first target: Fcitx 5 addon, with IBus compatibility or a second thin adapter after the composing/commit contract is stable.
