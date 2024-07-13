from tqdm import tqdm

import os
import glob

from lib.log import log
from lib.file_manager import File_manager
from lib.new_files import list_of_new_files
from lib.generate_m3u import generate_m3u
from lib.generate_cue import generate_cue
from lib.change_log import ChangeLog

change_log = ChangeLog()
file_manager = File_manager()

class Playlist_manager:

  def import_cue_files(self, root, dest):
    """
    Import CUE files from the specified root to the destination folder.

    Parameters:
    - root (str): The root directory path.
    - dest (str): The destination directory path.

    Returns:
    None
    """
    cue_files = glob.glob(os.path.join(root, '*.cue'))
    for cue in cue_files:
      file_manager.copy_file(cue, dest, os.path.join(dest, os.path.basename(cue)))  



  
  def import_m3u_files(self, root, dest):
    """
    Import M3U files from the specified root to the destination folder.

    Parameters:
    - root (str): The root directory path.
    - dest (str): The destination directory path.

    Returns:
    None
    """
    m3u_files = glob.glob(os.path.join(root, '*.m3u*'))
    for m3u in m3u_files:
      file_manager.copy_file(m3u, dest, os.path.join(dest, os.path.basename(m3u)))




  def new_files_playlist(self, dir):
    playlist_folder = os.path.join(dir, 'playlist_data')
    # path of new files playlist
    playlist_path = os.path.join(playlist_folder, 'new_files.m3u8')
    
    # generate list of files "modified" over the last month
    new_files = sorted(list_of_new_files(dir))

    # save new files playlist for playlist_path
    with open(playlist_path, 'w') as playlist:
      for file in tqdm(new_files, desc='Creating new files playlist', unit='file'):
        # create relative paths
        try:
          playlist.write(f'{os.path.join('..', file.replace(dir, ''))}\n')
        except:
          print(file)

    log(f'M3U file generated at {playlist_path}')
    change_log.playlist_created()





  def create_cue_files(self, folder, window):
    """
    Create CUE and M3U files for each artist and album in the specified folder.

    Parameters:
    - folder (str): The root folder path.

    Returns:
    None
    """
    all_albums = []
    artists = [artist for artist in os.listdir(folder) if os.path.isdir(os.path.join(folder, artist))]
    for artist in artists:
      artist_path = os.path.join(folder, artist)
      albums = [album for album in os.listdir(artist_path) if os.path.isdir(os.path.join(artist_path, album))]
      for album in albums:
        all_albums.append({"path":os.path.join(folder, artist, album), "artist": artist, "album": album})
    
    length = len(all_albums)
    for ndx, album in enumerate(tqdm(all_albums, desc='Creating playlist files', unit='album')):
      generate_cue(album['path'], album['artist'], album['album'])
      generate_m3u(album['path'], album['album'])
      if window:
        window.evaluate_js(f'document.querySelector("sync-ui").updateBar("#playlists-bar", {ndx}, {length})')
