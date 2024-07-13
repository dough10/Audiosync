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
