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
    def test_key_release_is_not_processed(self):
        engine = ibus_taigi.TaigiEngine.__new__(ibus_taigi.TaigiEngine)
        release = ibus_taigi.IBus.ModifierType.RELEASE_MASK
        self.assertFalse(engine.do_process_key_event(ibus_taigi.IBus.KEY_a, 0, release))


if __name__ == "__main__":
    unittest.main()
