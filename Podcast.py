import requests
import xmltodict
import os
import re
import sys
import glob
import shutil
import string
import datetime
import validators
import music_tag as id3
from tqdm import tqdm
from config import *
from PIL import Image
from dateutil.relativedelta import relativedelta

today = datetime.date.today()
old_date = today - relativedelta(months=1)

def list_of_new_files(path):
  return [
    file for file in glob.glob(path + '*.mp3')
    if old_date < datetime.datetime.fromtimestamp(os.path.getmtime(file)).date()
  ]

def list_of_old_files(path):
  return [
    file for file in glob.glob(path + '*.mp3')
    if old_date > datetime.datetime.fromtimestamp(os.path.getmtime(file)).date()
  ]

def updatePlayer(player):
  filesWriten = 0
  filesDeleted = 0
  foldersDeleted = 0
  foldersContained = 0
  # check locations
  if not os.path.exists(folder):
    print(f'Error accessing {folder}. Check if the drive is mounted')
    sys.exit()
  if not os.path.exists(player):
    print(f'Error accessing {player}. Check if the drive is mounted')
    sys.exit()
  print('Begining sync')
  if not os.path.exists(f'{player}/Podcasts'):
    os.mkdir(f'{player}/Podcasts')

  # copy "new" files to the player and remove "old" files
  for dir in os.listdir(folder):
    if not dir == '.DS_Store':
      # create folder
      if not os.path.exists(f'{player}/Podcasts/{dir}'):
        os.mkdir(f'{player}/Podcasts/{dir}')

      # copy cover.jpg
      if not os.path.exists(f'{player}/Podcasts/{dir}/cover.jpg'):
        try:
          print(f'{folder}/{dir}/cover.jpg -> {player}/Podcasts/{dir}/cover.jpg')
          shutil.copy2(f'{folder}/{dir}/cover.jpg', f'{player}/Podcasts/{dir}')
        except Exception as e:
          print(e)
          sys.exit()

      # copy "new" files to player from storage location
      for file in list_of_new_files(f'{folder}/{dir}/'):
        f = file.split('/')
        filename = f[len(f)-1]
        if not os.path.exists(f'{player}/Podcasts/{dir}/{filename}'):
          try:
            print(f'{file} -> {player}/Podcasts/{dir}/{filename}')
            shutil.copy2(file, f'{player}/Podcasts/{dir}')
          except Exception as e:
            print(e)
            sys.exit()
          if os.path.exists(f'{player}/Podcasts/{dir}/{filename}'):
            filesWriten += 1

      # remove "old" files from player
      for file in list_of_old_files(f'{player}/Podcasts/{dir}'):
        print(f'deleting - {file}')
        os.remove(file)
        if not os.path.exists(file):
          filesDeleted += 1

  # remove folders no longer in source directory
  for dir in os.listdir(f'{player}/Podcasts'):
    dirPath = f'{player}/Podcasts/{dir}'
    if not '._' in dir:
      if not dir in os.listdir(folder):
        foldersContained += len([entry for entry in os.listdir(dirPath) if os.path.isfile(os.path.join(dirPath, entry))])
        try:
          print(f'deleting - {player}/Podcasts/{dir}')
          shutil.rmtree(f'{player}/Podcasts/{dir}')
        except Exception as e:
          print(f'Error removing folder {e}')
        if not os.path.exists(f'{player}/Podcasts/{dir}'):
          foldersDeleted += 1

  print(f'Sync complete: {filesWriten} file{"s" if not filesWriten == 1 else ""} copied, {filesDeleted} file{"s" if not filesDeleted == 1 else ""} removed and {foldersDeleted} folder{"s" if not foldersDeleted == 1 else ""} deleted containing {foldersContained} file{"s" if not foldersContained == 1 else ""}')
  if question(f'Would you like to eject {player} (yes/no) '):
    os.system(f'diskutil eject {escapeFolder(player)}')

def listCronjobs():
  return re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', os.popen('crontab -l').read())

def escapeFolder(string):
  return string.replace(' ', '\ ').replace('(', '\(').replace(')', '\)')

def formatFilename(s):
  valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
  filename = ''.join(c for c in s if c in valid_chars)
  filename = filename.replace(' ','.')  # no spaces in filename
  filename = filename.replace('..','.') # after removing spaces can have instances where .. is in a filename
  return filename

def question(q):
  ask = input(q).strip()
  if ask.lower() in ['yes', 'y', '1']:
    return True
  elif ask.lower() in ['no', 'n', '0']:
    return False
  else:
    print('invalid option')
    return question(q)

