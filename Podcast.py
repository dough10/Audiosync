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
    self.__title = xml['rss']['channel']['title']
    self.__list = xml['rss']['channel']['item']
    self.__imageURL = xml['rss']['channel']['image']['url']
    count = len(self.__list)
    self.__log(self.__title + ' ' + str(count) + ' episodes')
    self.__location = config.folder + '/' + self.__title
    # self.__downloadAll()
    if os.path.exists(self.__location):
      self.__downloadNewest()
    else:
      os.mkdir(self.__location)
      if not config.downloadAll:
        self.__downloadNewest()
        return
      self.__downloadAll()

  def __log(self, message):
    if __name__ == "__main__":
      print(message)

  def __formatFilename(self, s):
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    filename = ''.join(c for c in s if c in valid_chars)
    filename = filename.replace(' ','.')
    return filename

  def __writeImage(self, file, img):
    try:
      file['artwork'] = img
    except:
      self.__log('Error adding image')

  def __id3tag(self, episode, path):
    self.__log('Updating ID3 tags')
    file = id3.load_file(path)
    file['title'] = episode['title']
    file['album'] = self.__title
    file['genre'] = 'Podcast'
    file['comment'] = episode['itunes:summary']
    file['artist'] = self.__title
    file['compilation'] = True
    file.resolve('album artist')
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
      filename = self.__formatFilename('S' + episode['itunes:season'] + '.E' + episode['itunes:episode'] + '.' + episode['title'] + '.mp3')
    else:
      filename = self.__formatFilename(episode['title'] + '.mp3')
    path = self.__location + '/' + filename
    if os.path.exists(path):
      self.__log('Newest episode ' + filename + ' already downloaded')
      return
    self.__log('Downloading - ' + filename)
    media = requests.get(episode['enclosure']['@url'])
    open(path, 'wb').write(media.content)
    self.__id3tag(episode, path)

  def __downloadNewest(self):
    self.__fileDL(self.__list[0])

  def __downloadAll(self):
    for episode in self.__list:
      self.__fileDL(episode)

if __name__ == "__main__":
  print(datetime.datetime.now().strftime("%H:%M %B %d, %Y"))
  t = Podcast(sys.argv[1])
  print('download complete')