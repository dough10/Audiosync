import os
import re
import sys
import json
import glob
import time
import shutil
import string
import requests
import datetime
import tempfile
import xmltodict
import music_tag as id3
from tqdm import tqdm
from PIL import Image
from io import BytesIO
from urllib.parse import urlparse
from dateutil.relativedelta import relativedelta

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
with open(os.path.join(script_folder, 'config.json'), 'r') as jason:
  config = json.load(jason)

folder = config['folder']
download = config['download']
logLocation = config['logLocation']

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
    file for file in glob.glob(f'{path}/*.mp3')
    if old_date < datetime.datetime.fromtimestamp(os.path.getmtime(file)).date()
  ]

def list_of_old_files(path):
  return [
    file for file in glob.glob(f'{path}/*.mp3')
    if old_date > datetime.datetime.fromtimestamp(os.path.getmtime(file)).date()
  ]

def copy_file(source, destination, max_retries=3, timeout=10):
  retries = 0
  while retries < max_retries:
    try:
      shutil.copy2(source, destination)
      break  # Copy successful, exit the loop
    except shutil.Error as e:
      print(f"Error copying file: {str(e)}")
      retries += 1
      if retries < max_retries:
        print(f"Retrying after {timeout} seconds...")
        time.sleep(timeout)
      else:
        print(f"Maximum retries reached. Copy failed.")
        raise  # Reraise the exception if maximum retries reached

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
  
  print('Begining sync. This may take a while')

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
      dest = os.path.join(podcast_folder_on_player, dir) # where we will send the files
      dest_art = os.path.join(podcast_folder_on_player, dir, 'cover.jpg')
      files_to_add = list_of_new_files(src)
      files_to_delete = list_of_old_files(dest)
      num_files = len(files_to_add)

      # create folder if there are file to write in it
      if not os.path.exists(dest) and num_files > 0:
        try:
          print(f'Creating folder {dest}')
          os.makedirs(dest)
          newPodcast += 1
        except OSError as e:
          raise OSError(f"Error creating folder {dest}: {str(e)}")
        
      # copy cover.jpg
      if not os.path.exists(dest_art) and os.path.exists(dest):
        src_art = os.path.join(src, 'cover.jpg')
        try:
          print(f'{src_art} -> {dest_art}')
          copy_file(src_art, dest)
          filesWriten += 1
        except Exception as e:
          raise Exception(f"Error copying cover.jpg: {str(e)}")

      # copy "new" files to player from storage location
      for file in files_to_add:
        filename = os.path.basename(file)
        dest_dir = os.path.join(podcast_folder_on_player, dir)
        path = os.path.join(dest_dir, filename)
        if not os.path.exists(path):
          try:
            print(f'{file} -> {path}')
            copy_file(file, dest_dir)
            filesWriten += 1
          except Exception as e:
            raise Exception(f"Error copying file {file}: {str(e)}")

      # remove "old" files from player
      for file in files_to_delete:
        try:
          print(f'{file} -> Trash')
          os.remove(file)
          filesDeleted += 1
        except Exception as e:
          raise Exception(f"Error deleting file {file}: {str(e)}")

      # check for empty folder
      if os.path.exists(dest) and len(glob.glob(f'{dest}/*.mp3')) == 0:
        try:
          print(f'Removing empty folder {dest}')
          shutil.rmtree(dest)
          foldersDeleted += 1
          foldersContained += 1 # cover.jpg
        except Exception as e:
          raise Exception(f"Error deleting directory {dest}: {str(e)}")

  # remove folders no longer in source directory (unsubscribed podcast)
  for dir in os.listdir(podcast_folder_on_player):
    dest = os.path.join(podcast_folder_on_player, dir)
    if not dir.startswith('.') and not dir in os.listdir(folder):
      foldersContained += len([entry for entry in os.listdir(dest) if os.path.isfile(os.path.join(dest, entry)) and not entry.startswith('.')])
      try:
        print(f'deleting - {dest}')
        shutil.rmtree(dest)
        foldersDeleted += 1
      except Exception as e:
        raise Exception(f"Error deleting folder {dest}: {str(e)}")

  print('')
  if foldersDeleted == 0 and newPodcast == 0 and filesWriten == 0 and filesDeleted == 0 and foldersContained == 0:
    print(f'Sync complete: No changes made to drive')
  else:
    filesDeleted += foldersContained
    extra_text = '' if foldersDeleted == 0 else f' containing {foldersContained} file{"s" if foldersContained != 1 else ""}'
    print(f'Sync complete: {newPodcast} folder{"s" if newPodcast != 1 else ""} created, {filesWriten} file{"s" if filesWriten != 1 else ""} copied, {filesDeleted} file{"s" if filesDeleted != 1 else ""} removed and {foldersDeleted} folder{"s" if foldersDeleted != 1 else ""} removed{extra_text}')
  if question(f'Would you like to eject {player} (yes/no) '):
    print('Please wait for prompt before removing the drive')
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
  while True:
    answer = input(q).strip().lower()
    if answer in ['yes', 'y', '1']:
      return True
    elif answer in ['no', 'n', '0']:
      return False
    else:
      print('Invalid option. Please enter "yes" or "no".')

