import os
import re
import sys
from Podcast import Podcast

def deleteFiles():
  choice = input('Remove all downloaded files? y or n? ').strip()
  if choice == 'y':
    return True
  elif choice == 'n':
    return False
  else:
    print('invalid option')
    return deleteFiles()
try:
  urls = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', os.popen('crontab -l').read())
  count = 0
  print('Choose a URL to unsubscribe from')
  for url in urls:
    count = count + 1
    print(f'{count}.) {url}')
  unsubURL = int(input(f'Enter Choice: 1 - {count} '))
  if unsubURL > 0 and unsubURL < count:
    Podcast(urls[unsubURL - 1]).unsubscribe(deleteFiles())
  else:
    print('Invalid input closing')
    sys.exit()
except KeyboardInterrupt:
  pass

