import unittest
from unittest.mock import patch, mock_open, MagicMock
import json
import os
import sys

sys.path.insert(1, os.path.join(os.path.dirname(__file__), '..'))

from lib.config_controler import Config

class TestConfig(unittest.TestCase):
  def setUp(self):
    self.mock_json_data = {
      "key1": "value1",
      "key2": "value2"
    }
    self.mock_config_path = os.path.abspath(__file__)
    self.mock_script_folder = os.path.dirname(self.mock_config_path)
    self.mock_full_config_path = os.path.join(self.mock_script_folder, '..', 'config.json')

  @patch("builtins.open", new_callable=mock_open, read_data=json.dumps({"key1": "value1", "key2": "value2"}))
  @patch("os.path.join", return_value="mock_config_path")
  @patch("os.path.abspath")
  @patch("os.path.dirname")
  def test_init_success(self, mock_dirname, mock_abspath, mock_join, mock_open):
    mock_abspath.return_value = self.mock_config_path
    mock_dirname.return_value = self.mock_script_folder
    mock_join.return_value = self.mock_full_config_path

    config = Config()
    self.assertEqual(config.get(), self.mock_json_data)

  @patch("builtins.open", new_callable=mock_open, read_data=json.dumps({"key1": "value1", "key2": "value2"}))
  @patch("os.path.join", return_value="mock_config_path")
  @patch("os.path.abspath")
  @patch("os.path.dirname")
  def test_update_success(self, mock_dirname, mock_abspath, mock_join, mock_open):
    mock_abspath.return_value = self.mock_config_path
    mock_dirname.return_value = self.mock_script_folder
    mock_join.return_value = self.mock_full_config_path

    config = Config()
    updated_data = config.update({"key1": "new_value1", "key3": "value3"})
    expected_data = {"key1": "new_value1", "key2": "value2"}
    self.assertEqual(updated_data, expected_data)

  @patch("builtins.open", new_callable=mock_open, read_data=json.dumps({"key1": "value1", "key2": "value2"}))
  @patch("os.path.join", return_value="mock_config_path")
  @patch("os.path.abspath")
  @patch("os.path.dirname")
  def test_get_key_success(self, mock_dirname, mock_abspath, mock_join, mock_open):
    mock_abspath.return_value = self.mock_config_path
    mock_dirname.return_value = self.mock_script_folder
    mock_join.return_value = self.mock_full_config_path

    config = Config()
    self.assertEqual(config.get_key("key1"), "value1")
    self.assertIsNone(config.get_key("key3"))

  @patch("builtins.open", new_callable=mock_open, read_data=json.dumps({"key1": "value1", "key2": "value2"}))
  @patch("os.path.join", return_value="mock_config_path")
  @patch("os.path.abspath")
  @patch("os.path.dirname")
  def test_reload_success(self, mock_dirname, mock_abspath, mock_join, mock_open):
    mock_abspath.return_value = self.mock_config_path
    mock_dirname.return_value = self.mock_script_folder
    mock_join.return_value = self.mock_full_config_path

    config = Config()
    reloaded_data = config.reload()
    self.assertEqual(reloaded_data, self.mock_json_data)

  @patch("builtins.open", new_callable=mock_open, read_data=json.dumps({"key1": "value1", "key2": "value2"}))
  @patch("os.path.join", return_value="mock_config_path")
  @patch("os.path.abspath")
  @patch("os.path.dirname")
  def test_save_success(self, mock_dirname, mock_abspath, mock_join, mock_open):
    mock_abspath.return_value = self.mock_config_path
    mock_dirname.return_value = self.mock_script_folder
    mock_join.return_value = self.mock_full_config_path

    config = Config()
    config_data = config.save_()
    expected_data = {"key1": "value1", "key2": "value2"}
    self.assertEqual(config_data, expected_data)

if __name__ == '__main__':
  unittest.main()
