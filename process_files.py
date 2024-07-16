import os
import sys
import time
import json
import queue
import threading
from tqdm import tqdm
from lib.is_audio import is_audio_file
from lib.file_manager import File_manager
from lib.select_folder import select_folder
from lib.get_folder_size import get_folder_size
from lib.playlist_manager import Playlist_manager
from lib.cue_from_discogs import  cue_from_releaseid
from Podcast import updatePlayer as updatePodcast
from lib.log import log, files_with_issues, need_attention, reset_log
from lib.radio_txt import main as create_radio_txt
from lib.resize_image import resize_image
from lib.config_controler import Config
from lib.change_log import ChangeLog
from lib.get_mp3_info import get_mp3_info
from lib.get_flac_info import get_flac_info


change_log = ChangeLog()
file_manager = File_manager()
pl_manager = Playlist_manager()
config_controler = Config()


file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)

sorted_dir = ''
working_dir = config_controler.get_key('source')
ignore_folders = config_controler.get_key('lrc_ignore_folders') # folders whos files we will be ignored when attempting tog et lyrics
remove_lrc_wd = False # default value.  user will be propted if needed
use_sync_file = False # default value.  user will be propted if needed
import_cues = False
import_lyrics = False
import_custom_radio = False
sync_file_data = {}
lib_data = {}


sync_file = os.path.join(sorted_dir, 'sync.json')




def is_ignored(source_file:str):
  return any(os.path.join(working_dir, folder) in source_file for folder in ignore_folders)




def add_to_lib(artist:str, album:str, location:str, file:str, title:str, track:int, disc:int):
  """
  add audio file to data dict.

  Parameters:
  - artist (str): album artist
  - album (str): album title
  - location  (str): file path
  - file (str): audio filename
  - title (str): track title
  - track (int): track number
  - disc (int): disc number
  
  Returns:
  None
  """
  if artist not in lib_data:
    lib_data[artist] = []

  # Find the album in the artist's list of albums
  album_exists = False
  for alb in lib_data[artist]:
    if alb['title'] == album:
      alb['tracks'].append({
        'file': file,
        'path': location,
        'album': album,
        'artist': artist, 
        'title': title, 
        'track': track, 
        'disc': disc
      })
      album_exists = True
      break

  # If the album does not exist, create a new entry
  if not album_exists:
      lib_data[artist].append({
        'title': album, 
        'artist':artist,
        'tracks': [
          {
            'file': file,
            'path': location,
            'album': album,
            'artist': artist, 
            'title': title, 
            'track': track, 
            'disc': disc
          }
        ]
      })




def move_file(root:str, file:str, ext:str) -> None:
  """
  Process audio file in the specified root directory.

  Parameters:
  - root (str): The root directory path.
  - file (str): The name of the audio file.
  - ext  (str): the file extension
  
  Returns:
  None
  """
  global lib_data
  source_file:str = os.path.join(root, file)
  jpg:str = os.path.join(root, 'cover.jpg')
  alt_jpg:str = os.path.join(root, '..', 'cover.jpg')
  lrc_filename:str = f'{os.path.splitext(file)[0]}.lrc'
  lrc:str = os.path.join(root, lrc_filename)
  releaseID:str = os.path.join(root, 'releaseid.txt')

  # create cue from discogs data 
  # will be saved to source location and not destination 
  # will copy it to destination later in this function
  if os.path.exists(releaseID) and import_cues:
    cue_from_releaseid(releaseID, source_file)

  # get info needed to sort the file
  if ext == '.flac':
    info = get_flac_info(source_file, file)
  else:
    info = get_mp3_info(source_file, file)

  # return if no info was found
  if not info:
    return

  # early return if no cover.jpg is found
  # placed here so that get_mp3_info() has a chance to attempt extract
  if not os.path.exists(jpg) and not os.path.exists(alt_jpg):
    need_attention.append(f'file: {source_file}\nissue: art\n')
    return

  artist_folder = info['artist']
  album_folder = file_manager.formatFilename(info['album'])
  lrc_artist = info['lrc_artist']
  song_title = info['title']

  # build data dictonary of artists and albums
  add_to_lib(artist_folder, album_folder, root.replace(config_controler.get_key('source'), ''), file, song_title, info['track'], info['disc'])

  # early return if artist or album isn't listed in sync file
  if use_sync_file:

    # artist is not in sync file
    if artist_folder not in sync_file_data:

      # artist folder path
      artf = os.path.join(sorted_dir, artist_folder)

      # if folder is there but not in sync file
      if os.path.exists(artf):
        file_manager.count_folder_content(artf)
        file_manager.remove_folder(artf)
      return
    
    # album is not in sync file
    if album_folder not in sync_file_data[artist_folder]:

      # album folder path
      albf = os.path.join(sorted_dir, artist_folder, album_folder)

      # if folder is there but not in sync file
      if os.path.exists(albf):
        file_manager.count_folder_content(albf)
        file_manager.remove_folder(albf)
      return

  if import_lyrics and not is_ignored(source_file):
    file_manager.save_lrc_file(lrc, lrc_artist, song_title)

  # setup destination location string and create folders
  dest = os.path.join(sorted_dir, artist_folder, album_folder)
  if not os.path.exists(dest):
    try:
      os.makedirs(dest)
      change_log.new_folder()
    except FileExistsError:
      pass

  img_path = os.path.join(dest, 'cover.jpg')
  if os.path.exists(jpg):
    file_manager.copy_file(jpg, dest, img_path)
  elif os.path.exists(alt_jpg): 
    file_manager.copy_file(alt_jpg, dest, img_path)         

  if os.path.exists(lrc) and import_lyrics:
    file_manager.copy_file(lrc, dest, os.path.join(dest, lrc_filename))

  if import_cues:
    pl_manager.import_m3u_files(root, dest)
    pl_manager.import_cue_files(root, dest)

  try:
    file_manager.copy_file(source_file, dest, os.path.join(dest, file))
  except Exception as e:
    log('copy failed..')
    need_attention.append(f"file:{source_file}\ndest:{dest}\nerror:{str(e)}\n\n")
    return




