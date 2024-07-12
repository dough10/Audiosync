import os

def rename_file(root:str, filename:str, changes:dict) -> str:
  if filename.lower().endswith("folder.jpg") or filename.lower().endswith("front.jpg") or filename.endswith('Cover.jpg'):
    old_path = os.path.join(root, filename)
    new_filename = "cover.jpg"
    new_path = os.path.join(root, new_filename)
    if not os.path.exists(new_path):
      os.rename(old_path, new_path)
      changes.image_renamed()
      return new_path
    else:
      return old_path