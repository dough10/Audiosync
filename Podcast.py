import requests
import xmltodict
import os
import re
import sys
import glob
import shutil
import string
import datetime
from urllib.parse import urlparse
# import validators
import music_tag as id3
from tqdm import tqdm
from config import *
from PIL import Image
from dateutil.relativedelta import relativedelta

today = datetime.date.today()
old_date = today - relativedelta(months=1)

def is_connected():
  try:
    response = requests.get("https://google.com", timeout=5)
    return response.status_code == 200
  except requests.exceptions.RequestException:
    return False

def validate_url(url):
  try:
    parsed_url = urlparse(url)
    return all([parsed_url.scheme, parsed_url.netloc])
  except Exception:
    return False

def is_live_url(url):
  try:
    response = requests.get(url)
    return response.status_code == 200
  except requests.exceptions.RequestException:
    return False

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
  newPodcast = 0
  filesWriten = 0
  filesDeleted = 0
  foldersDeleted = 0
  foldersContained = 0
  # check locations exist
  if not os.path.exists(folder):
    raise FileNotFoundError(f"Error accessing {folder}. Check if the drive is mounted")
  
  if not os.path.exists(player):
    raise FileNotFoundError(f"Error accessing {player}. Check if the drive is mounted")
  
  print('Begining sync')

  podcast_folder_on_player = os.path.join(player, 'Podcasts')
  if not os.path.exists(podcast_folder_on_player):
    try:
      os.makedirs(podcast_folder_on_player)
    except OSError as e:
      raise OSError(f"Error creating folder {podcast_folder_on_player}: {str(e)}")

  # copy/remove files
  for dir in os.listdir(folder):
    if not dir.startswith('.'): # no hidden directorys
      src = os.path.join(folder, dir) # where all the files are at
      dest = os.path.join(player, 'Podcasts', dir) # where awe will send them

      # create folder
      if not os.path.exists(dest):
        try:
          os.makedirs(dest)
          newPodcast += 1
        except OSError as e:
          raise OSError(f"Error creating folder {dest}: {str(e)}")
        
      # copy cover.jpg
      dest_art = os.path.join(player, 'Podcasts', dir, 'cover.jpg')
      if not os.path.exists(dest_art):
        src_art = os.path.join(src, 'cover.jpg')
        try:
          print(f'{src_art} -> {dest_art}')
          shutil.copy2(src_art, dest)
        except Exception as e:
          raise Exception(f"Error copying cover.jpg: {str(e)}")

      # copy "new" files to player from storage location
      for file in list_of_new_files(f'{src}/'):
        filename = os.path.basename(file)
        dest_dir = os.path.join(player, 'Podcasts', dir)
        path = os.path.join(dest_dir, filename)
        if not os.path.exists(path):
          try:
            print(f'{file} -> {path}')
            shutil.copy2(file, dest_dir)
            filesWriten += 1
          except Exception as e:
            raise Exception(f"Error copying file {file}: {str(e)}")

      # remove "old" files from player
      for file in list_of_old_files(f'{dest}/'):
        try:
          print(f'deleting - {file}')
          os.remove(file)
          filesDeleted += 1
        except Exception as e:
          raise Exception(f"Error deleting file {file}: {str(e)}")

  # remove folders no longer in source directory
  for dir in os.listdir(podcast_folder_on_player):
    dest = os.path.join(player, 'Podcasts', dir)
    if not dir.startswith('.') and not dir in os.listdir(folder):
      foldersContained += len([entry for entry in os.listdir(dest) if os.path.isfile(os.path.join(dest, entry)) and not entry.startswith('.')])
      try:
        print(f'deleting - {dest}')
        shutil.rmtree(dest)
        foldersDeleted += 1
      except Exception as e:
        raise Exception(f"Error deleting folder {dest}: {str(e)}")

  extra_text = '' if foldersDeleted == 0 else f' containing {foldersContained} file{"s" if foldersContained != 1 else ""}'
  print(f'Sync complete: {newPodcast} podcast{"s" if newPodcast != 1 else ""} added, {filesWriten} file{"s" if filesWriten != 1 else ""} copied, {filesDeleted} file{"s" if filesDeleted != 1 else ""} removed and {foldersDeleted} podcast{"s" if foldersDeleted != 1 else ""} deleted{extra_text}')
  if question(f'Would you like to eject {player} (yes/no) '):
    os.system(f'diskutil eject {escapeFolder(player)}')

def listCronjobs():
  return re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', os.popen('crontab -l').read())

def escapeFolder(s):
  return s.replace(' ', '\ ').replace('(', '\(').replace(')', '\)')

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
  chunk_size = 8192
  try:
    session = requests.Session()
    media = session.get(url, stream=True)
    media.raise_for_status()  # Raise an exception for any HTTP errors (status code >= 400)
    bytes = int(media.headers.get('content-length', 0))
    progress = tqdm(total=bytes, unit='iB', unit_scale=True)
    with open(path, 'wb', buffering=chunk_size) as file:
      for data in media.iter_content(chunk_size):
        progress.update(len(data))
        file.write(data)
    progress.close()
    if bytes != 0 and progress.n != bytes:
      print("ERROR: Incomplete download detected.")
      sys.exit()
  except requests.exceptions.RequestException as e:
    print(f"ERROR: An error occurred during the download: {str(e)}")
    sys.exit()
  except IOError as e:
    print(f"ERROR: An I/O error occurred while writing the file: {str(e)}")
    sys.exit()

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
    # check internet
    if not is_connected():
      print('Error connecting to the internet. Please check network connection and try again')
      sys.exit()

    # check folder exists
    if not os.path.exists(folder):
      print(f'Folder {folder} does not exist. check config.py')
      sys.exit()

    self.__xmlURL = url.strip()
    # if not validators.url(self.__xmlURL):
    #   print('Invalid URL address')
    #   sys.exit()

    if not validate_url(self.__xmlURL):
      print('Invalid URL address')
      sys.exit()

    if not is_live_url(self.__xmlURL):
      print('Error validating URL')
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
      file['comment'] = episode['itunes:subtitle']
    except KeyError:
      pass
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
    path = os.path.join(self.__location, filename)
    if os.path.isfile(path):
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
      try:
        os.makedirs(self.__location)
      except OSError as e:
        raise OSError(f"Error creating folder {self.__location}: {str(e)}")
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