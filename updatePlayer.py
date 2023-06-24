from Podcast import *
from art import *
import os
from config import folder
volumes = os.listdir('/Volumes')
os.system('clear')
tprint("Podcast.py",font="italic")
print('Choose a drive')
print('0.) Exit')
count = 0
for dir in volumes:
  if not dir == 'Macintosh HD' and not dir == 'Recovery' and not dir == '.timemachine' and f'/Volumes/{dir}' not in folder: 
    count = count + 1
    print(f'{count}.) {dir}')
if count == 0:
  print('No drive present')
  sys.exit()
try:
  choice = int(input(f'Enter choice: (0-{count})'))
except ValueError:
  print('Input must be a Number')
  sys.exit()
except KeyboardInterrupt:
  print('Closed by user')
if choice == 0:
  sys.exit()
elif choice > 0 and choice <= len(volumes):
  vol = volumes[choice - 1]
  if question(f'is /Volumes/{vol} the correct Drive? (y/n) ') and question(f'you want to write all new podcast to /Volumes/{vol}/Podcasts (y/n) '):
    updatePlayer(f'/Volumes/{vol}')
else:
  print('Invalid input')
