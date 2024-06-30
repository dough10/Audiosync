
def seconds_to_hh_mm_ss(seconds):
  hours, remainder = divmod(seconds, 3600)
  minutes, seconds = divmod(remainder, 60)
  return f"{f'{int(hours)} hours, ' if hours > 0 else ''}{int(minutes)} minutes, and {int(seconds)} seconds"

def plural(num):
  """
  Return an empty string or 's' based on whether the input number is 1 or not.

  Parameters:
  - num (int): The input number.

  Returns:
  str: An empty string or 's'.
  """
  return "" if num == 1 else "s"

class ChangeLog:
  def __init__(self):
    self.__changes = {
      "images_resized": 0,
      "lrc_created":0,
      "new_folders": 0,
      "files_writen": 0,
      "playlist_created": 0,
      "files_deleted": 0,
      "folders_deleted": 0,
      "folders_contained": 0,
      "images_renamed": 0,
      "files_renamed": 0
    }

  def image_resized(self):
    self.__changes['images_resized'] += 1

  def lrc_created(self):
    self.__changes['lrc_created'] += 1

  def new_folder(self):
    self.__changes['new_folders'] += 1

  def file_wraiten(self):
    self.__changes['files_writen'] += 1

  def playlist_created(self):
    self.__changes['playlist_created'] += 1

  def files_deleted(self):
    self.__changes['files_deleted'] += 1

  def folder_deleted(self):
    self.__changes['folders_deleted'] += 1

  def folder_contained(self, count): 
    self.__changes['folders_contained'] += count

  def image_renamed(self):
    self.__changes['images_renamed'] += 1

  def file_renamed(self):
    self.__changes['files_renamed'] += 1

  def print(self, timer):
    """
    Print out synchronization statistics.

    Parameters:
    - timer (int): duration in seconds the sync task took to complete

    Returns:
    - (str): printout changes in text string
    """
    if all(value == 0 for value in self.__changes.values()):
      string = f'Sync complete: No changes have been made, completed in {seconds_to_hh_mm_ss(timer)}'
      return string
    else:
      # add number of files deleted from folders to total files deleted
      self.__changes['files_deleted'] += self.__changes['folders_contained']
      img_resized = '' if not self.__changes['images_resized'] else f'{self.__changes['images_resized']} image{plural(self.__changes['images_resized'])} resized, '
      img_renamed = '' if not self.__changes['images_renamed'] else f'{self.__changes['images_renamed']} image{plural(self.__changes['images_renamed'])} renamed, '
      renamed = '' if not self.__changes['files_renamed'] else f'{self.__changes['files_renamed']} audio file{plural(self.__changes['files_renamed'])} renamed, '
      new_folders = '' if not self.__changes['new_folders'] else f'{self.__changes['new_folders']} folder{plural(self.__changes['new_folders'])} created, '
      copied = '' if not self.__changes['files_writen'] else f'{self.__changes['files_writen']} file{plural(self.__changes['files_writen'])} copied, '
      playlists = '' if not self.__changes['playlist_created'] else f'{self.__changes['playlist_created']} playlist{plural(self.__changes['playlist_created'])} created, '
      lrcs = '' if not self.__changes['lrc_created'] else f'{self.__changes['lrc_created']} lyric file{plural(self.__changes['lrc_created'])} created, '
      files_deleted = '' if not self.__changes['files_deleted'] else f'{self.__changes['files_deleted']} file{plural(self.__changes['files_deleted'])} removed'
      folders_deleted = '' if not self.__changes['folders_deleted'] else f', and {self.__changes['folders_deleted']} folder{plural(self.__changes['folders_deleted'])} removed'
      contained = '' if not self.__changes['folders_contained'] else f' containing {self.__changes['folders_contained']} file{plural(self.__changes['folders_contained'])}'
      string = f'Sync complete: {img_resized}{renamed}{img_renamed}{new_folders}{copied}{playlists}{lrcs}{files_deleted}{folders_deleted}{contained}, completed in {seconds_to_hh_mm_ss(timer)}.'
      return string