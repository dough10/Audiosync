import requests
import xmltodict
import os
import sys
import datetime
import validators
import music_tag as id3
from tqdm import tqdm
from config import folder, logLocation
from filename import formatFilename

class Podcast:

  def __init__(self, url):
    if not validators.url(url):
      print('Invalid URL address')
      return
    print(datetime.datetime.now().strftime('%a, %d %b %Y %H:%M:%S %z'))
    res = requests.get(url)
    xml = xmltodict.parse(res.content)
    self.__xml = url
    self.__title = xml['rss']['channel']['title']  # the name of the podcast
    self.__list = xml['rss']['channel']['item']  # list of podcast episodes
    self.__imgURL = xml['rss']['channel']['image']['url']
    print(f'{self.__title} {str(len(self.__list))} episodes')
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
    try:
      file['tracknumber'] = episode['itunes:episode']
    except:
      pass
    print('Getting image')
    try: 
      img = requests.get(episode['itunes:image']['@href'])
      if img.status_code != 200:
        try:
          img = self.__image
        except:
          self.__image = requests.get(self.__imgURL)
          img = self.__image
      self.__id3Image(file, img.content)
    except:
      try:
        self.__id3Image(file, self.__image.content)
      except:
        self.__image = requests.get(self.__imgURL)
        self.__id3Image(file, self.__image.content)
    file.save()

  def __dlWithProgressBar(self, url, path):
    media = requests.get(url, stream=True)
    bytes = int(media.headers.get('content-length', 0))
    progress = tqdm(total=bytes, unit='iB', unit_scale=True)
    with open(path, 'wb') as file:
      for data in media.iter_content(1024):
        progress.update(len(data))
        file.write(data)
    progress.close()
    if bytes != 0 and progress.n != bytes:
      print("ERROR!!, something went wrong")

  def __fileDL(self, episode):
    try:
      filename = formatFilename(f"S{episode['itunes:season']}.E{episode['itunes:episode']}.{episode['title']}.mp3")
    except:
      filename = formatFilename(f"{episode['title']}.mp3")
    path = f'{self.__location}/{filename}'
    if os.path.exists(path):
      print(f'Episode {filename} already downloaded')
      return
    print(f'Downloading - {filename}')
    self.__dlWithProgressBar(episode['enclosure']['@url'], path)
    self.__id3tag(episode, path)

  def __mkdir(self):
    if not os.path.exists(self.__location):
      print(f'Creating folder {self.__location}')
      os.mkdir(self.__location)
      print(f'getting  {self.__location}/cover.jpg')
      self.__image = requests.get(self.__imgURL)
      open(f'{self.__location}/cover.jpg', 'wb').write(self.__image.content)

  def subscribe(self):
    print('Creating cronjob')
    os.system(f"(crontab -l 2>/dev/null; echo \"0 0 * * * /usr/local/bin/python3 {os.getcwd()}/Podcast.py {self.__xml} > {logLocation}/{self.__title}.log 2>&1\") | crontab -")
    print('Starting download. This may take a minuite.')
    self.downloadNewest()

  def unsubscribe(self):
    print('Removing cronjob')
    cron = os.system('crontab -l')
    print(cron)
    # os.system(f'crontab -l | grep -v "{self.__xml}" | crontab -')

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
      self.downloadAll()

if __name__ == "__main__":
  try:
    t = Podcast(sys.argv[1]).auto()
  except KeyboardInterrupt:
    print('Download stopped by user')