from tqdm import tqdm

import os
import glob

try:
  from lib.log import log
  from lib.file_manager import File_manager
  from lib.new_files import list_of_new_files
  from lib.generate_m3u import generate_m3u
  from lib.generate_cue import generate_cue
  from lib.change_log import ChangeLog
  from lib.get_flac_info import get_flac_info
  from lib.get_mp3_info import get_mp3_info
  from lib.stamp_playlist import stamp
except ModuleNotFoundError:
  from log import log
  from file_manager import File_manager
  from new_files import list_of_new_files
  from generate_m3u import generate_m3u
  from generate_cue import generate_cue
  from change_log import ChangeLog
  from get_flac_info import get_flac_info
  from get_mp3_info import get_mp3_info
  from stamp_playlist import stamp
  
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




  def new_files_playlist(self, dir:str) -> None:
    """
    create a playlist of all files with a modified date newer then 1 month
    
    Parameters:
    - dir (str): file path containing audio files
    
    Returns:
    None
    """
    playlist_folder:str = os.path.join(dir, 'playlist_data')
    # path of new files playlist
    playlist_path:str = os.path.join(playlist_folder, 'new_files.m3u8')
    
    # generate list of files "modified" over the last month
    new_files:list = list_of_new_files(dir)
    
    to_sort:list = []
    for new_file in tqdm(new_files, desc='Sorting new files', unit='file'):
      
      file_path:str = os.path.join(new_file['root'], new_file['file'])
      
      if new_file['ext'] == 'flac':
        info:dict = get_flac_info(file_path, new_file['file'])
      else:
        info:dict = get_mp3_info(file_path, new_file['file'])

      if not info == None:
        info['path'] = file_path
        to_sort.append(info)

    album_list = sorted(to_sort, key=lambda x: (x['artist'], x['album'], x['disc'], x['track']))

    # save new files playlist for playlist_path
    with open(playlist_path, 'w', encoding='utf-8') as playlist:
      playlist.write('#EXTM3U\n')
      playlist.write('#EXTENC: UTF-8\n')
      playlist.write('#EXTART: Various Artists\n')
      playlist.write('#PLAYLIST: new_files\n')
      for file in tqdm(album_list, desc='Creating new files playlist', unit='file'):
        relative_path = os.path.join('..', file['path'].replace(dir, ''))
        playlist.write(f'#EXTINF: {int(file['length'])}, {str(file['artist'])} - {str(file['title'])}\n{relative_path}\n')
      playlist.write(f'\n# {stamp()}')

    log(f'M3U file generated at {playlist_path}')
    change_log.playlist_created()




  def create_cue_files(self, folder, window):
    """
    Create CUE and M3U files for each artist and album in the specified folder.

    Parameters:
    - folder (str): The root folder path.
    - window (dict): frontend window object

    Returns:
    None
    """
    all_albums = []
    with os.scandir(folder) as artists:
      for artist in artists:
        if artist.is_dir():
          with os.scandir(artist.path) as albums:
            for album in albums:
              if album.is_dir():
                all_albums.append(album.path)
    
    length = len(all_albums)
    for ndx, album in enumerate(tqdm(all_albums, desc='Creating playlist files', unit='album')):
      generate_cue(album)
      generate_m3u(album)
      if window:
        window.evaluate_js(f'document.querySelector("sync-ui").updateBar("#playlists-bar", {ndx}, {length})')



if __name__ == "__main__":
  manager = Playlist_manager()
  manager.new_files_playlist('i:\\')