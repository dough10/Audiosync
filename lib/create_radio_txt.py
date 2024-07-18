import requests
import os

try:
  from lib.stamp_playlist import stamp
except ModuleNotFoundError:
  from stamp_playlist import stamp
  

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)

def create_radio_txt(url, path, genres):
  response = requests.post(f'{url}/txt', json=genres)
  response.raise_for_status()
  if response.status_code == 200:
    with open(os.path.join(path, 'radio.txt'), 'w', encoding='utf-8') as txt:
      txt.write(f'# {stamp()}\n{response.text}')
      
      
if __name__ == "__main__":
  create_radio_txt('http://localhost:3000', os.path.join(script_folder, '..'), [
    "dnb"
  ])