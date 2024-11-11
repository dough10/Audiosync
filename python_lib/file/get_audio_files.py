import os
import is_audio
import fix_filename

def get_audio_files(dir) -> list:
  """
  generate list of audio files in the working_dir

  Returns:
  list
  """
  audio_files:list = []
  for root, _, files in os.walk(dir):
    for file in files:
      if is_audio(file) and not file.startswith('.'):
        file = fix_filename(root, file)
        audio_files.append({'root': root, 'file': file, 'ext': os.path.splitext(file)[-1].lower()})
  return audio_files