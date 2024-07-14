import os
import time
import shutil
import string
from concurrent.futures import ThreadPoolExecutor

try:
  from lib.lyrics import get_lyrics
  from lib.log import log
  from lib.resize_image import resize_image
  from lib.rename_file import rename_file
  from lib.change_log import ChangeLog
except ModuleNotFoundError:
  from lyrics import get_lyrics
  from log import log
  from resize_image import resize_image
  from rename_file import rename_file
  from change_log import ChangeLog
  
change_log = ChangeLog()



def estimate_file_size(text:str) -> int:
  """
  estimate size of the text to be writter to a file
  
  Parameters:
  text (str): lyrics text
  
  Returns:
  int: kilabytes of file to be saved
  """
  return len(text.encode('utf-8')) / 1024




def delete_files(path, filenames) -> None:
  """
  Delete files in the specified directory and its subdirectories that match any of the given filenames or extensions.

  Parameters:
  - path (str): The directory path to search for files.
  - filenames (list): A list of filenames or file extensions to match.

  Returns:
  None
  """
  for root, _, files in os.walk(path):
    matching_files = [os.path.join(root, file) for file in files if any(file.endswith(filename) for filename in filenames)]
    for file in matching_files:
      try:
        change_log.file_deleted()
        os.remove(file)
      except OSError as e:
        print(f"Error deleting file {file}: {e}")
      except Exception as e:
        print(f"Unexpected error deleting file {file}: {e}")




def process_image(root, filename) -> None:
  """
  rename and resize an image
  
  Parameters:
  root (str): file root path
  filename (str): name of the file
  changes (dict): ChangeLog instance
  """
  # rename image first
  f = rename_file(root, filename)
  # resized image filename will match new filename
  resize_image(os.path.join(root, f), 1000, os.path.join(root, f))




class File_manager:
  

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
    """
    fixes filename removing any unsupported characters
    
    Parameters:
    root (str): the root path of the file
    file (str): the name of the file
    
    Returns:
    str: updated filename 
    
    """
    new_name = self.formatFilename(file)
    if new_name == file:
      return file
    try:
      os.rename(os.path.join(root, file), os.path.join(root, new_name))
      change_log.file_renamed()
      return new_name
    except FileExistsError:
      return file




  def copy_file(self, source, destination, path, max_retries=5, timeout=10) -> None:
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
        change_log.file_wrote()
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




  def rename_images(self, directory_path) -> None:
    """
    rename & resize album art image
    
    Parameters:
    directory_path (str): path to directory of image
    
    Returns:
    None
    """
    with ThreadPoolExecutor(max_workers=2) as executor:
      for root, _, files in os.walk(directory_path):
        executor.map(lambda file: process_image(root, file), files)




  def save_lrc_file(self, lrc, artist, title) -> None:
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
        if estimate_file_size(lyrics) <= 3:
          lyrics_file.write(lyrics)
          log(f'Lyrics for {artist} {title} saved to {lrc}')
          change_log.lrc_created()




  def remove_cue_files(self, path) -> None:
    """
    Remove CUE, M3U, and M3U8 files from the specified path.

    Parameters:
    - path (str): The directory path where CUE, M3U, and M3U8 files will be removed.

    Returns:
    None
    """
    delete_files(path, ['.cue', '.m3u', '.m3u8'])




  def remove_lrc(self, path) -> None:
    """
    Remove LRC files from the specified path.

    Parameters:
    - path (str): The directory path where LRC files will be removed.

    Returns:
    None
    """
    delete_files(path, ['.lrc', '.lrc-raw'])




  def remove_folder(self, folder) -> None:
    """
    removes filder and it's contained files
    
    Parameters:
    folder (str): folder path
    
    Returns:
    None
    """
    shutil.rmtree(folder)
    log(f'{folder} -> Trash')
    change_log.folder_deleted()




  def count_folder_content(self, folder) -> None:
    """
    count the contents of the folder
    
    Parameters:
    folder (str): folder path
    
    Returns:
    None
    """
    for _, dirs, files in os.walk(folder):
      change_log.folder_contained(len(files))
      change_log.folder_deleted(len(dirs))