import os

try:
  from lib.change_log import ChangeLog
  from lib.log import log
except ModuleNotFoundError:
  from change_log import ChangeLog
  from log import log
  
change_log = ChangeLog()

def rename_file(root:str, filename:str) -> str:
  if filename.lower().endswith("folder.jpg") or filename.lower().endswith("front.jpg") or filename.endswith('Cover.jpg'):
    old_path = os.path.join(root, filename)
    new_filename = "cover.jpg"
    new_path = os.path.join(root, new_filename)
    if not os.path.exists(new_path):
      os.rename(old_path, new_path)
      log(f'Rename: {filename} -> {new_filename}')
      change_log.image_renamed()
      return os.path.join(root, new_filename)
    else:
      return os.path.join(root, filename)
  else:
    return os.path.join(root, filename)