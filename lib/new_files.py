import os
import datetime

try:
  from lib.is_audio import is_audio_file
  from lib.old_date import old_date
except ModuleNotFoundError:
  from is_audio import is_audio_file
  from old_date import old_date

def list_of_new_files(path):
  new_files = [{'root': root, 'file': file, 'ext': os.path.splitext(file)[-1].lower()}
               for root, _, files in os.walk(path)
               for file in files
               if is_audio_file(os.path.join(root, file)) and old_date < datetime.datetime.fromtimestamp(os.path.getmtime(os.path.join(root, file))).date()]
  
  return new_files