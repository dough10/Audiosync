import os
import json
import threading
import glob
import http.server
import socketserver
import requests

import webview
import xmltodict
import clipboard
import urllib.parse


from lib.select_folder import select_folder
from process_files import run_sync, sync_file, create_lib_json, set_source
from Podcast import Podcast, episodeExists, dlWithProgressBar, update_ID3, load_saved_image, id3Image, folder as podcast_dir
from lib.config_controler import Config

config_controler = Config()

config = config_controler.get()

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)

html_path = os.path.join(script_folder, 'html')
lib_path = os.path.join(script_folder, 'lib_data.json')
fav_path =os.path.join(script_folder, 'favorites.json')

port = 8080

window = False


class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
  def translate_path(self, path):
    path = urllib.parse.unquote(path)
    # Define routing rules
    if path.startswith('/music/'):
      
      path = path[len('/music/'):]
      directory = config['source']
    elif path.startswith('/podcasts/'):
      
      path = path[len('/podcasts/'):]
      directory = config['podcast_folder']
    else:

      directory = html_path
    return os.path.join(directory, path.lstrip('/'))

  def address_string(self):
    host, _ = self.client_address[:2]
    return host

  def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Access-Control-Allow-Methods', 'GET')
    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    self.send_header('Access-Control-Allow-Headers', 'Content-Length')
    self.send_header('Access-Control-Allow-Headers', 'Content-Range')
    self.send_header("Accept-Ranges", "bytes")
    return super().end_headers()




def run_combined_server():
  handler = CustomRequestHandler
  with socketserver.ThreadingTCPServer(("", port), handler) as httpd:
    httpd.max_threads = 4
    httpd.serve_forever()
  



def main():
  global window
  # run UI server
  server_thread = threading.Thread(target=run_combined_server)
  server_thread.daemon = True
  server_thread.start()

  import time
  time.sleep(2)

  # load UI
  window = webview.create_window('sync.json Creator', confirm_close=True, frameless=False, url=f'http://127.0.0.1:{port}/index.html', js_api=Api(), resizable=True, height=800, width=1400, min_size=(550, 750), background_color='#d6d6d6')  
  webview.start(debug=config['debug'])




