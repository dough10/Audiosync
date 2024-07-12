from PIL import Image
from tqdm import tqdm
from io import BytesIO
import music_tag as MP3
from mutagen.flac import FLAC

import os
import glob

from lib.log import need_attention, log
from lib.file_manager import File_manager
from lib.new_files import list_of_new_files
from lib.resize_image import resize_image
from lib.generate_m3u import generate_m3u
from lib.generate_cue import generate_cue
from lib.change_log import ChangeLog

change_log = ChangeLog()

class Playlist_manager:
  def __init__(self):
    self.file_man = File_manager()

  def generate_cue_file(self, directory, artist, album):
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
    generate_cue(directory, artist, album)
    change_log.playlist_created()

  def generate_m3u_file(self, directory, album):
    """
    Generate an M3U file for the specified directory and album.

    Parameters:
    - directory (str): The directory path where the M3U file will be generated.
    - album (str): The album name.

    Returns:
    None
    """
    generate_m3u(directory, album)
    change_log.playlist_created()


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
    if len(cue_files) > 0:
      for cue in cue_files:
        self.file_man.copy_file(cue, dest, os.path.join(dest, os.path.basename(cue)))  
  
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
    if len(m3u_files) > 0:
      for m3u in m3u_files:
        self.file_man.copy_file(m3u, dest, os.path.join(dest, os.path.basename(m3u)))

  def new_files_playlist(self, dir):
    playlist_folder = os.path.join(dir, 'playlist_data')
    # path of new files playlist
    playlist_path = os.path.join(playlist_folder, 'new_files.m3u8')
    
    # generate list of files "modified" over the last month
    new_files = sorted(list_of_new_files(dir))
    
    # early return if no files in list
    if len(new_files) == 0:
      return

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

  def get_flac_info(self, source_file, file):
    flac = FLAC(source_file)

    # album name for file sorting
    if "album" in flac:
      album = self.file_man.formatFilename(flac["album"][0])
    else:
      need_attention.append(f'file: {source_file}\nissue: album\n')
      return False
    
    # artist name
    if "albumartist" in flac:
      artist = self.file_man.formatFilename(flac["albumartist"][0])
    elif 'artist' in flac:
      artist = self.file_man.formatFilename(flac["artist"][0])
    else:
      need_attention.append(f'file: {source_file}\nissue: artist\n')
      return False

    # artist name for looking up song lyrics
    try:
      lrc_artist = flac["artist"][0]
    except KeyError:
      lrc_artist = flac["albumartist"][0]

    # attempt to get title from flac info
    try:
      title = flac['title'][0]
    
    # get title from filename
    except KeyError:
      title = os.path.splitext(file)[0]


    track = int(flac['tracknumber'][0])
    if 'discnumber' in flac:
      try:
        disc = int(flac['discnumber'][0])
      except ValueError:
        if flac['discnumber'][0] == '1/1':
          disc = 1
        else:
          print(f'error processing {file} disc # {disc} using standby disc 1')
          disc = 1
    else:
      disc = 1

    # long file
    target = 30 * 60
    duration = flac.info.length
    if duration > target:
      pass
      # print(f'{source_file}: long file')

    return {'track': track, 'disc': disc, 'artist': artist.strip(), 'album': album.strip(), 'title': title.strip(), 'lrc_artist': lrc_artist.strip()}

  def get_mp3_info(self, source_file, file, jpg):
    id3 = MP3.load_file(source_file)

    # artist name for file sorting
    if 'albumartist' in id3:
      artist = self.file_man.formatFilename(str(id3['albumartist']))
    elif 'artist' in id3:
      artist = self.file_man.formatFilename(str(id3['artist']))
    else:
      need_attention.append(f'file: {source_file}\nissue: artist\n')
      return False

    # album name
    if 'album' in id3:
      album = self.file_man.formatFilename(str(id3['album']))
    else: 
      need_attention.append(f'file: {source_file}\nissue: album\n')
      return False

    # artist name for looking up song lyrics
    try: 
      lrc_artist = str(id3['artist'])
    except KeyError:
      lrc_artist = str(id3['albumartist'])

    try:
      title = str(id3['title'])
    except KeyError:
      title = str(os.path.splitext(file)[0])

    # ID3 track number  
    track_number = int(id3['tracknumber'])

    #ID3 disc number
    disc_number = int(id3['discnumber'])

    # attempt to extract art from mp3 file if it doesn't exist
    if not os.path.exists(jpg):
      try:
        img = Image.open(BytesIO(id3['APIC:'].data))
        resize_image(img, 1000, jpg)
        log(f'{jpg} extracted from {source_file}')
      except Exception as e:
        pass
    
    # long file
    target = 30 * 60
    duration = id3['#length'].value 
    if duration > target:
      pass
      # print(f'{source_file}: long file')

    return {'track': track_number, 'disc': disc_number, 'artist': artist.strip(), 'album': album.strip(), 'title': title.strip(), 'lrc_artist': lrc_artist.strip()}
  
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
      self.create_playlist_for_album(album)
      if window:
        window.evaluate_js(f'document.querySelector("sync-ui").updateBar("#playlists-bar", {ndx}, {length})')

  def create_playlist_for_album(self, album):
    self.generate_cue_file(album['path'], album['artist'], album['album'])
    self.generate_m3u_file(album['path'], album['album'])
