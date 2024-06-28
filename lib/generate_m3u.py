from mutagen.flac import FLAC
import glob

import os
import sys

from lib.log import need_attention, log

def generate_m3u(directory:str, album:str):
  """
  Generate an M3U file for the specified directory and album.

  Parameters:
  - directory (str): The directory path where the M3U file will be generated.
  - album (str): The album name.

  Returns:
  None
  """
  # m3u8 file path
  m3u_file_path = os.path.join(directory, f'{album}.m3u8')

  # early retun if m3u8 file exists
  if os.path.exists(m3u_file_path) or len(glob.glob(os.path.join(directory, '*.m3u*'))) > 0:
    return
  
  # list flac files
  audio_files = [file for file in os.listdir(directory) if not file.startswith('._') and file.endswith('.flac')]
  
  # early return if no files in list
  if len(audio_files) == 0:
    return
  
  try:
    # list for sorting tracks
    info = []
    for file in audio_files:
      # get FLAC file info
      audio = FLAC(os.path.join(directory, file))
      track = audio['tracknumber'][0]
      if 'discnumber' in audio:
        disc = audio['discnumber'][0]
      else:
        disc = 1
      if 'artist' in audio:
        artist = audio['artist'][0]
      else:
        artist = audio['albumartist'][0]
      info.append((file, int(disc), int(track), [audio.info.length, artist, audio['title'][0]]))
    
    # sort tracks by disc then track number
    info.sort(key=lambda x: (x[1], x[2]))

    # save m3u8 file to m3u_file_path
    with open(m3u_file_path, 'w', encoding='utf-8') as m3u:
      m3u.write('#EXTM3U\n')
      m3u.write(f'#EXTART: {audio['albumartist'][0]}\n')
      m3u.write(f'#EXTALB: {album}\n')
      m3u.write('#EXTIMG: cover.jpg\n')
      m3u.write(f'#PLAYLIST: {audio['albumartist'][0]} - {album}\n')
      for file_info in info:
        m3u.write(f'#EXTINF: {int(file_info[3][0])}, {file_info[3][1]} - {file_info[3][2]}\n{file_info[0]}\n')
    
    # log change
    log(f"M3U file generated at {m3u_file_path}")
    
  except Exception as e:
    need_attention.append(f'error creating {m3u_file_path}\n{e}\n\n')

if __name__ == "__main__":
  generate_m3u(sys.argv[1], sys.argv[2])