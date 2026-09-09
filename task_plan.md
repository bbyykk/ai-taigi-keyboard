# Ubuntu Taigi Input Method Study

Status: complete

## Goal
Study taigikeyboard/taigikeyboard and produce an implementation plan for a usable current Linux/Ubuntu Taigi input method.

## Phases
### Phase 1 — Upstream study
**Status:** complete

### Phase 2 — Ubuntu framework research
**Status:** complete

### Phase 3 — Fcitx 5 implementation and validation
**Status:** complete

### Phase 4 — TL/POJ/TPS and candidate selection
**Status:** complete

### Phase 5 — Native IBus adapter
**Status:** complete

### Phase 6 — IBus registration documentation
**Status:** complete

### Phase 7 — User documentation and activation instructions
**Status:** complete

## Decisions
- Treat the request as architecture and execution planning; do not modify the existing workspace application.

## Errors Encountered
- `session-catchup.py` reported that the workspace is not a Git repository; continue with read-only research.
- A full upstream composing test has one pre-existing dictionary corpus-frequency drift assertion; Linux-specific tests are green.
- The first CMake install used `/usr/local` while the addon binary expected `/usr/share`; corrected the install path and addon library metadata, then reinstalled under `/usr`.
- `rustfmt` is not on PATH as a standalone binary and a root-level cargo command was invoked from the wrong directory; neither affects the successful scoped build/test commands.
