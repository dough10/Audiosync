import aiohttp
import asyncio

try:
  from lib.config_controler import Config
except ModuleNotFoundError:
  from config_controler import Config


config_controler = Config()

rate_limit_remaining = 60

async def fetch_discogs_data(artist, album, tracklist):
  global rate_limit_remaining
  
  async with aiohttp.ClientSession() as session:
    search_query = f"'{artist}' '{album}' '{' '.join(tracklist)}'"
    headers = {
      'User-Agent': 'Audiosync/0.1',
      'Authorization': f"Discogs token={config_controler.get_key('discogs_token')}"
    }

    while True:
      async with session.get(f'https://api.discogs.com/database/search?q={search_query}&type=release', headers=headers) as response:
        rate_limit_remaining = response.headers.get('X-Discogs-Ratelimit-Remaining')
        if rate_limit_remaining is None or int(rate_limit_remaining) > 0:
          data = await response.json()
          return data
        else:
          print("Rate limit reached. Retrying after 60 seconds.")
          await asyncio.sleep(60)



def get_upc(artist:str, album:str, tracklist:list):
  
  data = asyncio.run(fetch_discogs_data(artist, album, tracklist))

  try:
    seen_codes = set()
    codes = [code for release in data['results'] if 'CD' in release['format'] for code in release['barcode'] if code is not None and code not in seen_codes and not seen_codes.add(code)]
    return ', '.join(codes)

  except IndexError:
    return None



if __name__ == "__main__":
  print(get_upc('Daft Punk', 'Homework', ['Daftendirekt', 'WDPK 83.7 FM', 'Revolution 909', 'Da Funk', 'Phoenix', 'Fresh', 'Around The World', "Rollin' & Scratchin'", 'Teachers', 'High Fidelity', "Rock'n Roll", 'Oh Yeah', "Burnin'", 'Indo Silver Club', 'Alive', 'Funk Ad']))

