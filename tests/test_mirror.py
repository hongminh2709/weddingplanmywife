import json
import re
import unittest
from pathlib import Path


class MirrorStreamTest(unittest.TestCase):
    def test_next_text_frames_have_correct_byte_lengths(self):
        for page in Path('chungdoi.com/i').glob('hongminh-khanhlinh*.html'):
            scripts = re.findall(r'self\.__next_f\.push\((\[1,".*?"\])\)</script>', page.read_text(), re.S)
            parts = [json.loads(script)[1] for script in scripts]
            self.assertTrue(parts, page)
            for index, part in enumerate(parts[:-1]):
                header = re.search(r'([\da-f]+):T([\da-f]+),$', part)
                if header:
                    self.assertEqual(int(header.group(2), 16), len(parts[index + 1].encode()), f'{page}: frame {header.group(1)}')


if __name__ == '__main__':
    unittest.main()
