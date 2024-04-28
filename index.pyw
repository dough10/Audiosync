import os
import json
import webview
from process_files import run_sync, sync_file, config, save_config, create_lib_json
from Podcast import Podcast


window = False
file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
html_path = os.path.join(script_folder, 'build_sync', 'build_sync.html')


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
   
  #  get synscriptions from config.json
  def list_subscriptions(self):
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

# run the application
if __name__ == '__main__':
  window = webview.create_window('sync.json Creator', frameless=False, html=open(html_path).read(), js_api=Api(), resizable=False, height=800, width=550, background_color='#d6d6d6')  
  webview.start(debug=config['debug'])