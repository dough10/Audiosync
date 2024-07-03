import unittest
from unittest.mock import patch, mock_open, MagicMock
import os
import sys
import json

sys.path.insert(1, os.path.join(os.path.dirname(__file__), '..'))

import lib.cue_from_discogs 


class TestCueFromDiscogs(unittest.TestCase):

    @patch('lib.cue_from_discogs.os.path.abspath')
    @patch('lib.cue_from_discogs.os.path.dirname')
    @patch('lib.cue_from_discogs.open', new_callable=mock_open, read_data='{"discogs_token": "fake_token"}')
    def setUp(self, mock_open, mock_dirname, mock_abspath):
        mock_abspath.return_value = '/path/to/script/cue_from_discogs.py'
        mock_dirname.return_value = '/path/to/script'
        self.config = {
            'discogs_token': 'fake_token'
        }
        self.mock_open = mock_open

    def test_string_to_boolean(self):
        self.assertTrue(lib.cue_from_discogs.string_to_boolean('true'))
        self.assertTrue(lib.cue_from_discogs.string_to_boolean('yes'))
        self.assertTrue(lib.cue_from_discogs.string_to_boolean('1'))
        self.assertFalse(lib.cue_from_discogs.string_to_boolean('false'))
        self.assertFalse(lib.cue_from_discogs.string_to_boolean('no'))
        self.assertFalse(lib.cue_from_discogs.string_to_boolean('0'))
        with self.assertRaises(ValueError):
            lib.cue_from_discogs.string_to_boolean('invalid')

    @patch('lib.cue_from_discogs.os.path.exists')
    @patch('lib.cue_from_discogs.open', new_callable=mock_open)
    def test_save_cue(self, mock_open, mock_exists):
        mock_exists.return_value = False

        release = MagicMock()
        release.id = 12345
        release.artists = [MagicMock(name='Artist')]
        release.title = 'Album Title'
        release.tracklist = [
            MagicMock(position='1', title='Track 1', duration='03:30', artists=[MagicMock(name='Artist')]),
            MagicMock(position='2', title='Track 2', duration='04:00', artists=[MagicMock(name='Artist')])
        ]
        release.data = {'barcode': '123456789'}

        mp3_path = '/path/to/music/file.mp3'
        gapless = 'false'

        lib.cue_from_discogs.save_cue(release, mp3_path, gapless)

        mock_open.assert_called_with('/path/to/music/file.cue', 'w', encoding='utf-8')

    def test_add_durations(self):
        self.assertEqual(lib.cue_from_discogs.add_durations(['00:00', '03:30']), '03:30')
        self.assertEqual(lib.cue_from_discogs.add_durations(['03:30', '04:00']), '07:30')
        self.assertEqual(lib.cue_from_discogs.add_durations(['07:30', '00:30']), '08:00')
        with self.assertRaises(ValueError):
            lib.cue_from_discogs.add_durations(['07:30', 'invalid'])

    @patch('lib.cue_from_discogs.open', new_callable=mock_open, read_data='12345\nfalse')
    @patch('lib.cue_from_discogs.get_discogs_data')
    @patch('lib.cue_from_discogs.log')
    def test_cue_from_releaseid(self, mock_log, mock_get_discogs_data, mock_open):
        changes = {'playlist_created': 0}
        lib.cue_from_discogs.cue_from_releaseid('/path/to/releaseid.txt', '/path/to/music/file.mp3', changes)
        mock_get_discogs_data.assert_called_with('12345', '/path/to/music/file.mp3', 'false')
        self.assertEqual(changes['playlist_created'], 1)

        # Test error handling
        mock_open.side_effect = IOError
        changes['playlist_created'] = 0
        lib.cue_from_discogs.cue_from_releaseid('/path/to/releaseid.txt', '/path/to/music/file.mp3', changes)
        mock_log.assert_called_with('Error reading releaseid /path/to/releaseid.txt')

if __name__ == '__main__':
    unittest.main()
