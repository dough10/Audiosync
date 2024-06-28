import requests
from tqdm import tqdm

import os

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)

txt_src = 'https://masturbatorium.com/hibyradio.txt'

def fetch_text_file(url, encoding='utf-8'):
  try:
    response = requests.get(url, timeout=3)
    response.raise_for_status()
    response.encoding = encoding
    text_content = response.text
    return text_content
  except requests.RequestException as e:
    print(f"An error occurred: {e}")
    return None

def is_live_stream(url):
  try:
    response = requests.head(url, timeout=3)
    return response.status_code == 200
  except requests.exceptions.RequestException:
    return False

def save_txt(location, data):
  with open(os.path.join(location, 'radio.txt'), 'w') as txt:
    for station in data:
      try:
        txt.write(f'{station['title']}, {station['url']}\n')
      except KeyError:
        txt.write(f'{station['comment']}\n')


def main(location:str, window:dict):
  data = []
  lines = fetch_text_file(txt_src).split('\n')

  length = len(lines)

  for ndx, line in enumerate(tqdm(lines, desc ='Creating radio.txt', unit='stream')):
    streams = line.split(',')
    try:
      title = streams[0].strip()
      url = streams[1].strip()
      if is_live_stream(url):
        obj = {'title': title, 'url': url}
        data.append(obj)

    except IndexError:
      # check empty string
      if streams[0]:
        obj = {'comment': streams[0]}
        data.append(obj)

    if window:
      window.evaluate_js(f'document.querySelector("sync-ui").updateBar("#radio-bar", {ndx}, {length});')

  save_txt(location, data)
  
if __name__ == "__main__":
  main(script_folder, False)