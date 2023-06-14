from Podcast import Podcast

try:
  Podcast(input('XML feed URL ? = ')).subscribe()
except KeyboardInterrupt:
  pass