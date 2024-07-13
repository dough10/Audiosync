import os

from mutagen.flac import FLAC

try:
  from lib.log import need_attention
  from lib.file_manager import File_manager
except ModuleNotFoundError:
  from log import need_attention
  from file_manager import File_manager


file_manager = File_manager()


def get_flac_info(source_file, file):
  flac = FLAC(source_file)

  # album name (for folder structure)
  if "album" in flac:
    album = file_manager.formatFilename(flac["album"][0])
  else:
    need_attention.append(f'file: {source_file}\nissue: album\n')
    return False
  
  # artist name
  if "albumartist" in flac:
    artist = file_manager.formatFilename(flac["albumartist"][0])
  elif 'artist' in flac:
    artist = file_manager.formatFilename(flac["artist"][0])
  else:
    need_attention.append(f'file: {source_file}\nissue: artist\n')
    return False

  # artist name for looking up song lyrics
  try:
    lrc_artist = flac["artist"][0]
  except KeyError:
    lrc_artist = flac["albumartist"][0]

  # attempt to get title from flac info
  try:
    title = flac['title'][0]
  
  # get title from filename
  except KeyError:
    title = os.path.splitext(file)[0]


  track = int(flac['tracknumber'][0])
  if 'discnumber' in flac:
    try:
      disc = int(flac['discnumber'][0])
    except ValueError:
      if flac['discnumber'][0] == '1/1':
        disc = 1
      else:
        print(f'error processing {file} disc # {disc} using standby disc 1')
  else:
    disc = 1

  # long file
  target = 30 * 60
  duration = flac.info.length
  if duration > target:
    pass
    # print(f'{source_file}: long file')

  return {'track': track, 'disc': disc, 'artist': artist.strip(), 'album': album.strip(), 'title': title.strip(), 'lrc_artist': lrc_artist.strip()}


if __name__ == "__main__":
  print(get_flac_info('C:\\Users\\SyncthingServiceAcct\\Music\\Other\\Daft Punk\\Daft Punk - Random Access Memories (10th Anniversary Edition) (2023) [24Bit-88.2kHz] FLAC [PMEDIA] ⭐️\\CD 1\\13. Contact.flac', '13. Contact.flac'))