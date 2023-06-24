import os
import sys
from art import *
from Podcast import Podcast, listCronjobs

os.system('clear')
tprint("Podcast.py",font="italic")
try:
  url = sys.argv[1]
except IndexError:
  try:
    url = input('XML feed URL ? = ')
  except KeyboardInterrupt:
    sys.exit()
if url.strip() in listCronjobs():
  print(f'already subscribed to {url}')
  sys.exit()
Podcast(url).subscribe()
