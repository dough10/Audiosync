import os

from old.lib.change_log import ChangeLog

change_log = ChangeLog()

def fix_filename(self, root:str, file:str) -> str:
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