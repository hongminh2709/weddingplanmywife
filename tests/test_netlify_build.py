import os
import subprocess
import tempfile
import unittest
from pathlib import Path


class NetlifyBuildTest(unittest.TestCase):
    def test_build_contains_site_and_assets_without_private_mirror_files(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / 'site'
            env = {**os.environ, 'URL': 'https://example.netlify.app'}
            subprocess.run(['bash', 'build.sh', str(output)], check=True, env=env)
            for path in (
                'index.html',
                'chungdoi.com/i/hongminh-khanhlinh.html',
                '_next/static/css/f0c5e11479c4461e.css',
                'fonts/ViaodaLibre-Regular.ttf',
                'images/themes/minimalism-dark-red/flower2-decoration.webp',
                'local/guestbook.js',
                'cdn.chungdoi.com/uploads/fd5cd203-8da7-4ea6-8f76-fd2389d3a7f5.jpg',
                'manifest.json',
            ):
                self.assertTrue((output / path).is_file(), path)
            for path in ('cookies.txt', 'hts-cache', 'hts-log.txt', 'tests', 'supabase'):
                self.assertFalse((output / path).exists(), path)
            self.assertTrue((output / 'admin/index.html').is_file())
            page = (output / 'chungdoi.com/i/hongminh-khanhlinh.html').read_text()
            self.assertIn('data-landing-screenshot-id="invite-envelope"', page)
            self.assertIn('/local/personalized-invitation.js', page)


if __name__ == '__main__':
    unittest.main()
