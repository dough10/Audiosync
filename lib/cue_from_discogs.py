import os
from datetime import datetime

import discogs_client

try:
  from lib.log import log
  from lib.config_controler import Config
  from lib.change_log import ChangeLog
  from lib.stamp_playlist import stamp
except ModuleNotFoundError:
  from log import log
  from config_controler import Config
  from change_log import ChangeLog
  from stamp_playlist import stamp
  

change_log = ChangeLog()
config_controler = Config()

# do not change
total_time = '00:00'

def seconds_to_mmss(seconds):
  minutes, seconds = divmod(seconds, 60)
  return f"{int(minutes):02}:{int(seconds):02}"


def string_to_boolean(s:str) -> bool:
  true_strings = ['true', 'yes', '1']
  false_strings = ['false', 'no', '0']
  
  if s.lower() in true_strings:
    return True
  elif s.lower() in false_strings:
    return False
  else:
    raise ValueError("Invalid boolean string")


def save_cue(release:dict, mp3_path:str, gapless:bool) -> None:

  basename = os.path.basename(mp3_path)

  name = os.path.splitext(mp3_path)[0]

  cue_file_path = os.path.join(os.path.dirname(mp3_path), f'{name}.cue')

  file_extension = os.path.splitext(mp3_path)[1].replace('.', '')

  artist_names = [artist.name for artist in release.artists]
  
  tracklist = [track for track in release.tracklist if track.duration]
  
  with open(cue_file_path, 'w', encoding='utf-8') as cue_file:
    cue_file.write(f'REM COMMENT {stamp()}')
    cue_file.write(f'PERFORMER "{artist_names[0]}"\n')
    cue_file.write(f'TITLE "{release.title}"\n')
    # cue_file.write(f'CATALOG "{release.barcode or release.id}"\n')
    cue_file.write(f'FILE "{basename}" {file_extension.upper() if file_extension == 'mp3' else 'WAVE'}\n')
    
    if not len(tracklist):
      cue_file.write('  TRACK 01 AUDIO\n')
      cue_file.write(f'    TITLE "{release.title}"\n')
      cue_file.write(f'    PERFORMER "{artist_names[0]}"\n')
      cue_file.write('    INDEX 01 00:00:00\n')
      
    for track in tracklist:
      
      performer_names = [artist.name for artist in track.artists]
      if len(performer_names) == 0:
        performer_names = [artist_names[0]]

      cue_file.write(f'  TRACK {str(tracklist.index(track) + 1).zfill(2)} AUDIO\n')
      cue_file.write(f'    TITLE "{track.title}"\n')
      cue_file.write(f'    PERFORMER "{performer_names[0]}"\n')
      cue_file.write(f'    INDEX 01 {total_time}:00\n')
            
      add_durations([total_time, f'0{track.duration}']) 

      if not string_to_boolean(gapless):
        add_durations([total_time, '00:02'])
    

def add_durations(durations:list) -> str:
  global total_time
  if durations[1] == '0':
    return total_time
  total_minutes = 0
  total_seconds = 0

  for duration in durations:
    parts = duration.split(':')
    if len(parts) == 2:
      minutes, seconds = map(int, parts)
      total_minutes += minutes
      total_seconds += seconds
    else:
      raise ValueError("Invalid duration format. Use 'MM:SS' format.")

  total_minutes += total_seconds // 60
  total_seconds = total_seconds % 60

  total_time = f"{total_minutes:02d}:{total_seconds:02d}"
  return total_time


def get_discogs_data(release_id:str, mp3_path:str, gapless:bool) -> None:
  d = discogs_client.Client('Audiosync/0.1', user_token=config_controler.get_key('discogs_token'))
  release = d.release(release_id)
  save_cue(release, mp3_path, gapless)


def cue_from_releaseid(releaseID:str, file_path:str) -> None:
  """
  """
  global total_time
  
  name = os.path.splitext(file_path)[0]
  cue_file_path = os.path.join(os.path.dirname(file_path), f'{name}.cue')
  if os.path.exists(cue_file_path):
    return

  try:
    rid = open(releaseID, 'r').read().split('\n')
    get_discogs_data(rid[0], file_path, rid[1])
    total_time = '00:00'
    change_log.playlist_created()
  except IndexError:
    log(f'Error reading releaseid {releaseID}')




if __name__ == "__main__":
  
  path = 'Z:\\Music\\Unsorted\\House\\Bad Boy Bill\\Bangin\' the Box, Volume 1\\'
  file = '01 Bangin the Box Volume 1'
  
  cue_from_releaseid(
    f'{path}releaseid.txt', 
    f'{path}{file}.mp3'
  )