import os
import json
import webview
import glob
import threading
import http.server
import socketserver
import requests
import xmltodict
import clipboard
from process_files import run_sync, sync_file, create_lib_json
from Podcast import Podcast, episodeExists
import urllib.parse

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
config_path = os.path.join(script_folder, 'config.json')
with open(config_path, 'r') as j:
  config = json.load(j)

port = 8080

window = False
file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
html_path = os.path.join(script_folder, 'html')

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
    host, port = self.client_address[:2]
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
    httpd.max_threads = 8
    httpd.serve_forever()
  
# save config file
def save_config():
  with open(config_path, 'w') as file:
    file.write(json.dumps(config, indent=2))

# reload config file
def reload_config():
  global config
  with open(config_path, 'r') as j:
    config = json.load(j) 


class Api:
  def __init__(self):
    pass

  # get config.json data
  def get_config(self):
    return config

  #  get lib_data.json data
  def lib_data(self):
    try:
      file = open(os.path.join(script_folder, 'lib_data.json'))
      return json.load(file)
    except FileNotFoundError:
      return {}
    except UnicodeDecodeError:
      return {}

  #  get sync.json data
  def sync_file(self):
    try:
      file = open(sync_file)
      return json.load(file)
    except FileNotFoundError:
      return {}  

  # save sync.json data to file
  def save(self, data):
    with open(sync_file, 'w') as lib:
      lib.write(data)

  # run file sync
  def run_sync(self):
    run_sync(window)

  # write config.json data to file
  def update_config(self, frontend_config):
    global config
    for key, value in frontend_config.items():
      if key in config:
        config[key] = value
    save_config()
    return config

  # exit application
  def close(self):
    window.destroy()

  def get_themes(self):
    themes = []
    for theme_location in glob.glob(os.path.join(script_folder, 'themes', '*.json')):
      name = os.path.splitext(os.path.basename(theme_location))[0]
      themes.append({'name':name,'path':theme_location})
    return themes

  def load_theme(self, path):
    try:
      with open(path, 'r') as j:
        return json.load(j)
    except:
      return {}

  def load_favorites(self):
    try:
      with open(os.path.join(script_folder, 'favorites.json'), 'r') as j:
        return json.load(j)
    except FileNotFoundError:
      return {}
    
  # save favorites to file
  def save_favorites(self, favs):
    with open(os.path.join(script_folder, 'favorites.json'), 'w') as fav_file:
      fav_file.write(favs) 

  # get data copied to clipboard
  def get_clipboard(self):
    return clipboard.paste()

  # subscribe to URL
  def subscribe(self, url):
    Podcast(url).subscribe(window)

  #  unsub podcast url
  def unsubscribe(self, url):
    Podcast(url).unsubscribe(window) 

  # get synscriptions from config.json
  def list_subscriptions(self):
    reload_config()
    return config['subscriptions']

  # runs podcast update and sends update info to UI
  def get_podcasts(self):
    window.evaluate_js(f'document.querySelector("audiosync-podcasts").update();')
    length = len(config['subscriptions'])
    for ndx, url in enumerate(config['subscriptions']):
      Podcast(url).downloadNewest(window)
      window.evaluate_js(f'document.querySelector("audiosync-podcasts").update("{url}", {ndx + 1}, {length});')

  # creates lib_data.json by scanning file library
  def create_json(self):
    create_lib_json(window)

  # frontend xml proxy
  def xmlProxy(self, url):
    res = requests.get(url)
    if res.status_code != 200:
      print(f'Error getting XML data. Error code {res.status_code}')
      return
    try:
      return xmltodict.parse(res.content)
    except Exception as e:
      print(f'Error parsing XML {e}')

  def episodeExists(self, title, episode):
    return episodeExists(title, episode)


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

  
# run the application
if __name__ == '__main__':
  main()