import requests

import os
import json

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)

txt_src = 'https://masturbatorium.com/hibyradio.txt'


def save(location, data):
  with open(os.path.join(location, 'radio.json'), 'w') as txt:
    txt.write(json.dumps(data, indent=2))


def is_live_stream(url):
  try:
    response = requests.head(url, timeout=3)
    return response.status_code == 200, response.headers.get('icy-genre'), response.headers.get('icy-description')
  except requests.exceptions.RequestException:
    return False


def fetch_text_file(url:str, encoding:str='utf-8'):
  try:
    response = requests.get(url, timeout=3)
    response.raise_for_status()
    response.encoding = encoding
    text_content = response.text
    return text_content
  except requests.RequestException as e:
    print(f"An error occurred: {e}")
    return None
  
  
def main(path):
  data = []
  text = fetch_text_file(txt_src)
  lines = text.split('\n')
  
  for line in lines:
    split_line = line.split(',')
    try:
      name, url = [*split_line]
      status, genre, description = is_live_stream(url.strip())
      data.append({
        'name': description if description else name.strip(),
        'url': url.strip(),
        'genre': genre,
        'online': status
      })
    except:
      pass
    
  save(path, data)
    
    
if __name__ == "__main__":
  main(os.path.join(script_folder, '..'))