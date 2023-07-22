import os
import sys
import json
import socket
from art import tprint
from Podcast import updatePlayer, question

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)
with open(os.path.join(script_folder, 'config.json'), 'r') as jason:
  config = json.load(jason)

folder = config['folder']
download = config['download']
logLocation = config['logLocation']

hostname = socket.gethostname().replace(".local", "").replace("-", " ")

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

def main():
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
      path = os.path.join('/Volumes', volumes[choice - 1])
      if question(f'Is {path} the correct location? (yes/no) ') and question(f'Do you want to write podcasts to {path}/Podcasts? (yes/no) '):
        updatePlayer(path)
    else:
      print('Invalid input')
  except KeyboardInterrupt:
    print('Closed by user')

if __name__ == "__main__":
    main()