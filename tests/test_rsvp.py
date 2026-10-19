import json
import re
import unittest
from pathlib import Path


class InvitationRsvpTest(unittest.TestCase):
    def test_saved_invitations_disable_rsvp(self):
        pages = list(Path('chungdoi.com/i').glob('hongminh-khanhlinh*.html'))
        self.assertTrue(pages)
        for page in pages:
            scripts = re.findall(r'self\.__next_f\.push\((\[1,".*?"\])\)</script>', page.read_text(), re.S)
            stream = ''.join(json.loads(script)[1] for script in scripts)
            marker = '"initialData":'
            start = stream.index(marker) + len(marker)
            invitation, _ = json.JSONDecoder().raw_decode(stream[start:])
            self.assertIs(invitation['data']['showRsvp'], False, str(page))


if __name__ == '__main__':
    unittest.main()
