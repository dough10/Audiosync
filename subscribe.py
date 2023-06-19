import sys
from art import *
from Podcast import Podcast, listCronjobs

try:
  tprint("Podcast.py",font="italic")
  try:
    url = sys.argv[1]
  except IndexError:
    url = input('XML feed URL ? = ')
  if url.strip() in listCronjobs():
    print(f'already subscribed to {url}')
    sys.exit()
  Podcast(url).subscribe()
except KeyboardInterrupt:
  pass