from tkinter import filedialog
import tkinter as tk
import platform
import os

def is_windows():
    return platform.system() == 'Windows'

def select_folder():
  root = tk.Tk()
  root.withdraw()  # Hide the main window

  folder_path = filedialog.askdirectory()

  if folder_path:
    if is_windows():
      if not folder_path.endswith("\\"):
        folder_path += "\\"
      return folder_path.replace("/", "\\")
    else:
      if not folder_path.endswith("/"):
        folder_path += "/"
      return folder_path
  else:
    return False

if __name__ == "__main__":
  folder_path = select_folder()
  print(folder_path)
  if folder_path:
    print(os.path.join(folder_path, "Nine Inch Nails", "Quake", "Quake.m3u8"))
