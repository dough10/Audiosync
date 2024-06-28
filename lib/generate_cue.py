import glob
import music_tag as MP3

import os
import sys

from lib.log import need_attention, log
from lib.upc import get_upc

def generate_cue(directory:str, artist:str, album:str):
  """
  Generate a CUE file for the specified directory, artist, and album.

  Parameters:
  - directory (str): The directory path where the CUE file will be generated.
  - artist (str): The artist name.
  - album (str): The album name.

  Returns:
  None
  """
  # cue file path
  cue_file_path = os.path.join(directory, f'{album}.cue')

  # early return if cue file path already exists 
  if os.path.exists(cue_file_path) or len(glob.glob(os.path.join(directory, '*.cue'))) != 0:
    return
  
  # list usable audio files
  audio_files = [file for file in os.listdir(directory) if not file.startswith('._') and file.endswith('.mp3') or file.endswith('.m4a')]
  
  # early return if no files
  if len(audio_files) == 0:
    return
  
  # list to sort for play order
  info = []

  # list to submit for UPC info from discogs
  track_list = []
  for audio_file in audio_files:

    # path and filetype
    audio_path = os.path.join(directory, audio_file)
    file_extension = os.path.splitext(audio_path)[1].replace('.', '')

    # get ID3 info
    try:
      track = MP3.load_file(audio_path)
    except Exception as E:
      need_attention.append(f'file: {audio_path}\nissue: {E}\n')
      return
    
    # add to list for getting UPC from discogs
    if 'title' in track:
      track_list.append(str(track['title']))

    # ID3 track number  
    try:
      track_number = int(track['tracknumber'])
    except ValueError:
      track_number = len(audio_files) - audio_files.index(audio_file)

    #ID3 disc number
    disc_number = int(track['discnumber']) or 1

    # add to track order list for sorting
    info.append((audio_file, disc_number, track_number))

  # sort by disc then track number
  info.sort(key=lambda x: (x[1], x[2]))
  
  # write the cue file
  with open(cue_file_path, 'w', encoding='utf-8') as cue_file:
    upc = get_upc(artist, album, track_list)
    if upc:
      cue_file.write(f'CATALOG "{upc}"\n')
    cue_file.write(f'PERFORMER "{artist}"\n')
    cue_file.write(f'TITLE "{album}"\n')
    for file in info:
      track = MP3.load_file(os.path.join(directory, file[0]))
      try:
        cue_file.write(f'FILE "{file[0]}" {file_extension.upper()}\n')
        cue_file.write(f'  TRACK {str(track['tracknumber']).zfill(2)} AUDIO\n')
        cue_file.write('    INDEX 01 00:00:00\n')
      except:
        pass
  log(f"CUE file generated at {cue_file_path}")

if __name__ == "__main__":
  generate_cue(sys.argv[1], sys.argv[2])