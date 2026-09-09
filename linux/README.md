# Taigi Keyboard for Linux

This is the Linux desktop front end for the shared Rust engine. It provides an
Fcitx 5 addon and an IBus engine, covering Ubuntu GNOME as well as other X11
and Wayland desktops.

## Build and install

From the repository root:

```sh
cargo build --manifest-path engine/Cargo.toml -p linux-ffi --release
cmake -S linux -B build/linux -DCMAKE_BUILD_TYPE=Release
cmake --build build/linux -j
sudo cmake --install build/linux
```

For Fcitx, restart Fcitx 5, open `fcitx5-config-qt`, add **Taigi Keyboard**,
and switch to it with the normal Fcitx shortcut. For Ubuntu GNOME, select IBus
as the input framework, restart the session if necessary, and add **Taigi
Keyboard** in the system input-source settings. Type romanization;
Space selects the first candidate, number keys or a mouse click select a
candidate, Enter commits the current preedit, Backspace edits it, and Escape
cancels it. `Ctrl+Shift+1`, `Ctrl+Shift+2`, and `Ctrl+Shift+3` select TL, POJ,
and TPS respectively.

The package currently installs the bundled dictionary artifacts and the
`dictionary/LICENSE` file must accompany any redistribution. The repository's
merged dictionary is non-commercial because its source licenses are mixed.

## Scope of this first Linux port

Both native input paths support normal composition, candidate selection, and
TL/POJ/TPS switching. Settings UI, user-frequency learning, and continuous
next-word prediction are planned follow-ups; the Rust engine already contains
most of the reusable logic for those features.
