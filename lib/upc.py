import requests
import os
import json

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
config_path = os.path.join(script_folder, '..', 'config.json')
with open(config_path, 'r') as j:
  config = json.load(j)


def get_upc(artist, album, tracklist):
  search_query = f"'{artist}' '{album}' '{' '.join(tracklist)}'"
  headers = {
    'User-Agent': 'DiscogsAPIExample/0.1',
    'Authorization': f"Discogs token={config['discogs_token']}"
  }
  response = requests.get(f'https://api.discogs.com/database/search?q={search_query}&type=release', headers=headers)
  data = response.json()
  if 'results' in data and data['results']:
    try:
      for release in data['results']:
        try:
          if release['formats'][0]['name'] == 'CD' and release['country'] == 'US':
            return str(release['barcode'])
        except: 
          pass
        
      return data['results'][0]['barcode'][0]
    except IndexError:
      return False
  else:
    return False


if __name__ == "__main__":
  print(get_upc('Pink Floyd', 'The Wall', [
    "In The Flesh?",
    "The Thin Ice",
    "Another Brick In The Wall Part 1",
    "The Happiest Days Of Our Lives",
    "Another Brick In The Wall Part 2",
    "Mother",
    "Goodbye Blue Sky",
    "Empty Spaces",
    "Young Lust",
    "One Of My Turns",
    "Don't Leave Me Now",
    "Another Brick In The Wall Part 3",
    "Goodbye Cruel World",
    "Hey You",
    "Is There Anybody Out There?",
    "Nobody Home",
    "Vera",
    "Bring The Boys Back Home",
    "Comfortably Numb",
    "The Show Must Go On",
    "In The Flesh",
    "Run Like Hell",
    "Waiting For The Worms",
    "Stop",
    "The Trial",
    "Outside The Wall"
  ]))

