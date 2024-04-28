import os
file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
log_folder = os.path.join(script_folder, '..', 'output');
log_path = os.path.join(log_folder, 'log.txt')

need_attention = []

if not os.path.exists(log_folder):
  os.makedirs(log_folder)

def reset_log():
  # remove old log file
  if os.path.exists(log_path):
    os.remove(log_path)

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

def print_change_log(stats, timer):
  """
  Print out synchronization statistics.

  Parameters:
  - stats (dict): A dictionary containing synchronization statistics.

  Returns:
  None
  """
  if all(value == 0 for value in stats.values()):
    string = f'Sync complete: No changes have been made, completed in {seconds_to_hh_mm_ss(timer)}'
    return string
  else:
    # add number of files deleted from folders to total files deleted
    stats['files_deleted'] += stats['folders_contained']
    img_renamed = '' if not stats['images_renamed'] else f'{stats['images_renamed']} image{plural(stats['images_renamed'])} renamed, '
    renamed = '' if not stats['files_renamed'] else f'{stats['files_renamed']} audio file{plural(stats['files_renamed'])} renamed, '
    new_folders = '' if not stats['new_folders'] else f'{stats['new_folders']} folder{plural(stats['new_folders'])} created, '
    copied = '' if not stats['files_writen'] else f'{stats['files_writen']} file{plural(stats['files_writen'])} copied, '
    playlists = '' if not stats['playlist_created'] else f'{stats['playlist_created']} playlist{plural(stats['playlist_created'])} created, '
    lrcs = '' if not stats['lrc_created'] else f'{stats['lrc_created']} lyric file{plural(stats['lrc_created'])} created, '
    files_deleted = '' if not stats['files_deleted'] else f'{stats['files_deleted']} file{plural(stats['files_deleted'])} removed'
    folders_deleted = '' if not stats['folders_deleted'] else f', and {stats['folders_deleted']} folder{plural(stats['folders_deleted'])} removed'
    contained = '' if not stats['folders_contained'] else f' containing {stats['folders_contained']} file{plural(stats['folders_contained'])}'
    string = f'Sync complete: {renamed}{img_renamed}{new_folders}{copied}{playlists}{lrcs}{files_deleted}{folders_deleted}{contained}, completed in {seconds_to_hh_mm_ss(timer)}.'
    return string

def files_with_issues():
  """
  Write information about files with issues to a text file.

  Parameters:
  None

  Returns:
  None
  """
  with open(os.path.join(script_folder, '..', 'output', 'need_attention.txt'), 'w', encoding='utf-8') as needwork:
    needwork.write('----------------------\n')
    needwork.write('    Files need work   \n')
    needwork.write('----------------------\n\n')
    for item in need_attention:
      needwork.write(f'{item}\n')

def log(line):
  with open(log_path, 'a', encoding='utf-8') as file:
    file.write(f'{line}\n')