def dlWithProgressBar(url, path):
  chunk_size = 4096
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
  """
  Sets the ID3 artwork for the given file using the provided image data.

  Args:
      file (id3.ID3): The ID3 file object.
      img (bytes): The image data.

  Returns:
      None
  """
  try:
    file['artwork'] = img
  except Exception as e:
    print('Attempting Image embed workaround')
    tmp_file_path = None
    try:
      with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
        tmp_file.write(img)
        tmp_file_path = tmp_file.name
        file['artwork'] = Image.open(tmp_file_path)
    except Exception as e:
      print(f'Error encoding image: {str(e)}')
    finally:
      if tmp_file_path and os.path.exists(tmp_file_path):
        os.remove(tmp_file_path)

def setTrackNum(file, episode, epNum):
  """
  Sets the track number for the given ID3 file based on the episode's metadata.

  Args:
      file (id3.ID3): The ID3 file object.
      episode (dict): The metadata of the episode.
      epNum (int): The fallback track number.

  Returns:
      None
  """
  try:
    if 'itunes:episode' in episode:
      file['tracknumber'] = episode['itunes:episode']
    else:
      file['tracknumber'] = epNum
  except Exception as e:
    print(f"Error setting track number: {str(e)}")

class Podcast:

  def __init__(self, url):
    print(datetime.datetime.now().strftime('%a, %d %b %Y %H:%M:%S %z'))
    # check internet
    if not is_connected():
      print('Error connecting to the internet. Please check network connection and try again')
      sys.exit()

    # check folder exists
    if not os.path.exists(folder):
      print(f'Folder {folder} does not exist. check config.py')
      sys.exit()

    self.__xmlURL = url.strip()

    if not validate_url(self.__xmlURL):
      print('Invalid URL address')
      sys.exit()

    if not is_live_url(self.__xmlURL):
      print('Error validating URL')
      sys.exit()
      
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
    self.__location = os.path.join(folder, self.__title)
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
    except Exception as e:
      print(f"Error loading ID3 file: {str(e)}")
      return
    
    try:
      print('Updating ID3 tags & encoding artwork')
      file['title'] = episode['title']
      file['album'] = self.__title
      file['artist'] = self.__title
      file['genre'] = 'Podcast'
      file['album artist'] = 'Various Artist'

      # Set comment tag if 'itunes:subtitle' key exists
      if 'itunes:subtitle' in episode:
        file['comment'] = episode['itunes:subtitle']

      # Set year tag
      try:
        pub_date = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %z')
      except (ValueError, TypeError):
        try:
          pub_date = datetime.datetime.strptime(episode['pubDate'], '%a, %d %b %Y %H:%M:%S %Z')
        except (ValueError, TypeError) as e:
          print(f"Error setting year tag: {str(e)}")
          pub_date = None
      if pub_date:
          file['year'] = pub_date.year

      # Set track number
      try:
        ep = [int(s) for s in re.findall(r'\b\d+\b', episode['title'])]
        if self.__title == 'Hospital Records Podcast' and ep and ep[0] < 2000:
          file['tracknumber'] = ep[0]
        else:
          setTrackNum(file, episode, epNum)
      except Exception as e:
        print(f"Error setting track number: {str(e)}")

      # Set ID3 artwork
      try:
        if 'itunes:image' in episode:
          img = requests.get(episode['itunes:image']['@href'])
          if img.status_code == 200:
            id3Image(file, img.content)
          else:
            if hasattr(self, '__image'):
              id3Image(file, self.__image)
            else:
              self.__image = Image.open(self.__coverJPG)
              id3Image(file, self.__image)
        else:
          if hasattr(self, '__image'):
            id3Image(file, self.__image)
          else:
            self.__image = Image.open(self.__coverJPG)
            id3Image(file, self.__image)
      except Exception as e:
          print(f"Error setting ID3 artwork: {str(e)}")

      # Save the modified ID3 tags
      try:
        file.save()
      except Exception as e:
        print(f"Error saving ID3 tags: {str(e)}")
    except Exception as e:
      print(f"Error updating ID3 tags: {str(e)}")

  def __fileDL(self, episode, epNum):
    """
    Downloads a podcast episode and sets the ID3 tags for the downloaded file.

    Args:
        episode (dict): The metadata of the episode.
        epNum (int): The episode number.

    Returns:
        None
    """
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

  def __get_cover_art(self):
    self.__coverJPG = os.path.join(self.__location, 'cover.jpg')
    if not os.path.exists(self.__coverJPG):
      print(f'getting cover art {self.__coverJPG}')
      res = requests.get(self.__imgURL)
      img = Image.open(BytesIO(res.content))
      width, height = img.size 
      if width > 500 or height > 500:
        img.thumbnail((500, 500), Image.ANTIALIAS)
      img.convert('RGB')
      try:
        img.save(self.__coverJPG, 'JPEG')
      except OSError:
        img.save(self.__coverJPG, 'PNG')
      self.__image = img

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
    self.__get_cover_art()

  def episodeCount(self):
    return len(self.__list)

  def subscribe(self):
    if not os.path.exists(logLocation):
      print(f'logLocation {logLocation} does not exist')
      sys.exit()
    print('Creating cronjob')
    os.system(f"(crontab -l 2>/dev/null; echo \"0 0 * * * /usr/local/bin/python3 {file_path} {self.__xmlURL} > {os.path.join(logLocation, formatFilename(self.__title))}.log 2>&1\") | crontab -")
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