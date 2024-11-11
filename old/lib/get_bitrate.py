from mutagen.flac import FLAC
from mutagen.mp4 import MP4

try:
  from lib.config_controler import Config
except ModuleNotFoundError:
  from config_controler import Config
  
  
cc = Config()
  
def get_bitrate(path:str) -> str:
  """
  ensure bitrate is no higher then the input file bitrate
  
  Parameters:
  path (str): path of file
  
  Returns:
  str: bitrate ie 320k or 128k
  """
  rate = cc.get_key('max_bitrate')
  
  if path.lower().endswith('.flac'):
    audio = FLAC(path)
  elif path.lower().endswith('.m4a'):
    audio = MP4(path)
  else:
    raise ValueError("Unsupported file format")

  bitrate = round(audio.info.bitrate / 1000)
  return f'{bitrate}k' if bitrate < rate else f'{rate}k'


if __name__ == "__main__":
  print(get_bitrate('c:\\Users\\SyncthingServiceAcct\\Music\\D&B\\Blu Mar Ten\\Love Is the Devil\\01 Into the Light (feat. Airwalker).m4a'))