class Api:

  # get config.json data
  def get_config(self) -> json:
    """
    returns the config object
    
    Parameters:
    None
    
    Returns: 
    json: config object
    """
    return config




  # write config.json data to file
  def update_config(self, frontend_config:json) -> json:
    """
    Updates config with keys from the passed in dict
    
    Parameters:
    - frontend_config (json): change made from HTML
    
    Returns: 
    json: config data 
    """
    return config_controler.update(frontend_config)




  # creates lib_data.json by scanning file library
  def create_json(self) -> None:
    """
    scans music library location and creates a json file of music files
    
    Parameters:
    None
    
    Returns:
    None
    """
    create_lib_json(window)




  #  get lib_data.json data
  def lib_data(self) -> json:
    """
    Loads lib_data.json data to UI
    
    Parameters: 
    None
    
    Returns: 
    json: lib_data
    """
    try:
      file = open(lib_path)
      return json.load(file)
    except FileNotFoundError:
      return {}
    except UnicodeDecodeError:
      return {}




  #  get sync.json data
  def sync_file(self) -> json:
    """
    load sync.json data
    
    Parameters:
    None
    
    Returns:
    json: sync.json
    """
    try:
      file = open(sync_file)
      return json.load(file)
    except FileNotFoundError:
      return {}  
    except UnicodeDecodeError:
      return {}



  # save sync.json data to file
  def save(self, data:json) -> None:
    """
    save data to sync.json
    
    Parameter:
    - data (json): sync.json
    
    Return:
    None
    """
    with open(sync_file, 'w') as lib:
      lib.write(data)




  # run file sync
  def run_sync(self) -> None:
    """
    syncs albums selected in the UI and new podcast the the selected location
     
    Parameter:
    None
    
    Return:
    None
    """
    run_sync(window)




  def get_themes(self) -> list:
    """
    get theme name and file path to pass to UI
    
    Parameter:
    None
    
    Return:
    list: theme list
    """
    theme_dir = os.path.join(script_folder, 'themes', '*.json')
    themes = [{'name': os.path.splitext(os.path.basename(theme_location))[0], 'path': theme_location}
              for theme_location in glob.glob(theme_dir)]
    return themes




  def load_theme(self, path:str) -> json:
    """
    load a themes json data
    
    Parameter:
    - path (str): file path to the desired json file
    
    Return:
    json: theme json data
    """
    try:
      with open(path, 'r') as j:
        return json.load(j)
    except FileNotFoundError:
      return {}  
    except UnicodeDecodeError:
      return {}




  def load_favorites(self) -> json:
    """
    load favorites.json data
    
    Parameters:
    None
    
    Returns:
    json: favorites.json
    """
    try:
      with open(fav_path, 'r') as j:
        return json.load(j)
    except FileNotFoundError:
      return {}  
    except UnicodeDecodeError:
      return {}
   
   
   
    
  # save favorites to file
  def save_favorites(self, favs:dict) -> None:
    """
    save given json data as favorites.json
    
    Parameters:
    - favs (json): json object from frontend
    
    Returns: 
    None
    """
    with open(fav_path, 'w') as favorites:
      favorites.write(favs) 




  # get data copied to clipboard
  def get_clipboard(self) -> str:
    """
    gets copied data from clipbaord
    
    Parameters:
    None
    
    Returns:
    None
    """
    return clipboard.paste()




  def lrcraw_exists(self, path:list) -> bool:
    """
    check if a file exists
    
    Parameters:
    path (str): file path to check
    
    Returns:
    Bool: true / false does file exist 
    """
    lrc_file_path = os.path.join(*[config['source'], *path])
    return os.path.exists(lrc_file_path)




  # subscribe to URL
  def subscribe(self, url:str) -> None:
    """
    subscribe to a provided xml feed
    
    Parameters:
    url (str): pat to xml file
    
    Returns:
    None
    """
    Podcast(url).subscribe(window)




  #  unsub podcast url
  def unsubscribe(self, url:str) -> None:
    """
    unsubscribe from a provided xml feed
    
    Parameters:
    url (str): pat to xml file
    
    Returns:
    None
    """
    Podcast(url).unsubscribe(window) 




  # get synscriptions from config.json
  def list_subscriptions(self) -> list:
    """
    returns a list of subscribed podcast urls
    
    Parameters:
    None
    
    Returns:
    list: podcast urls
    """
    return config_controler.get_key('subscriptions')
  
  
  
  
  
  # runs podcast update and sends update info to UI
  def get_podcasts(self) -> None:
    """
    scan for new episodes
    
    Parameters:
    None
    
    Returns:
    None
    """
    window.evaluate_js(f'document.querySelector("audiosync-podcasts").update();')
    length = len(config['subscriptions'])
    for ndx, url in enumerate(config['subscriptions']):
      Podcast(url).downloadNewest(window)
      window.evaluate_js(f'document.querySelector("audiosync-podcasts").update("{url}", {ndx + 1}, {length});')





  # frontend xml proxy
  def xmlProxy(self, url:str) -> dict:
    """
    xml proxy server
    
    Parameters: 
    url (str): xml path
    
    Returns: 
    dict: xml data
    """
    res = requests.get(url)
    if res.status_code != 200:
      print(f'Error getting XML data. Error code {res.status_code}')
      return
    try:
      return xmltodict.parse(res.content)
    except Exception as e:
      print(f'Error parsing XML {e}')




  def episodeExists(self, title:str, episode:dict) -> bool:
    """
    check if podcast episode exists
    
    Parameters:
    title (str):
    episode (dict):
    
    Returns:
    bool: exists true / false 
    """
    return episodeExists(title, episode)




  def downloadEpisode(self, title:str, epObj:dict, download_url:str, path:str, filename:str, xmlURL:str) -> None:

    def callback(bytes_downloaded:int, total_bytes:int, start_time:int):
      window.evaluate_js(f'document.querySelector("audiosync-podcasts").update("{xmlURL}", {bytes_downloaded}, {total_bytes}, {start_time}, "{filename}");')
    
    def image_fallback(file:str):
      cover_path = os.path.join(podcast_dir, path.replace(filename, 'cover.jpg'))
      id3Image(file, load_saved_image(cover_path))

    dlWithProgressBar(download_url, os.path.join(podcast_dir, path), callback)
    update_ID3(title, epObj, os.path.join(podcast_dir, path), None, image_fallback)




  def deleteEpisode(self, file_object) -> None:
    try:
      os.remove(os.path.join(config['podcast_folder'], file_object['path']))
    except Exception as e:
      print(e)




  def path_exists(self, path) -> bool:
    return os.path.exists(path)




  def folder_select(self, path) -> str:
    return select_folder(initial_dir=path)
  
  
  
  
  def set_source(self) -> str:
    global sync_file
    sync_file = set_source()
    return sync_file



  def remove_source(self) -> str:
    global sync_file
    sync_file = ''
    return sync_file


# run the application
if __name__ == '__main__':
  main()