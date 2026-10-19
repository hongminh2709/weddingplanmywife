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
            home = (output / 'index.html').read_text()
            self.assertIn('THÔNG TIN TIỆC CƯỚI', home)
            self.assertIn('initialEnvelopeOpen\\":false', home)
            self.assertIn('data-landing-screenshot-id="invite-envelope"', home)
            self.assertIn('content="https://example.netlify.app/cdn.chungdoi.com/uploads/4fc1d983-574d-41fa-8665-38e071d95976.jpg"', home)
            self.assertIn('property="og:url" content="https://example.netlify.app/"', home)


if __name__ == '__main__':
    unittest.main()
