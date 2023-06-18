import sys
from Podcast import Podcast, listCronjobs

try:
  try:
    url = sys.argv[1]
  except IndexError:
    url = input('XML feed URL ? = ')
  if url.strip() in listCronjobs():
    print('already subscribed to URL')
    sys.exit()
  Podcast(url).subscribe()
except KeyboardInterrupt:
  pass