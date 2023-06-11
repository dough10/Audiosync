import requests
import xmltodict
import os
import sys
import datetime
import string
import music_tag as id3
import config

class Podcast:
  __list = []
  __location = ''
  __title = ''
  __imageURL = ''

  def __init__(self, url):
    res = requests.get(url)
    xml = xmltodict.parse(res.content)
    self.__title = xml['rss']['channel']['title']  # the name of the podcast
    self.__list = xml['rss']['channel']['item']  # list of podcast episodes
    self.__imageURL = xml['rss']['channel']['image']['url'] # main podcast image. this will be the substitute for any missing episode image
    self.__location = f'{config.folder}/{self.__title}'
    self.__log(f'{self.__title} {str(len(self.__list))} episodes')

  def __log(self, message):
    if __name__ == "__main__":
      print(message)

  def __formatFilename(self, s):
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    filename = ''.join(c for c in s if c in valid_chars)
    filename = filename.replace(' ','.')  # no spaces in filename
    filename = filename.replace('..','.') # after removing spaces can have instances where .. is in a filename
    return filename

  def __writeImage(self, file, img):
    try:
      file['artwork'] = img
    except Exception as e:
      self.__log(f'Error adding image {e}')

  def __id3tag(self, episode, path):
    self.__log('Updating ID3 tags')
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
    self.__log('Getting image')
    if 'itunes:image' in episode: 
      img = requests.get(episode['itunes:image']['@href'])
      if img.status_code != 200:
        img = requests.get(self.__imageURL)
      self.__writeImage(file, img.content)
    else:
      img = requests.get(self.__imageURL)
      self.__writeImage(file, img.content)
    file.save()

  def __fileDL(self, episode):
    if ('itunes:season' in episode and 'itunes:episode' in episode):
      filename = self.__formatFilename(f"S{episode['itunes:season']}.E{episode['itunes:episode']}.{episode['title']}.mp3")
    else:
      filename = self.__formatFilename(f"{episode['title']}.mp3")
    path = f'{self.__location}/{filename}'
    if os.path.exists(path):
      self.__log(f'Newest episode {filename} already downloaded')
      return
    self.__log(f'Downloading - {filename}')
    media = requests.get(episode['enclosure']['@url'])
    open(path, 'wb').write(media.content)
    self.__id3tag(episode, path)

  def downloadNewest(self):
    if not os.path.exists(self.__location):
      os.mkdir(self.__location)
    self.__fileDL(self.__list[0])

  def downloadAll(self):
    if not os.path.exists(self.__location):
      os.mkdir(self.__location)
    for episode in self.__list:
      self.__fileDL(episode)

  def auto(self):
    if os.path.exists(self.__location):
      self.downloadNewest()
    else:
      os.mkdir(self.__location)
      self.downloadAll()

if __name__ == "__main__":
  print(datetime.datetime.now().strftime("%H:%M %B %d, %Y"))
  t = Podcast(sys.argv[1]).auto()
  print('download complete')