def get_audio_files() -> list:
  """
  generate list of audio files in the working_dir

  Returns:
  list
  """
  audio_files:list = []
  for root, _, files in os.walk(working_dir):
    for file in files:
      if is_audio_file(file) and not file.startswith('._'):
        file = file_manager.fix_filename(root, file)
        audio_files.append({'root': root, 'file': file, 'ext': os.path.splitext(file)[-1].lower()})
  return audio_files




def process_audio_files(window:dict) -> None:
  """
  Process all audio files in the working directory.

  Parameters:
  - window (object): pywebview window object.

  Returns:
  None
  """
  audio_files = get_audio_files()
  length = len(audio_files)
  for ndx, file in enumerate(tqdm(audio_files, desc ='Copying files', unit='file')):
    move_file(file['root'], file['file'], file['ext'])
    if window:
      window.evaluate_js(f'document.querySelector("sync-ui").updateBar("#files-bar", {ndx}, {length});')




def notify(s:str, window:dict) -> None:
  try:
    if window:
      window.evaluate_js(f'document.querySelector("sync-ui").syncUpdate({json.dumps(s)});')
      return
    print(s['text'])
  except Exception as e:
    print(e)




def get_lib_size(queue) -> None:
  """
  Returns library size.

  Parameters:
  - queue: threading queue

  Returns:
  None 
  """
  queue.put(get_folder_size(config_controler.get_key('source')))




def set_source() -> str:
  global sorted_dir
  global sync_file
  sorted_dir = select_folder()
  if not sorted_dir:
    return None
  sync_file = os.path.join(sorted_dir, 'sync.json')
  return sync_file




