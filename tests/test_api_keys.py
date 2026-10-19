import re
import subprocess
import tempfile
import unittest
from pathlib import Path
from zipfile import ZipFile


class ApiKeyTest(unittest.TestCase):
    def test_build_and_cache_contain_no_recognizable_keys(self):
        patterns = (
            re.compile(b'AIza' + rb'[A-Za-z0-9_-]{30,}'),
            re.compile(b'sb_' + rb'(?:publishable|secret)_[A-Za-z0-9_-]{12,}'),
            re.compile(rb'(?<![A-Za-z0-9_-])sk-' + rb'(?:proj-)?[A-Za-z0-9_-]{20,}'),
        )
        with tempfile.TemporaryDirectory() as directory:
            subprocess.run(['bash', 'build.sh', directory], check=True)
            for path in Path(directory).rglob('*'):
                if path.is_file():
                    data = path.read_bytes()
                    for pattern in patterns:
                        self.assertIsNone(pattern.search(data), str(path))
        with ZipFile('hts-cache/new.zip') as archive:
            for entry in archive.infolist():
                data = archive.read(entry)
                for pattern in patterns:
                    self.assertIsNone(pattern.search(data), entry.filename)


if __name__ == '__main__':
    unittest.main()
