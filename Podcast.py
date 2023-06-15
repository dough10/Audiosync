import requests
import xmltodict
import os
import sys
import string
import datetime
import validators
import music_tag as id3
from tqdm import tqdm
from config import *

class Podcast:

  def __init__(self, url):
    self.__xmlURL = url.strip()
    if not validators.url(self.__xmlURL):
      print('Invalid URL address')
      sys.exit()
    print(datetime.datetime.now().strftime('%a, %d %b %Y %H:%M:%S %z'))
    print(f'Fetching XML from {self.__xmlURL}')
    res = requests.get(self.__xmlURL)
    if res.status_code != 200:
      print(f'Error getting XML data. Error code {res.status_code}')
      sys.exit()
    try:
      xml = xmltodict.parse(res.content)
    except Exception as e:
      print(f'Error parsing XML {e}')
      sys.exit()
    self.__title = xml['rss']['channel']['title']  # the name of the podcast
    self.__list = xml['rss']['channel']['item']  # list of podcast episodes
    try:
      self.__imgURL = xml['rss']['channel']['image']['url']
    except TypeError:
      self.__imgURL = xml['rss']['channel']['image'][0]['url']
    except KeyError:
      self.__imgURL = xml['rss']['channel']['itunes:image']['@href']
    print(f'{self.__title} {str(self.episodeCount())} episodes')
    self.__location = f'{folder}/{self.__title}'

  def __id3Image(self, file, img):
    try:
      file['artwork'] = img
    except Exception as e:
      print(f'Error encoding image {e}')

  def __id3tag(self, episode, path):
    print('Updating ID3 tags & encoding artwork')
    file = id3.load_file(path)
    file['title'] = episode['title']
    file['album'] = self.__title
    file['artist'] = self.__title
    file['genre'] = 'Podcast'
    file['album artist'] = 'Various Artist'
    try:
      file['year'] = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %z').year
    except (ValueError, TypeError):
      file['year'] = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %Z').year
    try:
      file['tracknumber'] = episode['itunes:episode']
    except KeyError:
      pass
    try: # checking if itunes:image exists
      img = requests.get(episode['itunes:image']['@href'])
      if img.status_code != 200: # image isn't there
        try: # checking for cached image
          img = self.__image
        except: # image was not cached 
          self.__image = requests.get(self.__imgURL)
          img = self.__image
      self.__id3Image(file, img.content)
    except KeyError: # itunes:image doesn't exist
      try: # attempt to encode cached image
        self.__id3Image(file, self.__image.content)
      except:  # image was not cached
        self.__image = requests.get(self.__imgURL)
        self.__id3Image(file, self.__image.content)
    file.save()

  def __dlWithProgressBar(self, url, path):
    media = requests.get(url, stream=True)
    if media.status_code != 200:
      print(f'Content download error code {media.status_code}')
      sys.exit()
    bytes = int(media.headers.get('content-length', 0))
    progress = tqdm(total=bytes, unit='iB', unit_scale=True)
    with open(path, 'wb') as file:
      for data in media.iter_content(1024):
        progress.update(len(data))
        file.write(data)
    progress.close()
    if bytes != 0 and progress.n != bytes:
      print("ERROR!!, something went wrong")

  def __formatFilename(self, s):
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    filename = ''.join(c for c in s if c in valid_chars)
    filename = filename.replace(' ','.')  # no spaces in filename
    filename = filename.replace('..','.') # after removing spaces can have instances where .. is in a filename
    return filename

  def __escapeFolder(self, string):
    return string.replace(' ', '\ ')

  def __fileDL(self, episode):
    try:
      filename = self.__formatFilename(f"S{episode['itunes:season']}.E{episode['itunes:episode']}.{episode['title']}.mp3")
    except KeyError:
      filename = self.__formatFilename(f"{episode['title']}.mp3")
    path = f'{self.__location}/{filename}'
    if os.path.exists(path):
      print(f'Episode {filename} already downloaded')
      return
    print(f'Downloading - {filename}')
    self.__dlWithProgressBar(episode['enclosure']['@url'], path)
    self.__id3tag(episode, path)

  def __mkdir(self):
    if not os.path.exists(folder):
      print(f'Error accessing location {folder}')
      print('Check if network drive is mounted')
      sys.exit()
    if not os.path.exists(self.__location):
      print(f'Creating folder {self.__location}')
      os.mkdir(self.__location)
      print(f'getting cover art {self.__location}/cover.jpg')
      self.__image = requests.get(self.__imgURL)
      open(f'{self.__location}/cover.jpg', 'wb').write(self.__image.content)

  def episodeCount(self):
    return len(self.__list)

  def subscribe(self):
    if not os.path.exists(logLocation):
      print(f'logLocation {logLocation} does not exist')
      sys.exit()
    print('Creating cronjob')
    os.system(f"(crontab -l 2>/dev/null; echo \"0 0 * * * /usr/local/bin/python3 {os.getcwd()}/Podcast.py {self.__xmlURL} > {logLocation}/{self.__formatFilename(self.__title)}.log 2>&1\") | crontab -")
    print('Starting download. This may take a minuite.')
    self.auto()

  def unsubscribe(self, deleteFiles):
    print('Removing cronjob')
    os.system(f'crontab -l | grep -v "{self.__xmlURL}" | crontab -')
    if deleteFiles:
      print(f'Deleteing directory {self.__location}')
      os.system(f'rm -r {self.__escapeFolder(self.__location)}')

  def downloadNewest(self):
    self.__mkdir()
    self.__fileDL(self.__list[0])
    print('download complete')

  def downloadAll(self):
    self.__mkdir()
    for episode in self.__list:
      self.__fileDL(episode)
    print('download complete')

  def downloadCount(self, count):
    for num in range(count):
      self.__fileDL(self.__list[num])

  def auto(self):
    if download == 'all':
      self.downloadAll()
    elif download == 'newest':
      self.downloadNewest()
    elif type(download) == int and download <= self.episodeCount():
      self.downloadCount(download)
    else:
      print(f'invalid option {download}')
      print('Options are "all", "newest" or a count that can not exceede the total number of episodes')

if __name__ == "__main__":
  try:
    Podcast(sys.argv[1]).auto()
  except KeyboardInterrupt:
    print('Download stopped by user')
  except IndexError:
    print('1 argument required "URL"')