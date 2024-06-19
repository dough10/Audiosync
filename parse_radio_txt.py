import requests

txt_src = 'https://masturbatorium.com/hibyradio.txt'

def fetch_text_file(url, encoding='utf-8'):
  try:
    response = requests.get(url, timeout=10)
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

def save_txt(data):
  with open('radio.txt', 'w') as txt:
    for station in data:
      try:
        txt.write(f'{station['title']}, {station['url']}\n')
      except KeyError:
        txt.write(f'{station['comment']}\n')


def main():
  data = []
  lines = fetch_text_file(txt_src).split('\n')
  for line in lines:
    streams = line.split(',')
    try:
      title = streams[0].strip()
      url = streams[1].strip()
      if is_live_stream(url):
        print(f'{url} online')
        obj = {'title': title, 'url': url}
        data.append(obj)
      else: 
        print(f'{url} offline')
    except IndexError:
      # check empty string
      if streams[0]:
        obj = {'comment': streams[0]}
        data.append(obj)

  save_txt(data)
  
if __name__ == "__main__":
  main()