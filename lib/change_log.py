
def seconds_to_hh_mm_ss(seconds:int) -> str:
  """
  format second into readable MM:SS format
  
  Parameter: 
  seconds (int): time in seconds
  
  Returns: 
  str: seconds formated as MM:SS string
  """
  hours, remainder = divmod(seconds, 3600)
  minutes, seconds = divmod(remainder, 60)
  return f"{f'{int(hours)} hours ' if hours > 0 else ''}{int(minutes)} minutes and {int(seconds)} seconds"




def plural(num:int) -> str:
  """
  Return an empty string or 's' based on whether the input number is 1 or not.

  Parameters:
  - num (int) -> None: The input number.

  Returns:
  str: An empty string or 's'.
  """
  return "" if num == 1 else "s"




def value_printout(change:int, string:str):
  """
  takes input number and string format and returns string with values
  
  Parameters:
  change (int): number of changes
  string (str): string format
  
  Returns:
  str: formated string
  """
  return '' if not change else string.format(change=change, plural=plural(change))



class ChangeLog:
  _changes = {
    "images_resized": 0,
    "lrc_created":0,
    "new_folders": 0,
    "files_wrote": 0,
    "playlist_created": 0,
    "files_deleted": 0,
    "folders_deleted": 0,
    "folders_contained": 0,
    "images_renamed": 0,
    "files_renamed": 0
  }




  @classmethod
  def lrc_created(cls) -> None:
    """
    incriment lrc_created property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['lrc_created'] += 1




  @classmethod
  def new_folder(cls) -> None:
    """
    incriment new_folder property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['new_folders'] += 1




  @classmethod
  def file_wrote(cls) -> None:
    """
    incriment file_wrote property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['files_wrote'] += 1




  @classmethod
  def playlist_created(cls) -> None:
    """
    incriment image_resize property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['playlist_created'] += 1




  @classmethod
  def file_deleted(cls) -> None:
    """
    incriment file_deleted property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['files_deleted'] += 1
  
  
  

  @classmethod
  def file_renamed(cls) -> None:
    """
    incriment file_renamed property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['files_renamed'] += 1




  @classmethod
  def folder_deleted(cls, count:int = 1) -> None:
    """
    incriment folder_Deleted property by 1
    
    Parameters:
    count (int): number of folders deleted
    
    Returns:
    None
    """
    cls._changes['folders_deleted'] += count





  @classmethod
  def folder_contained(cls, count:int) -> None:
    """
    incriment folder_contained property by count
    
    Parameters:
    count (int) -> None: number of items in the folder
    
    Returns:
    None
    """
    cls._changes['folders_contained'] += count




  @classmethod
  def image_resized(cls) -> None:
    """
    incriment image_resize property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['images_resized'] += 1




  @classmethod
  def image_renamed(cls) -> None:
    """
    incriment image_renamed property by 1
    
    Parameters:
    None
    
    Returns:
    None
    """
    cls._changes['images_renamed'] += 1




  @classmethod
  def print(cls, timer:int) -> str:
    """
    Print out synchronization statistics.

    Parameters:
    - timer (int) -> None: duration in seconds the sync task took to complete

    Returns:
    - (str) -> None: printout changes in text string
    """
    if all(value == 0 for value in cls._changes.values()):
      return f'Sync complete: No changes have been made, completed in {seconds_to_hh_mm_ss(timer)}'
    else:
      # add number of files deleted from folders to total files deleted
      cls._changes['files_deleted'] += cls._changes['folders_contained']
      
      img_resized = value_printout(cls._changes['images_resized'], '{change} image{plural} resized, ')
      img_renamed = value_printout(cls._changes['images_renamed'], '{change} image{plural} renamed, ')
      renamed = value_printout(cls._changes['files_renamed'], '{change} audio file{plural} renamed, ')
      new_folders = value_printout(cls._changes['new_folders'], '{change} folder{plural} created, ')
      copied = value_printout(cls._changes['files_wrote'], '{change} file{plural} copied, ')
      playlists = value_printout(cls._changes['playlist_created'], '{change} playlist{plural} created, ')
      lrcs = value_printout(cls._changes['lrc_created'], '{change} lyric file{plural} created, ')
      files_deleted = value_printout(cls._changes['files_deleted'], '{change} file{plural} removed ')
      folders_deleted = value_printout(cls._changes['folders_deleted'], ', and {change} folder{plural} removed ')
      contained = value_printout(cls._changes['folders_contained'], ', containing {change} file{plural} ')

      for key in cls._changes:
        cls._changes[key] = 0

      return (f'Sync complete: {img_resized}{renamed}{img_renamed}{new_folders}{copied}{playlists}{lrcs}'
                    f'{files_deleted}{folders_deleted}{contained}completed in {seconds_to_hh_mm_ss(timer)}.')