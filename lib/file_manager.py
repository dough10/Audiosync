import os
import time
import shutil
import string
from itertools import repeat
from lib.lyrics import get_lyrics
from lib.log import log
from concurrent.futures import ThreadPoolExecutor

from lib.resize_image import resize_image

def estimate_file_size(text):
  return len(text.encode('utf-8')) / 1024

def delete_thumbnails(path):
  for root, dirs, files in os.walk(path):
    thumbs = [os.path.join(root,file) for file in files if file.endswith('thumb.webp')]
    for file in thumbs:
      os.remove(file)

class File_manager:
  def __init__(self, changes):
    self.changes = changes

  def formatFilename(self, s):
    """
    Format the given string to be a valid filename.

    Parameters:
    - s (str): The input string to be formatted.

    Returns:
    str: The formatted filename.
    """
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    filename = ''.join(c for c in s.replace('&','and') if c in valid_chars)
    return filename  

  def fix_filename(self, root, file):
    new_name = self.formatFilename(file)
    if new_name == file:
      return file
    try:
      os.rename(os.path.join(root, file), os.path.join(root, new_name))
      self.changes['files_renamed'] += 1
      return new_name
    except FileExistsError:
      return file

  def copy_file(self, source, destination, path, max_retries=5, timeout=10):
    """
    Copy a file from the source path to the destination path with retries.

    Parameters:
    - source (str): The source file path.
    - destination (str): The destination directory path.
    - path (str): The complete destination path for the copied file.
    - max_retries (int): Maximum number of copy retries.
    - timeout (int): Timeout duration between retries.

    Returns:
    None
    """
    if os.path.exists(path):
      return
    retries = 0
    while retries < max_retries:
      try:
        log(f'{source} -> {path}')
        shutil.copy2(source, destination)
        self.changes['files_writen'] += 1
        break  # Copy successful, exit the loop
      except PermissionError:
        retries += 1
        if retries < max_retries:
          time.sleep(timeout)
        else:
          log(f"{path} Maximum retries reached. Copy failed.")
          raise  # Reraise the exception if maximum retries reached
      except shutil.Error as e:
        log(f"Error copying file: {str(e)}")
        retries += 1
        if retries < max_retries:
          log(f"Retrying after {timeout} seconds...")
          time.sleep(timeout)
        else:
          log(f"{path} Maximum retries reached. Copy failed.")
          raise  # Reraise the exception if maximum retries reached

  def rename_images(self, directory_path):

    def process_image(filename):
      # resize
      resize_image(os.path.join(root, filename), 1000, os.path.join(root, filename))

      # rename
      if filename.lower().endswith("folder.jpg") or filename.lower().endswith("front.jpg") or filename.endswith('Cover.jpg'):
        old_path = os.path.join(root, filename)
        new_filename = "cover.jpg"
        new_path = os.path.join(root, new_filename)
        if not os.path.exists(new_path):
          os.rename(old_path, new_path)
          self.changes["images_renamed"] += 1


    with ThreadPoolExecutor(max_workers=2) as executor:
      for root, dirs, files in os.walk(directory_path):
        list(executor.map(process_image, files))

  def save_lrc_file(self, lrc, artist, title):
    """
    Save the lyrics content to the specified LRC file.

    Parameters:
    - lrc (str): The path to the LRC file.
    - artist (str): The artist name.
    - title (str): The song title.

    Returns:
    None
    """
    if os.path.exists(lrc) or os.path.exists(f'{lrc}-raw'): 
      return
    lyrics = get_lyrics(title, artist)
    if lyrics:
      with open(f'{lrc}-raw', 'w', encoding='utf-8') as lyrics_file:
        if estimate_file_size(lyrics) > 2:
          lyrics_file.write('')
        else:
          lyrics_file.write(lyrics)
      # log(f'Lyrics for {artist} {title} saved to {lrc}')
      self.changes['lrc_created'] += 1

  def remove_cue_files(self, path):
    """
    Remove CUE, M3U, and M3U8 files from the specified path.

    Parameters:
    - path (str): The directory path where CUE, M3U, and M3U8 files will be removed.

    Returns:
    None
    """
    for root, dirs, files in os.walk(path):
      for file in files:
        if file.lower().endswith('.cue') or file.lower().endswith('.m3u') or file.lower().endswith('.m3u8'):
          file_path = os.path.join(root, file)
          try:
            os.remove(file_path)
            self.changes['files_deleted']+=1
          except:
            pass

  def remove_lrc(self, path):
    """
    Remove LRC files from the specified path.

    Parameters:
    - path (str): The directory path where LRC files will be removed.

    Returns:
    None
    """
    for root, dirs, files in os.walk(path):
      for file in files:
        file_path = os.path.join(root, file)
        if file.lower().endswith('.lrc-raw') or file.lower().endswith('.lrc'):
          os.remove(file_path)
          self.changes['files_deleted']+=1

  def remove_folder(self, folder):
    shutil.rmtree(folder)
    log(f'{folder} -> Trash')
    self.changes['folders_deleted'] += 1 

  def count_folder_content(self, folder):
    for _, dirs, files in os.walk(folder):
      self.changes['folders_deleted'] += len(dirs)
      self.changes['folders_contained'] += len(files)