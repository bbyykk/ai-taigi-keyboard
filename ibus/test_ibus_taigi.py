import importlib.machinery
import importlib.util
import pathlib
import unittest


MODULE_PATH = pathlib.Path(__file__).with_name("ibus-taigi")
LOADER = importlib.machinery.SourceFileLoader("ibus_taigi", str(MODULE_PATH))
SPEC = importlib.util.spec_from_loader("ibus_taigi", LOADER)
ibus_taigi = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ibus_taigi)


class IBusEventTest(unittest.TestCase):
    def test_delete_response_deletes_one_character_from_document(self):
        class FakeEngine:
            rust = type("Rust", (), {"command": lambda self, _: "preedit=\ncomposing=false\ndelete=1\n"})()
            candidates = []
            composing = False

            def __init__(self):
                self.deletes = []
                self.preedits = []
                self.lookups = []

            def delete_surrounding_text(self, offset, count):
                self.deletes.append((offset, count))

            def update_preedit_text(self, text, cursor, visible):
                self.preedits.append((text.text, cursor, visible))

            def update_lookup_table(self, table, visible):
                self.lookups.append(visible)

        engine = FakeEngine()
        ibus_taigi.TaigiEngine.apply(engine, "backspace")
        self.assertEqual(engine.deletes, [(-1, 1)])

    def test_key_release_is_not_processed(self):
        engine = ibus_taigi.TaigiEngine.__new__(ibus_taigi.TaigiEngine)
        release = ibus_taigi.IBus.ModifierType.RELEASE_MASK
        self.assertFalse(engine.do_process_key_event(ibus_taigi.IBus.KEY_a, 0, release))

    def test_shift_tap_toggles_language_mode(self):
        engine = ibus_taigi.TaigiEngine.__new__(ibus_taigi.TaigiEngine)
        engine.language_mode = "taigi"
        engine.composing = False
        engine.candidates = []
        engine.apply = lambda command: self.fail(
            "a mode switch with no composition must not call the engine"
        )
        engine.shift_tap = ibus_taigi.ShiftTapTracker(
            clock=iter([1.0, 1.1]).__next__
        )

        self.assertFalse(engine.do_process_key_event(ibus_taigi.IBus.KEY_Shift_L, 0, 0))
        self.assertFalse(
            engine.do_process_key_event(
                ibus_taigi.IBus.KEY_Shift_L,
                0,
                ibus_taigi.IBus.ModifierType.RELEASE_MASK,
            )
        )
        self.assertEqual(engine.language_mode, "english")

    def test_shift_plus_letter_is_not_a_mode_switch(self):
        engine = ibus_taigi.TaigiEngine.__new__(ibus_taigi.TaigiEngine)
        engine.language_mode = "taigi"
        engine.composing = False
        engine.candidates = []
        commands = []
        engine.apply = commands.append
        engine.shift_tap = ibus_taigi.ShiftTapTracker(
            clock=iter([1.0, 1.1]).__next__
        )

        self.assertFalse(engine.do_process_key_event(ibus_taigi.IBus.KEY_Shift_L, 0, 0))
        self.assertTrue(
            engine.do_process_key_event(
                ord("A"),
                0,
                ibus_taigi.IBus.ModifierType.SHIFT_MASK,
            )
        )
        self.assertFalse(
            engine.do_process_key_event(
                ibus_taigi.IBus.KEY_Shift_L,
                0,
                ibus_taigi.IBus.ModifierType.RELEASE_MASK,
            )
        )
        self.assertEqual(engine.language_mode, "taigi")
        self.assertEqual(commands, ["append=A"])

    def test_standard_candidate_slots_use_free_letters_not_tone_digits(self):
        engine = ibus_taigi.TaigiEngine.__new__(ibus_taigi.TaigiEngine)
        engine.language_mode = "taigi"
        engine.composing = True
        engine.candidates = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
        commands = []
        engine.apply = commands.append
        engine.shift_tap = ibus_taigi.ShiftTapTracker(clock=iter([]).__next__)

        self.assertTrue(engine.do_process_key_event(ord("q"), 0, 0))
        self.assertTrue(engine.do_process_key_event(ord("5"), 0, 0))
        self.assertEqual(commands, ["select=0", "append=5"])

    def test_shifted_candidate_slot_is_text(self):
        engine = ibus_taigi.TaigiEngine.__new__(ibus_taigi.TaigiEngine)
        engine.language_mode = "taigi"
        engine.composing = True
        engine.candidates = ["one"]
        commands = []
        engine.apply = commands.append
        engine.shift_tap = ibus_taigi.ShiftTapTracker(clock=iter([]).__next__)

        self.assertTrue(
            engine.do_process_key_event(
                ord("Q"),
                0,
                ibus_taigi.IBus.ModifierType.SHIFT_MASK,
            )
        )
        self.assertEqual(commands, ["append=Q"])

    def test_candidate_slot_labels_match_the_keys(self):
        self.assertEqual(ibus_taigi.CANDIDATE_SLOT_KEYS, "qwdfzxvy;")


if __name__ == "__main__":
    unittest.main()
