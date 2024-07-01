import re
import os
import json
import lyricsgenius

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
config_path = os.path.join(script_folder, '..', 'config.json')
with open(config_path, 'r') as j:
  config = json.load(j)

if config['genius']:
  genius = lyricsgenius.Genius(config['genius'])
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