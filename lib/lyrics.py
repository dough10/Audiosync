import re

import lyricsgenius

try:
  from lib.config_controler import Config
except ModuleNotFoundError:
  from config_controler import Config

config_controler = Config()

if config_controler.get_key('genius'):
  genius = lyricsgenius.Genius(config_controler.get_key('genius'))
  genius.verbose = False
  genius.skip_non_songs = True
  genius.remove_section_headers = True
  genius.excluded_terms = ["(Remix)", "(Live)"]

def remove_lines(text):
  text = re.sub(r'(\d+ (?:Contributors?|Embed)|Get tickets as low as \$\d+)', '', text)
  text = text.replace('You might also like', '').replace('embed', '')
  return text.lower()


def get_lyrics(track_name, artist_name):
  try:
    song = genius.search_song(track_name, artist_name)
    lyrics = remove_lines(song.lyrics).replace(f'{track_name} lyrics'.lower(), '').replace(f'see the {artist_name.lower()} live', '')
    return lyrics
  except Exception as e:
    return False

if __name__ == "__main__":
  print(get_lyrics("Dungeons", 'Boombox'))