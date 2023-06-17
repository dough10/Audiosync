import sys
from listCron import listCron
from Podcast import Podcast
from config import *
  
try:
  urls = listCron()
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

