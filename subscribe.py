import sys
from listCron import listCron
from Podcast import Podcast

try:
  url = input('XML feed URL ? = ').strip()
  if url in listCron():
    print('already subscribed to URL')
    sys.exit()
  Podcast(url).subscribe()
except KeyboardInterrupt:
  pass