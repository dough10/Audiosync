import unittest
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(1, os.path.join(os.path.dirname(__file__), '..'))

import lib.select_folder


class TestFolderSelection(unittest.TestCase):

    @patch('lib.select_folder.filedialog.askdirectory')
    @patch('lib.select_folder.platform.system')
    def test_select_folder_windows(self, mock_platform, mock_askdirectory):
        mock_platform.return_value = 'Windows'
        mock_askdirectory.return_value = 'C:/Users/User/Documents'

        result = lib.select_folder.select_folder()
        self.assertEqual(result, 'C:\\Users\\User\\Documents\\')

    @patch('lib.select_folder.filedialog.askdirectory')
    @patch('lib.select_folder.platform.system')
    def test_select_folder_linux(self, mock_platform, mock_askdirectory):
        mock_platform.return_value = 'Linux'
        mock_askdirectory.return_value = '/home/user/documents'

        result = lib.select_folder.select_folder()
        self.assertEqual(result, '/home/user/documents/')

    @patch('lib.select_folder.filedialog.askdirectory')
    @patch('lib.select_folder.platform.system')
    def test_no_folder_selected(self, mock_platform, mock_askdirectory):
        mock_platform.return_value = 'Windows'
        mock_askdirectory.return_value = ''

        result = lib.select_folder.select_folder()
        self.assertFalse(result)

if __name__ == '__main__':
    unittest.main()
