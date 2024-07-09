import unittest
from unittest.mock import patch
import os
import sys

sys.path.insert(1, os.path.join(os.path.dirname(__file__), '..'))

from lib.get_folder_size import get_folder_size, readable_size

class TestFolderSize(unittest.TestCase):

  def test_readable_size(self):
    self.assertEqual(readable_size(1023), "1023.00 B")
    self.assertEqual(readable_size(1024), "1.00 KB")
    self.assertEqual(readable_size(1048576), "1.00 MB")
    self.assertEqual(readable_size(1073741824), "1.00 GB")
    self.assertEqual(readable_size(1099511627776), "1.00 TB")

  @patch('lib.get_folder_size.os.walk')
  @patch('lib.get_folder_size.os.path.getsize')
  def test_get_folder_size(self, mock_getsize, mock_walk):
    # Mock the os.walk to return a predefined structure
    mock_walk.return_value = [
      (os.path.normpath('/folder'), (os.path.normpath('subfolder'),), (os.path.normpath('file1'), os.path.normpath('file2'))),
      (os.path.normpath('/folder/subfolder'), (), (os.path.normpath('file3'),)),
    ]
    
    # Mock the os.path.getsize to return a fixed size for each file
    def mock_getsize(filepath):
      file_sizes = {
        os.path.normpath('/folder/file1'): 1024,       # 1 KB
        os.path.normpath('/folder/file2'): 2048,       # 2 KB
        os.path.normpath('/folder/subfolder/file3'): 3072,  # 3 KB
      }
      return file_sizes.get(filepath, 0)
    
    mock_getsize.side_effect = mock_getsize
    
    result = get_folder_size('/folder')
    self.assertEqual(result, "6.00 KB")

  @patch('lib.get_folder_size.os.walk')
  @patch('lib.get_folder_size.os.path.getsize')
  def test_get_folder_size_with_errors(self, mock_getsize, mock_walk):
      # Mock the os.walk to return a predefined structure
      mock_walk.return_value = [
        (os.path.normpath('/folder'), (os.path.normpath('subfolder'),), (os.path.normpath('file1'), os.path.normpath('file2'))),
        (os.path.normpath('/folder/subfolder'), (), (os.path.normpath('file3'),)),
      ]
      
      # Mock the os.path.getsize to return a fixed size for each file and raise an exception for one file
      def mock_getsize_with_errors(filepath):
        file_sizes = {
          os.path.normpath('/folder/file1'): 1024,       # 1 KB
          os.path.normpath('/folder/subfolder/file3'): 3072,  # 3 KB
        }
        if filepath == os.path.normpath('/folder/file2'):
          raise OSError("Error getting file size")
        return file_sizes.get(filepath, 0)
      
      mock_getsize.side_effect = mock_getsize_with_errors
      
      result = get_folder_size('/folder')
      self.assertEqual(result, "4.00 KB")

if __name__ == '__main__':
  unittest.main()
