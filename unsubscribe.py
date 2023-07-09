import os
import sys
import json
from Podcast import Podcast, listCronjobs
from art import *

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.json'), 'r') as f:
  config = json.load(f)

folder = config['folder']
download = config['download']
logLocation = config['logLocation']

try:
  os.system('clear')
  urls = listCronjobs()
  tprint("Podcast.py", font="italic")
  print('Choose a URL to unsubscribe from')
  print('0.) Quit')
  for ndx, url in enumerate(urls):
    print(f'{ndx + 1}.) {url}')
  try:
    unsubURL = int(input(f'Enter Choice: (0-{len(urls)}) '))
  except ValueError:
    print('Invalid input. Number required')
    sys.exit()
  if unsubURL == 0:
    sys.exit()
  elif unsubURL > 0 and unsubURL <= len(urls):
    Podcast(urls[unsubURL - 1]).unsubscribe()
  else:
    print('Invalid input')
    sys.exit()
except KeyboardInterrupt:
  pass