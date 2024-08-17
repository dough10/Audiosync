import os
import json
import glob

try:
  from lib.change_log import ChangeLog
  from lib.stamp_playlist import stamp
  from lib.log import log
except ModuleNotFoundError:
  from change_log import ChangeLog
  from stamp_playlist import stamp
  from log import log


change_log = ChangeLog()

def get_playlist_files(folder:str):
  return [file for file in glob.glob(os.path.join(folder, 'playlists', '*.json'))]


def read_playlist_template(path:str) -> dict:
  with open(path) as j:
    return json.load(j)
  
  
def flaten_track(track_info:dict) -> str:
  return os.path.join('..', track_info['artist'], track_info['album'], track_info['file'])
  
  
def build_string(title:str, tracks:list) -> str:
  str = f'# "{stamp()}"\n#EXTM3U\n#EXTENC: UTF-8\n#PLAYLIST: {title}\n'
  return f'{str}{'\n'.join(map(flaten_track, tracks))}'


def generate_custom_playlists(playlists:list, path:str):
  for playlist in playlists:
    data = read_playlist_template(playlist)
    playlist_path = os.path.join(path, 'playlist_data', f'{data['title']}.m3u8')
    with open(playlist_path, 'w') as m3u:
      m3u.write(build_string(data['title'], data['tracks']))
    log(f'Playlist: {playlist_path}')
    change_log.playlist_created()
  
  
if __name__ == "__main__":
  file_path = os.path.abspath(__file__)
  script_folder = os.path.dirname(file_path)
  playlists = get_playlist_files(script_folder)
  generate_custom_playlists(playlists, script_folder)