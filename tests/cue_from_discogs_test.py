import os
import unittest
from unittest.mock import MagicMock, patch, mock_open
import sys
import discogs_client

sys.path.insert(1, os.path.join(os.path.dirname(__file__), '..'))


from lib.log import log
from lib.config_controler import Config
from lib.change_log import ChangeLog


change_log = ChangeLog()
config_controler = Config()

import lib.cue_from_discogs as script

class TestCueFromDiscogs(unittest.TestCase):

  def test_string_to_boolean(self):
    self.assertTrue(script.string_to_boolean('true'))
    self.assertTrue(script.string_to_boolean('yes'))
    self.assertTrue(script.string_to_boolean('1'))
    self.assertFalse(script.string_to_boolean('false'))
    self.assertFalse(script.string_to_boolean('no'))
    self.assertFalse(script.string_to_boolean('0'))
    with self.assertRaises(ValueError):
        script.string_to_boolean('maybe')

  def test_add_durations(self):
    self.assertEqual(script.add_durations(['00:00', '00:00']), '00:00')
    self.assertEqual(script.add_durations(['00:30', '01:40']), '02:10')
    self.assertEqual(script.add_durations(['59:59', '00:01']), '60:00')
    with self.assertRaises(IndexError):
        script.add_durations(['60:60'])

  @patch('builtins.open', new_callable=mock_open)
  @patch('os.path.exists', return_value=False)
  def test_save_cue(self, mock_exists, mock_open):
    mock_release = MagicMock()
    mock_release.id = 12345
    mock_release.artists = [MagicMock(name='Artist')]
    mock_release.title = 'Album Title'
    mock_release.tracklist = [
      MagicMock(position='1', title='Track 1', duration='02:30', artists=[MagicMock(name='Artist')])
    ]
    mock_release.data = {'barcode': '123456789'}

    print(mock_open().write.call_args_list)
    script.save_cue(mock_release, '/path/to/file.mp3', 'true')
    

    
    mock_open.assert_called_with('/path/to/file.cue', 'w', encoding='utf-8')
    mock_open().write.assert_any_call('CATALOG "123456789"\n')
    # mock_open().write.assert_any_call('PERFORMER "Artist"\n')
    mock_open().write.assert_any_call('TITLE "Album Title"\n')
    mock_open().write.assert_any_call('FILE "file.mp3" MP3\n')
    mock_open().write.assert_any_call('  TRACK 01 AUDIO\n')
    mock_open().write.assert_any_call('    TITLE "Track 1"\n')
    # mock_open().write.assert_any_call('    PERFORMER "Artist"\n')
    mock_open().write.assert_any_call('    INDEX 01 00:00:00\n')

  @patch('discogs_client.Client')
  @patch.object(Config, 'get_key', return_value='fake_token')
  def test_get_discogs_data(self, mock_get_key, mock_discogs_client):
    mock_release = MagicMock()
    mock_discogs_client().release.return_value = mock_release

    script.get_discogs_data(12345, '/path/to/file.mp3', 'true')
    
    mock_discogs_client().release.assert_called_with(12345)
    mock_get_key.assert_called_with('discogs_token')

  @patch('builtins.open', new_callable=mock_open, read_data='12345\ntrue')
  @patch('lib.cue_from_discogs.get_discogs_data')
  @patch('lib.cue_from_discogs.change_log.playlist_created')
  def test_cue_from_releaseid(self, mock_playlist_created, mock_get_discogs_data, mock_open):
    script.cue_from_releaseid('releaseid.txt', '/path/to/file.mp3')
    
    mock_get_discogs_data.assert_called_with('12345', '/path/to/file.mp3', 'true')
    mock_playlist_created.assert_called_once()

if __name__ == '__main__':
  unittest.main()
