import glob

import os

try:
  from lib.log import log
  from lib.upc import get_upc
  from lib.change_log import ChangeLog
  from lib.get_mp3_info import get_mp3_info
  from lib.stamp_playlist import stamp
except ModuleNotFoundError:
  from log import log
  from upc import get_upc
  from change_log import ChangeLog
  from get_mp3_info import get_mp3_info
  from stamp_playlist import stamp

change_log = ChangeLog()

types = ['.mp3','.m4a']




def sort_directory(directory:str) -> tuple:
  """
  Gather audio files and sort by disc and track numbers
  
  Parameters:
  - directory (str): folder containing audio files
  
  Returns: 
  info (str), track_list (list), file_extension (str), artist (str), album (str)
  """
  # list usable audio files
  audio_files = [file for file in os.listdir(directory) if not file.startswith('._') and any(file.endswith(t) for t in types)]
  
  # early return if no files
  if len(audio_files) == 0:
    return None
  
  # list to sort for play order
  info = []

  # list to submit for UPC info from discogs
  track_list = []
  for audio_file in audio_files:

    # path and filetype
    audio_path = os.path.join(directory, audio_file)
    file_extension = os.path.splitext(audio_path)[1].replace('.', '')

    # get ID3 info
    id3 = get_mp3_info(audio_path, audio_file)
    if id3 is None:
      return

    disc = id3.get('disc')
    track = id3.get('track')
    
    if disc is None or track is None:
      return
    
    track_list.append(id3.get('title'))
    
    # add to track order list for sorting
    info.append((audio_file, disc, track))

  # sort by disc then track number
  info.sort(key=lambda x: (x[1], x[2]))
  return info, track_list, file_extension, id3['artist'], id3['album']




def generate_cue(directory:str):
  """
  Generate a CUE file for the specified directory, artist, and album.

  Parameters:
  - directory (str): The directory path where the CUE file will be generated.
  - album (str): The album name.

  Returns:
  None
  """
  result = sort_directory(directory)
  if result is None:
    return
  info, track_list, file_extension, artist, album = result
  
  # cue file path
  cue_file_path = os.path.join(directory, f'{album}.cue')

  # early return if cue file path already exists 
  if os.path.exists(cue_file_path) or len(glob.glob(os.path.join(directory, '*.cue'))) != 0:
    return
  
  
  # write the cue file
  with open(cue_file_path, 'w', encoding='utf-8') as cue_file:
    cue_file.write(f'REM COMMENT "{stamp()}"\n')
    cue_file.write(f'PERFORMER "{artist}"\n')
    cue_file.write(f'TITLE "{album}"\n')
    upc = False #get_upc(artist, album, track_list)
    if upc:
      cue_file.write(f'CATALOG "{upc}"\n')
    for file in info:
      path = file[0]
      track_num = info.index(file) + 1
      cue_file.write(f'FILE "{path}" {file_extension.upper() if file_extension == 'mp3' else 'WAVE'}\n')
      cue_file.write(f'  TRACK {str(track_num).zfill(2)} AUDIO\n')
      cue_file.write('    INDEX 01 00:00:00\n')

  log(f"CUE file generated at {cue_file_path}")
  change_log.playlist_created()

if __name__ == "__main__":
  generate_cue('i:\\Basher\\Transmission')