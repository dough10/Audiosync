import os

def readable_size(size_bytes):
  """
  Convert the given size in bytes into a human-readable format.
  """
  # Define the suffixes for various size units
  suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  # Find the appropriate suffix and scale the size accordingly
  for suffix in suffixes:
    if size_bytes < 1024:
      return f"{size_bytes:.2f} {suffix}"
    size_bytes /= 1024
  return f"{size_bytes:.2f} {suffixes[-1]}"

def get_folder_size(folder):
  """
  Get the size of the given folder in bytes.
  """
  total_size = 0
  for dirpath, _, filenames in os.walk(folder):
    for filename in filenames:
      file_path = os.path.join(dirpath, filename)
      try:
        total_size += int(os.path.getsize(file_path))
      except OSError as e:
        print(f"Error accessing file {file_path}: {e}")
        
  return readable_size(total_size)

if __name__ == '__main__':
  folder_path = '/Volumes/H3'
  print("Folder Size:", get_folder_size(folder_path))



