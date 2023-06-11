import requests
import xmltodict
import os
import sys
import datetime
import music_tag as id3
from tqdm import tqdm
from config import folder
from filename import formatFilename

class Podcast:

  def __init__(self, url):
    print(datetime.datetime.now().strftime("%H:%M %B %d, %Y"))
    res = requests.get(url)
    xml = xmltodict.parse(res.content)
    self.__title = xml['rss']['channel']['title']  # the name of the podcast
    self.__list = xml['rss']['channel']['item']  # list of podcast episodes
    print(f'{self.__title} {str(len(self.__list))} episodes')
    print('getting cover image')
    self.__image = requests.get(xml['rss']['channel']['image']['url']) # main podcast image. this will be the substitute for any missing episode image
    self.__location = f'{folder}/{self.__title}'

  def __id3Image(self, file, img):
    try:
      file['artwork'] = img
    except Exception as e:
      print(f'Error {e} adding image')

  def __id3tag(self, episode, path):
    print('Updating ID3 tags')
    file = id3.load_file(path)
    file['title'] = episode['title']
    file['album'] = self.__title
    file['artist'] = self.__title
    file['genre'] = 'Podcast'
    file['album artist'] = 'Various Artist'
    try:
      file['year'] = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %z').year
    except:
      file['year'] = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %Z').year
    if 'itunes:episode' in episode:
      file['tracknumber'] = episode['itunes:episode']
    print('Getting image')
    if 'itunes:image' in episode: 
      img = requests.get(episode['itunes:image']['@href'])
      if img.status_code != 200:
        img = self.__image
      self.__id3Image(file, img.content)
    else:
      self.__id3Image(file, self.__image.content)
    file.save()

  def __dlWithProgressBar(self, episode, path):
    media = requests.get(episode['enclosure']['@url'], stream=True)
    bytes = int(media.headers.get('content-length', 0))
    progress = tqdm(total=bytes, unit='iB', unit_scale=True)
    with open(path, 'wb') as mp3:
      for data in media.iter_content(1024):
        progress.update(len(data))
        mp3.write(data)
    progress.close()
    if bytes != 0 and progress.n != bytes:
      print("ERROR, something went wrong")


  def __fileDL(self, episode):
    if ('itunes:season' in episode and 'itunes:episode' in episode):
      filename = formatFilename(f"S{episode['itunes:season']}.E{episode['itunes:episode']}.{episode['title']}.mp3")
    else:
      filename = formatFilename(f"{episode['title']}.mp3")
    path = f'{self.__location}/{filename}'
    if os.path.exists(path):
      print(f'Episode {filename} already downloaded')
      return
    print(f'Downloading - {filename}')
    self.__dlWithProgressBar(episode, path)
    self.__id3tag(episode, path)

  def __mkdir(self):
    if not os.path.exists(self.__location):
      os.mkdir(self.__location)
      open(f'{self.__location}/cover.jpg', 'wb').write(self.__image.content)

  def downloadNewest(self):
    self.__mkdir()
    self.__fileDL(self.__list[0])
    print('download complete')

  def downloadAll(self):
    self.__mkdir()
    for episode in self.__list:
      self.__fileDL(episode)
    print('download complete')

  def auto(self):
    if os.path.exists(self.__location):
      self.downloadNewest()
    else:
      self.__mkdir()
      self.downloadAll()
    print('download complete')

if __name__ == "__main__":
  try:
    t = Podcast(sys.argv[1]).auto()
  except KeyboardInterrupt:
    print('Stopped by user')