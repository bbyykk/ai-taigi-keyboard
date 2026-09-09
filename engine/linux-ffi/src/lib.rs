//! Small C ABI for the Linux front end.
//!
//! The Fcitx addon is intentionally kept free of protobuf and Rust details.
//! This seam is line-oriented: each call returns UTF-8 records describing the
//! current preedit and candidates. The returned buffer is freed by the paired
//! function below.

use composing::EngineHandle;
use once_cell::sync::OnceCell;
use protos::engine::{
    composing_request, lexicon_request, AppConfig, ComposingRequest, InstallRequest,
    LexiconRequest, Platform,
};
use std::ffi::{c_char, c_int, CStr, CString};
use std::sync::Mutex;

struct State {
    generation: u64,
    input_mode: String,
    candidates: Vec<(String, u32, u32, String)>,
}

static STATE: OnceCell<Mutex<State>> = OnceCell::new();

fn config(input_mode: &str) -> AppConfig {
    AppConfig {
        tone_mode: "numbers".into(),
        input_mode: input_mode.into(),
        oo_doubletap_enabled: true,
        nn_doubletap_enabled: true,
        is_translate_swapped: false,
        is_association_recording_enabled: false,
        platform_id: Platform::Macos as i32,
        output_both_scripts: true,
        candidate_display_mode: 1,
    }
}

fn dispatch(req: ComposingRequest, state: &mut State) -> String {
    let response = EngineHandle::instance()
        .handle(&req, &config(&state.input_mode), state.generation)
        .unwrap_or_default();
    let preedit = response.preedit.as_ref().map(|p| p.display_text.as_str()).unwrap_or("");
    let mut out = format!("preedit={}\ncomposing={}\n", escape(preedit), response.is_composing);
    for effect in &response.effect {
        if let Some(kind) = &effect.kind {
            match kind {
                protos::engine::effect::Kind::CommitTextReplacingPreedit(value) => out.push_str(&format!("commit={}\n", escape(&value.text))),
                protos::engine::effect::Kind::DeleteBackwardFromDocument(_) => out.push_str("delete=1\n"),
                protos::engine::effect::Kind::ClearPreeditWithoutCommit(_) => out.push_str("clear=1\n"),
                _ => {}
            }
        }
    }
    if let Some(continuous) = response.continuous {
        out.push_str("candidates_begin=1\n");
        state.candidates = continuous
            .candidates
            .iter()
            .map(|c| (c.display_text.clone(), c.consumed_span_end, c.syllable_count, c.canonical_tl.clone()))
            .collect();
        for (i, candidate) in continuous.candidates.iter().enumerate() {
            out.push_str(&format!("candidate={}\t{}\n", i, escape(&candidate.display_text)));
        }
    }
    out
}

fn escape(value: &str) -> String {
    value.replace('\\', "\\\\").replace('\n', "\\n").replace('\t', "\\t")
}

fn unescape(value: &str) -> String {
    let mut out = String::new();
    let mut escaped = false;
    for c in value.chars() {
        if escaped {
            out.push(match c { 'n' => '\n', 't' => '\t', other => other });
            escaped = false;
        } else if c == '\\' { escaped = true; } else { out.push(c); }
    }
    out
}

#[no_mangle]
pub extern "C" fn taigi_linux_init(dict_dir: *const c_char) -> c_int {
    let dir = unsafe { CStr::from_ptr(dict_dir) }.to_string_lossy();
    let request = LexiconRequest {
        method: Some(lexicon_request::Method::Install(InstallRequest {
            trie_path: format!("{dir}/dictionary.fst"),
            dictionary_bin_path: format!("{dir}/dictionary.bin"),
            association_bin_path: format!("{dir}/association.bin"),
            dictionary_version: 1,
            syllable_inventory_path: format!("{dir}/syllables.fst"),
        })),
    };
    if lexicon::dispatch::handle(request.method.unwrap()).is_err() { return 0; }
    STATE.set(Mutex::new(State { generation: 1, input_mode: "tl".into(), candidates: Vec::new() })).ok();
    1
}

#[no_mangle]
pub extern "C" fn taigi_linux_command(command: *const c_char) -> *mut c_char {
    let command = unsafe { CStr::from_ptr(command) }.to_string_lossy();
    let Some(lock) = STATE.get() else { return CString::new("error=not-initialized\n").unwrap().into_raw(); };
    let mut state = lock.lock().unwrap();
    let result = match command.as_ref() {
        "reset" => dispatch(ComposingRequest { method: Some(composing_request::Method::Reset(Default::default())) }, &mut state),
        "backspace" => dispatch(ComposingRequest { method: Some(composing_request::Method::DeleteBackward(Default::default())) }, &mut state),
        "commit" => dispatch(ComposingRequest { method: Some(composing_request::Method::CommitDerived(Default::default())) }, &mut state),
        command if command.starts_with("mode=") => {
            let mode = &command[5..];
            if matches!(mode, "tl" | "poj" | "tps") {
                state.input_mode = mode.into();
                state.generation = state.generation.wrapping_add(1);
                dispatch(ComposingRequest { method: Some(composing_request::Method::Reset(Default::default())) }, &mut state)
            } else { "error=unknown-mode\n".into() }
        }
        command if command.starts_with("append=") => {
            let mut result = dispatch(ComposingRequest { method: Some(composing_request::Method::Append(protos::engine::Append { char: unescape(&command[7..]) })) }, &mut state);
            result.push_str(&dispatch(ComposingRequest { method: Some(composing_request::Method::EnterContinuous(Default::default())) }, &mut state));
            result.push_str(&dispatch(ComposingRequest { method: Some(composing_request::Method::FetchAtPos(protos::engine::FetchAtPos { position: 0, frequency_entries: Vec::new(), now_ms: 0, custom_entries: Vec::new(), enabled_sources_bitmask: 0, literal_roman_candidate_disabled: false })) }, &mut state));
            result
        }
        command if command.starts_with("select=") => {
            let index: usize = command[7..].parse().unwrap_or(0);
            let (display, end, syllables, canonical) = state.candidates.get(index).cloned().unwrap_or_default();
            dispatch(ComposingRequest { method: Some(composing_request::Method::CommitContinuous(protos::engine::CommitContinuous { display_text: display, consumed_bytes: end, syllable_count: syllables, canonical_text: String::new(), association_tl: canonical })) }, &mut state)
        }
        _ => "error=unknown-command\n".into(),
    };
    CString::new(result).unwrap_or_else(|_| CString::new("error=invalid-output\n").unwrap()).into_raw()
}

#[no_mangle]
pub extern "C" fn taigi_linux_free(value: *mut c_char) { if !value.is_null() { unsafe { drop(CString::from_raw(value)); } } }

#[cfg(test)]
mod tests {
    use super::*;
    use std::ffi::CString;

    #[test]
    fn initializes_dictionary_and_composes() {
        let directory = CString::new(format!("{}/../../dictionaries", env!("CARGO_MANIFEST_DIR"))).unwrap();
        assert_eq!(taigi_linux_init(directory.as_ptr()), 1);
        let append = CString::new("append=t").unwrap();
        let response = taigi_linux_command(append.as_ptr());
        let text = unsafe { CStr::from_ptr(response) }.to_string_lossy().into_owned();
        taigi_linux_free(response);
        assert!(text.contains("preedit=t"));
        assert!(text.contains("candidate="));
    }
}
