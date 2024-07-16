import glob

import os

try:
  from lib.log import log
  from lib.change_log import ChangeLog
  from lib.get_flac_info import get_flac_info
  from lib.stamp_playlist import stamp
  from lib.upc import get_upc
except ModuleNotFoundError:
  from log import log
  from change_log import ChangeLog
  from get_flac_info import get_flac_info
  from stamp_playlist import stamp
  from upc import get_upc
  
change_log = ChangeLog()



def sort_directory(directory:str) -> tuple:
  # list flac files
  tracklist = []
  audio_files = [file for file in os.listdir(directory) if not file.startswith('._') and file.endswith('.flac')]
  
  # early return if no files in list
  if len(audio_files) == 0:
    return None
  
  # list for sorting tracks
  info = []
  for file in audio_files:
    
    audio_path = os.path.join(directory, file)
    
    id3 = get_flac_info(audio_path, file)

    info.append((file, int(id3['disc']), int(id3['track']), [id3['length'], id3['artist'], id3['title']]))
    
    tracklist.append(id3['title'])
  
  # sort tracks by disc then track number
  info.sort(key=lambda x: (x[1], x[2]))
  return info, id3['artist'], id3['album'], tracklist




def generate_m3u(directory:str):
  """
  Generate an M3U file for the specified directory and album.

  Parameters:
  - directory (str): The directory path where the M3U file will be generated.
  - album (str): The album name.

  Returns:
  None
  """
  result = sort_directory(directory)
  if result is None:
    return
  info, artist, album, tracklist = result
  
  # m3u8 file path
  m3u_file_path = os.path.join(directory, f'{album}.m3u8')

  # early retun if m3u8 file exists
  if os.path.exists(m3u_file_path) or len(glob.glob(os.path.join(directory, '*.m3u*'))) > 0:
    return
  
  # save m3u8 file to m3u_file_path
  with open(m3u_file_path, 'w', encoding='utf-8') as m3u:
    m3u.write(f'# {stamp()}')
    m3u.write('#EXTM3U\n')
    m3u.write('#EXTENC: UTF-8\n')
    m3u.write(f'#EXTART: {artist}\n')
    m3u.write(f'#EXTALB: {album}\n')
    m3u.write('#EXTIMG: cover.jpg\n')
    m3u.write(f'#PLAYLIST: {artist} - {album}\n')
    upc = False #get_upc(artist, album, tracklist)
    if upc:
      m3u.write(f'# "Barcode: {upc}"\n')
    for file_info in info:
      m3u.write(f'#EXTINF: {int(file_info[3][0])}, {file_info[3][1]} - {file_info[3][2]}\n{file_info[0]}\n')
  
  
  # log change
  log(f"M3U file generated at {m3u_file_path}")
  change_log.playlist_created()
    

if __name__ == "__main__":
  generate_m3u('I:\\Daft Punk\\Homework (25th Anniversary Edition)\\')