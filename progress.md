# Progress Log

- Initialized the planning files for the Ubuntu Taigi input-method study.
- Read the planning-with-files instructions.
- Cloned the upstream repository with its converter submodule into a temporary study checkout, inspected the engine and macOS/Windows layouts, and copied the source into this workspace for implementation.
- Selected Fcitx 5 as the first Linux integration target because it covers both X11 and Wayland and has a documented native addon model.
- Added `engine/linux-ffi`, a C ABI over the existing composing/lexicon engine, plus `linux/` Fcitx 5 addon, metadata, CMake install, dictionary packaging, and usage documentation.
- Installed Ubuntu dependencies (`cargo`, `rustc`, `cmake`, `protobuf-compiler`, Fcitx 5 development/runtime packages) and installed the addon under `/usr`.
- Verification: `cargo test -p linux-ffi` passes; CMake release build passes; Fcitx test profile loads `taigi` cleanly on this Ubuntu 26.04 GNOME Wayland session.
- Added runtime TL/POJ/TPS switching (`Ctrl+Shift+1/2/3`) and selectable candidate objects for mouse-driven Fcitx panels; rebuilt and reinstalled successfully.
- Generated `docs/linux-ubuntu-port.md` and indexed it in `docs/README.md`.
- Task closed: documentation requested by the user is complete and linked from the documentation index.
- Added the native IBus Python/GObject adapter (`ibus/ibus-taigi`) and component descriptor, installed them under `/usr/libexec` and `/usr/share/ibus/component`, and validated Python syntax plus startup under a temporary D-Bus/IBus session.
- Added IBus `--xml` discovery output, refreshed the system engine cache, and documented the Ubuntu-native activation path.
- Published the completed source to `bbyykk/ai-taigi-keyboard`, verified remote `main`, retained the former working tree as a timestamped backup, and replaced the original local path with a fresh clone from the personal repository.
