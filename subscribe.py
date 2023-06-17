import sys
from listCron import listCron
from Podcast import Podcast

try:
  try:
    url = sys.argv[1]
  except IndexError:
    url = input('XML feed URL ? = ').strip()
  if url in listCron():
    print('already subscribed to URL')
    sys.exit()
  Podcast(url).subscribe()
except KeyboardInterrupt:
  pass