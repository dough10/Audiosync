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