def run_sync(window:dict) -> None:
  """
  Main function to organize and process audio files.

  Parameters:
  - window (object): pywebview window object.

  Returns:
  None
  """
  global sorted_dir
  global use_sync_file
  global import_cues
  global import_lyrics
  global import_custom_radio
  global sync_file_data
  global sync_file
  global lib_data
  global change_log

  # sorted_dir = select_folder()
  lib_data = {}

  sync_file = os.path.join(sorted_dir, 'sync.json')
  playlist_folder = os.path.join(sorted_dir, 'playlist_data')

  if os.path.exists(sync_file):
    use_sync_file = True
    try:
      sync_file_data = json.load(open(sync_file))
    except Exception as e:
      print(f'Error importing {sync_file}: {e}')
      sys.exit()

  config = config_controler.get()

  import_cues = config['import_cues']
  import_lyrics = config['import_lyrics']
  remove_lrc_wd = config['remove_lrc_wd']
  import_custom_radio = config['import_custom_radio']
  podcast = config['podcast']

  reset_log()

  # calculate filesize of music lib on a second thread
  fs_queue = queue.Queue()
  thread = threading.Thread(target=get_lib_size, args=(fs_queue,))
  thread.start()

  # begin transfer timer
  notify({
    "text": 'Beginning Sync.. This can take a while.',
    "summary" : False,
    "toast" : True
  }, window)
  start_time = time.time()

  # create destination
  notify({
    "text": 'Creating folders.',
    "summary" : False,
    "toast" : False
  }, window)
  if not os.path.exists(sorted_dir):
    os.makedirs(sorted_dir)
    change_log.new_folder()

  #rename images to cover.jpg
  notify({
    "text": 'Checking image names and sizes.',
    "summary" : False,
    "toast" : False
  }, window)
  file_manager.rename_images(working_dir)

  # remove all cue file in destination location 
  if import_cues:
    notify({
      "text": f'Removing .cue files from {sorted_dir}',
      "summary" : False,
      "toast" : False
    }, window)
    file_manager.remove_cue_files(sorted_dir)

  # attempt to find lyrics for each song
  if import_lyrics:
    notify({
      "text": f'Removing .lrc files from {sorted_dir}',
      "summary" : False,
      "toast" : False
    }, window)
    file_manager.remove_lrc(sorted_dir)
    if remove_lrc_wd:
      notify({
        "text": f'Removing .lrc files from {working_dir}',
        "summary" : False,
        "toast" : False
      }, window)
      file_manager.remove_lrc(working_dir)

  # copy files
  notify({
    "text": 'Starting audio file transfers.',
    "summary" : False,
    "toast" : False
  }, window)
  process_audio_files(window)

  # sort tracks by disc then track number
  for artist in lib_data:
    # sory artists albums alphabeticly
    lib_data[artist].sort(key=lambda x: x["title"])
    # sort tracks by disc number then track number
    for album in lib_data[artist]:
      album['tracks'].sort(key=lambda x: (x['disc'], x['track']))


  sorted_data = dict(sorted(lib_data.items()))
  sorted_data['lib_size'] = fs_queue.get()

  # library file path
  lib_path = os.path.join(script_folder, 'lib_data.json')

  # write data file of all artists and albums
  with open(lib_path, 'w') as data_file:
    data_file.write(json.dumps(sorted_data))

  # copy / delete podcasts and add those changes to the total changes
  if podcast:
    updatePodcast(sorted_dir, window, bypass=True, logger=log)
  
  # create .cue / .m3u8 file for each album that doesn't already have one
  if import_cues:
    pl_manager.create_cue_files(sorted_dir, window)
  
    # create folder for new_files playlist  
    if not os.path.exists(playlist_folder):
      os.makedirs(playlist_folder)
      change_log.new_folder()

    # create playlist containing all new files
    pl_manager.new_files_playlist(sorted_dir)

  if import_custom_radio:
    # parse online radio.txt file and reject offline streams
    create_radio_txt(sorted_dir, config_controler.get_key('radio_genres'))

  # output file containing trouble files
  notify({
    "text": 'Generating trouble file.',
    "summary" : False,
    "toast" : False
  }, window)
  files_with_issues()

  # sync summary
  changes = change_log.print(time.time() - start_time)
  notify({
    "text": changes,
    "summary" : True,
    "toast" : False
  }, window)
  log(changes)




def build_lib(root:str, file:str, ext:str):
  """
  create db entry for audio file.

  Parameters:
  - root (string): root path to the file
  - file (string): file name
  - ext (string): file extention

  Returns: 
  None
  """
  global lib_data
  # current audio file
  source_file = os.path.join(root, file)
  # cover file
  jpg = os.path.join(root, 'cover.jpg')
  # cover but 1 folder up (multi disc album)
  alt_jpg = os.path.join(root, '..', 'cover.jpg')

  if ext == '.flac':
    info = get_flac_info(source_file, file)
  else:
    info = get_mp3_info(source_file, file)
  if not info:
    return
  # copy alt_jpg to normal position
  if not os.path.exists(jpg) and os.path.exists(alt_jpg):
    file_manager.copy_file(alt_jpg, root, jpg)
  # reject if cover doesn't exist
  if not os.path.exists(jpg):
    return
  # create 150px thumb.webp
  thumbnail_name = jpg.replace('cover.jpg', 'thumb.webp')
  if not os.path.exists(thumbnail_name):
    resize_image(jpg, 150, thumbnail_name, ext='WEBP')
  # add to lib_data
  add_to_lib(info['artist'], info['album'], root.replace(config_controler.get_key('source'), ''), file, info['title'], info['track'], info['disc'])




def create_lib_json(window:dict):
  """
  creates the lib_data.json library file

  Parameters:
  - window (object): pywebview window object.

  Returns:
  None
  """
  global lib_data
  global working_dir

  working_dir = config_controler.get_key('source')
  
  file_manager.rename_images(working_dir)
  # clear data object
  lib_data = {}
  # get library size
  fs_queue = queue.Queue()
  thread = threading.Thread(target=get_lib_size, args=(fs_queue,))
  thread.start()
  # list audio files
  audio_files = get_audio_files()
  length = len(audio_files)
  # build data object
  for ndx, file in enumerate(audio_files):
    build_lib(file['root'], file['file'], file['ext'])
    if window:
      window.evaluate_js(f'document.querySelector("music-library").updateBar({ndx}, {length});')   
  
  # sort tracks by disc then track number
  for artist in lib_data:
    lib_data[artist].sort(key=lambda x: x["title"])
    for album in lib_data[artist]:
      album['tracks'].sort(key=lambda x: (x['disc'], x['track']))
  
  sorted_data = dict(sorted(lib_data.items()))
  sorted_data['lib_size'] = fs_queue.get()

  lib_path = os.path.join(script_folder, 'lib_data.json')

  with open(lib_path, 'w') as data_file:
    data_file.write(json.dumps(sorted_data))




if __name__ == "__main__":
  run_sync(False)