def dlWithProgressBar(url, path):
  media = requests.get(url, stream=True)
  if media.status_code != 200:
    print(f'Content download error code {media.status_code}')
    return
  bytes = int(media.headers.get('content-length', 0))
  progress = tqdm(total=bytes, unit='iB', unit_scale=True)
  with open(path, 'wb') as file:
    for data in media.iter_content(1024):
      progress.update(len(data))
      file.write(data)
  progress.close()
  if bytes != 0 and progress.n != bytes:
    print("ERROR!!, something went wrong")

def id3Image(file, img):
  try:
    file['artwork'] = img
  except:
    print('Attempting Image embed workaround')
    tmp = f'{os.getcwd()}/tmp.jpg'
    open(tmp, 'wb').write(img)
    try:
      file['artwork'] = Image.open(tmp)
    except Exception as e:
      print(f'Error encoding image {e}')
    os.remove(tmp)

def setTrackNum(file, episode, epNum):
  try:
    file['tracknumber'] = episode['itunes:episode']
  except KeyError:
    file['tracknumber'] = epNum

class Podcast:

  def __init__(self, url):
    if not os.path.exists(folder):
      print(f'Folder {folder} does not exist. check config.py')
      sys.exit()
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
    self.__location = f'{folder}/{self.__title}'
    try:
      self.__imgURL = xml['rss']['channel']['image']['url']
    except TypeError:
      self.__imgURL = xml['rss']['channel']['image'][0]['url']
    except KeyError:
      self.__imgURL = xml['rss']['channel']['itunes:image']['@href']
    print(f'{self.__title} {str(self.episodeCount())} episodes')

  def __id3tag(self, episode, path, epNum):
    try:
      file = id3.load_file(path)
    except:
      return
    print('Updating ID3 tags & encoding artwork')
    file['title'] = episode['title']
    file['album'] = self.__title
    file['artist'] = self.__title
    file['genre'] = 'Podcast'
    file['album artist'] = 'Various Artist'
    try:
      file['year'] = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %z').year
    except (ValueError, TypeError):
      file['year'] = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %Z').year
    if self.__title == 'Hospital Records Podcast':
      a = [int(s) for s in re.findall(r'\b\d+\b', episode['title'])]
      try:
        if a[0] < 2000 and not int(file['tracknumber']) == a[0]:
          file['tracknumber'] = a[0]
      except:
        setTrackNum(file, episode, epNum)
    else:
      setTrackNum(file, episode, epNum)
    try: # checking if itunes:image exists
      img = requests.get(episode['itunes:image']['@href'])
      if img.status_code != 200: # image isn't there
        try: # checking for cached image
          img = self.__image
        except: # image was not cached 
          self.__image = requests.get(self.__imgURL)
          img = self.__image
      id3Image(file, img.content)
    except KeyError: # itunes:image doesn't exist
      try: # attempt to encode cached image
        id3Image(file, self.__image.content)
      except:  # image was not cached
        self.__image = requests.get(self.__imgURL)
        id3Image(file, self.__image.content)
    file.save()

  def __fileDL(self, episode, epNum):
    try:
      filename = formatFilename(f"S{episode['itunes:season']}.E{episode['itunes:episode']}.{episode['title']}.mp3")
    except KeyError:
      filename = formatFilename(f"{episode['title']}.mp3")
    path = f'{self.__location}/{filename}'
    if os.path.exists(path):
      print(f'Episode {filename} already downloaded')
      return
    print(f'Downloading - {filename}')
    dlWithProgressBar(episode['enclosure']['@url'], path)
    self.__id3tag(episode, path, epNum)

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
    os.system(f"(crontab -l 2>/dev/null; echo \"0 0 * * * /usr/local/bin/python3 {os.getcwd()}/Podcast.py {self.__xmlURL} > {logLocation}/{formatFilename(self.__title)}.log 2>&1\") | crontab -")
    print('Starting download. This may take a minuite.')
    self.auto()

  def unsubscribe(self):
    if question(f'is "{self.__title}" the right podcast? (yes/no) '):
      os.system(f'crontab -l | grep -v "{self.__xmlURL}" | crontab -')
      print('Cronjob removed')
      if question('Remove all downloaded files? (yes/no) ') and question('files can not be recovered. are you sure? (yes/no) '):
        print(f'Deleteing directory {self.__location}')
        shutil.rmtree(self.__location)

  def downloadNewest(self):
    self.__mkdir()
    self.__fileDL(self.__list[0], len(self.__list))
    print('download complete')

  def downloadAll(self):
    self.__mkdir()
    for ndx, episode in enumerate(self.__list):
      self.__fileDL(episode, len(self.__list) - ndx)
    print('download complete')

  def downloadCount(self, count):
    self.__mkdir()
    for num in range(count):
      self.__fileDL(self.__list[num], len(self.__list) - num)

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