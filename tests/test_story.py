import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from story import validate_story


class ThemeContractTests(unittest.TestCase):
    def setUp(self):
        self.story = json.loads((ROOT / 'examples/survivorship.json').read_text())

    def test_both_explicit_examples_resolve_their_own_modules(self):
        modules = []
        for name in ['hepai', 'survivorship']:
            story = json.loads((ROOT / f'examples/{name}.json').read_text())
            modules.append(validate_story(story, ROOT / 'examples'))
        self.assertNotEqual(modules[0], modules[1])

    def test_text_only_story_fails_before_creating_output(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            story = copy.deepcopy(self.story)
            del story['scene_module']
            (base / 'story.json').write_text(json.dumps(story))
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/build.py'),
                                     '--story', str(base / 'story.json'),
                                     '--out', str(base / 'composition')], capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn(b'not a fallback', result.stderr)
            self.assertFalse((base / 'composition').exists())

    def test_missing_module_does_not_select_hepai(self):
        self.story['scene_module'] = 'not-created.js'
        with self.assertRaisesRegex(ValueError, 'not found'):
            validate_story(self.story, ROOT / 'examples')

    def test_time_gap_and_incomplete_film_are_rejected(self):
        for field, value in [('start', 1), ('end', 89)]:
            story = copy.deepcopy(self.story)
            story['scenes'][0 if field == 'start' else -1][field] = value
            with self.assertRaises(ValueError):
                validate_story(story, ROOT / 'examples')

    def test_unexplained_scene_is_rejected(self):
        self.story['scenes'][0]['meaning'] = ''
        with self.assertRaisesRegex(ValueError, 'meaning'):
            validate_story(self.story, ROOT / 'examples')


if __name__ == '__main__':
    unittest.main()
