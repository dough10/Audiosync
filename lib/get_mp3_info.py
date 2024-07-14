import os

from PIL import Image
import music_tag as MP3
from io import BytesIO


try:
  from lib.log import need_attention, log
  from lib.file_manager import File_manager
  from lib.resize_image import resize_image
except ModuleNotFoundError:
  from log import need_attention, log
  from file_manager import File_manager
  from resize_image import resize_image
  
  
file_manager = File_manager()

def get_mp3_info(source_file:str, file:str):
  jpg = source_file.replace(file, 'cover.jpg')

  id3 = MP3.load_file(source_file)

  # artist name for file sorting
  if 'albumartist' in id3:
    artist = file_manager.formatFilename(str(id3['albumartist']))
  elif 'artist' in id3:
    artist = file_manager.formatFilename(str(id3['artist']))
  else:
    need_attention.append(f'file: {source_file}\nissue: artist\n')
    return None

  # album name
  if 'album' in id3:
    album = file_manager.formatFilename(str(id3['album']))
  else: 
    need_attention.append(f'file: {source_file}\nissue: album\n')
    return None

  # artist name for looking up song lyrics
  try: 
    lrc_artist = str(id3['artist'])
  except KeyError:
    lrc_artist = str(id3['albumartist'])

  try:
    title = str(id3['title'])
  except KeyError:
    title = str(os.path.splitext(file)[0])

  # ID3 track number 
  try:
    track_number = int(id3['tracknumber'])
  except ValueError:
    return None
  
  #ID3 disc number
  try:
    disc_number = int(id3['discnumber'])
  except ValueError:
    return None

  # attempt to extract art from mp3 file if it doesn't exist
  if not os.path.exists(jpg):
    try:
      img = Image.open(BytesIO(id3['APIC:'].data))
      resize_image(img, 1000, jpg)
      log(f'{jpg} extracted from {source_file}')
    except Exception as e:
      pass
  
  # long file
  target = 30 * 60
  duration = id3['#length'].value 
  if duration > target:
    pass
    # print(f'{source_file}: long file')

  return {
    'track': track_number, 
    'disc': disc_number, 
    'artist': artist.strip(), 
    'album': album.strip(), 
    'title': title.strip(), 
    'lrc_artist': lrc_artist.strip(),
    'length': id3['#length']
  }



if __name__ == "__main__":
  print(get_mp3_info('C:\\Users\\SyncthingServiceAcct\\Music\\Other\\Daft Punk\\Alive 2007 CD2\\01 Encore - Human After All Togethe.mp3', '01 Encore - Human After All Togethe.mp3'))