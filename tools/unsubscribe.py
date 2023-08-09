import os
import sys
from art import *
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(parent_dir)
from Podcast import Podcast, listCronjobs


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