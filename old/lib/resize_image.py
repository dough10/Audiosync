from PIL import Image

import os
import sys

try:
  from lib.change_log import ChangeLog
  from lib.log import log
except ModuleNotFoundError:
  from change_log import ChangeLog
  from log import log
  
change_log = ChangeLog()

def resize_image(image_path:str, size:int, destination:str, ext='JPEG'):
  options = {
    "quality": 100 if ext == 'JPEG' else 60,
    "method": 0 if ext == 'JPEG' else 6,
    "lossless": True if ext == 'JPEG' else False 
  }
  try:
    img = Image.open(image_path)
    width, height = img.size 
    if width > size or height > size:
      img.thumbnail((size, size), Image.LANCZOS)
      log(f'Resize: {image_path} -> {destination} {ext} {size}x{size}')
      change_log.image_resized()
    img.convert('RGB')
    try:
      if ext == 'WEBP':
        img.save(destination, ext, **options)
      else :
        img.save(destination, ext)
    except FileExistsError:
      os.remove(destination)
      if ext == 'WEBP':
        img.save(destination, ext, **options)
      else :
        img.save(destination, ext)
    except OSError:
      img.save(destination, 'PNG')
  except Exception as e:
    pass

if __name__ == "__main__":
  resize_image(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])