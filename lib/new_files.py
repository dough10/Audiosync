import os
import datetime
from lib.is_audio import is_audio_file
from lib.old_date import old_date

def list_of_new_files(path):
  new_files = []

  for root, dirs, files in os.walk(path):
    for file in files:
      file_path = os.path.join(root, file)
      if is_audio_file(file_path) and old_date < datetime.datetime.fromtimestamp(os.path.getmtime(file_path)).date():
        new_files.append(file_path)

  return new_files