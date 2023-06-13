import os
import re
from Podcast import Podcast

def deleteFiles():
  choice = input('Remove all downloaded files? y or n ').strip()
  if choice == 'y':
    return True
  if choice == 'n':
    return False
  else:
    print('invalid option')
    deleteFiles()
    return

cron = os.popen('crontab -l').read()
urls = re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', cron)
count = 0
print('what Podcast url to unsubscribe from? ')
for url in urls:
  count = count + 1
  print(f'{count} {url}')
unsubURL = int(input(f'Enter Choice 1 - {count} '))
if unsubURL > 0 and unsubURL < count +1:
  Podcast(urls[unsubURL - 1]).unsubscribe(deleteFiles())
else:
  print('Invalid input closing')
  exit()


