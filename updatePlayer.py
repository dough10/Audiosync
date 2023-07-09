import os
import sys
from art import tprint
from config import folder, hostname
from Podcast import updatePlayer, question

def getVolumes():
  volumes = []
  for volume in os.listdir('/Volumes'):
    timemachine = volume == 'com.apple.TimeMachine.localsnapshots'
    timemachinehidden = volume == '.timemachine'
    backup = volume == f'Backups of {hostname}'
    ssd = volume == 'Macintosh HD'
    recovery = volume == 'Recovery'
    if not timemachine and not backup and not ssd and not recovery and not timemachinehidden and f'/Volumes/{volume}' not in folder:
      volumes.append(volume)
  return volumes


try:
  os.system('clear')
  tprint("Podcast.py", font="italic")
  volumes = getVolumes()
  if len(volumes) == 0:
    print('No drives present')
    sys.exit()
  print('Choose a drive')
  print('0.) Exit')
  for ndx, volume in enumerate(volumes):
    print(f'{ndx + 1}.) {volume}')
  try:
    choice = int(input(f'Enter choice: (0-{len(volumes)}) '))
  except ValueError:
    print('Input must be a number')
    sys.exit()
  if choice == 0:
    sys.exit()
  elif 0 < choice <= len(volumes):
    selected_volume = volumes[choice - 1]
    if question(f'Is /Volumes/{selected_volume} the correct drive? (yes/no) ') and question(f'Do you want to write all new podcasts to /Volumes/{selected_volume}/Podcasts? (yes/no) '):
      updatePlayer(f'/Volumes/{selected_volume}')
  else:
    print('Invalid input')
except KeyboardInterrupt:
  print('Closed by user')