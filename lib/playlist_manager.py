import os
import glob
from PIL import Image
from tqdm import tqdm
from io import BytesIO
import music_tag as MP3
from lib.upc import get_upc
from mutagen.flac import FLAC
from lib.log import need_attention, log
from lib.file_manager import File_manager
from lib.new_files import list_of_new_files

def scale_image(img, file):
  """
  Scale the provided image and save it to the specified file.

  Parameters:
  - img (PIL.Image.Image): The PIL Image object to be scaled.
  - file (str): The file path where the scaled image will be saved.

  Returns:
  None
  """
  width, height = img.size 
  if width > 1000 or height > 1000:
    img.thumbnail((1000, 1000), Image.LANCZOS)
  img.convert('RGB')
  try:
    img.save(file, 'JPEG')
  except OSError:
    img.save(file, 'PNG')

class Playlist_manager:
  def __init__(self, changes):
    self.changes = changes
    self.file_man = File_manager(changes)

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
      track_number = int(track['tracknumber'])

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
    self.changes['playlist_created'] += 1

  def generate_m3u_file(self, directory, album):
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
      self.changes['playlist_created'] += 1
    except Exception as e:
      need_attention.append(f'error creating {m3u_file_path}\n{e}\n\n')

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
    new_files = list_of_new_files(dir)
    
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
    self.changes["playlist_created"] += 1

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
        scale_image(img, jpg)
        log(f'{jpg} extracted from {source_file}')
      except Exception as e:
        pass
    
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
