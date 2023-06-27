from Podcast import *
from art import *
import os
from config import folder, hostname

def getVolumes():
  volumes = []
  for dir in os.listdir('/Volumes') :
    timemachine = dir == 'com.apple.TimeMachine.localsnapshots'
    timemachinehidden = dir == '.timemachine'
    backup = dir == f'Backups of {hostname}'
    ssd = dir == 'Macintosh HD'
    recovery = dir == 'Recovery'
    if not timemachine and not backup and not ssd and not recovery and not timemachinehidden and f'/Volumes/{dir}' not in folder:
      volumes.append(dir)
  return volumes

try:
  os.system('clear')
  tprint("Podcast.py",font="italic")
  volumes = getVolumes()
  if len(volumes) == 0:
    print('No drives present')
    sys.exit()
  print('Choose a drive')
  print('0.) Exit')
  for ndx, dir in enumerate(volumes):
    print(f'{ndx + 1}.) {dir}')
  try:
    choice = int(input(f'Enter choice: (0-{len(volumes)}) '))
  except ValueError:
    print('Input must be a Number')
    sys.exit()
  if choice == 0:
    sys.exit()
  elif choice > 0 and choice <= len(volumes):
    vol = volumes[choice - 1]
    if question(f'is /Volumes/{vol} the correct Drive? (y/n) ') and question(f'you want to write all new podcast to /Volumes/{vol}/Podcasts (y/n) '):
      updatePlayer(f'/Volumes/{vol}')
  else:
    print('Invalid input')
except KeyboardInterrupt:
  print('Closed by user')