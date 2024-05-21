import os
import json
import webview
import threading
import http.server
import socketserver
import requests
import xmltodict
import clipboard
from process_files import run_sync, sync_file, create_lib_json
from Podcast import Podcast


file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
config_path = os.path.join(script_folder, 'config.json')
with open(config_path, 'r') as j:
  config = json.load(j)


window = False
file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
html_path = os.path.join(script_folder, 'html')

class HTMLHandler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=html_path, **kwargs)

class MusicHandler(http.server.SimpleHTTPRequestHandler):
  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=config['source'], **kwargs)

# run http server

def run_server():
  with socketserver.TCPServer(("localhost", 8000), HTMLHandler) as httpd:
    print("Serving HTML at port 8000")
    httpd.serve_forever()

def music_server():
  with socketserver.TCPServer(("localhost", 8080), MusicHandler) as httpd:
    print("Serving Music at port 8080")
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

  # exit application
  def close(self):
    if window:
      window.destroy()
   
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

# run the application
if __name__ == '__main__':
  # run UI server
  server_thread = threading.Thread(target=run_server)
  server_thread.daemon = True
  server_thread.start()
  
  # run music server
  music_server_thread = threading.Thread(target=music_server)
  music_server_thread.daemon = True
  music_server_thread.start()

  import time
  time.sleep(2)  

  # load UI
  window = webview.create_window('sync.json Creator', frameless=False, url='http://localhost:8000/index.html', js_api=Api(), resizable=False, height=800, width=550, background_color='#d6d6d6')  
  webview.start(debug=config['debug'])