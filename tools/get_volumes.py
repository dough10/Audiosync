

import os
import sys
import json
import socket
from art import tprint
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(parent_dir)
from Podcast import question

with open(os.path.join(parent_dir, 'config.json'), 'r') as j:
  config = json.load(j)

hostname = socket.gethostname().replace(".local", "").replace("-", " ")

def getVolumes():
  excluded = [
    'com.apple.TimeMachine.localsnapshots',
    f'Backups of {hostname}',
    'Recovery',
    'Macintosh HD',
    '.timemachine'
  ]
  return [volume for volume in os.listdir('/Volumes') if volume not in excluded and os.path.join('/Volumes', volume) not in config['folder']]


def volumes(q):
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
      if question(f'Is {path} the correct location? (yes/no) ') and question(f'{q} {path}? (yes/no) '):
        print()
        return path
    else:
      print('Invalid input')
  except KeyboardInterrupt:
    print('Closed by user')


if __name__ == "__main__":
  print(volumes('this will output the pathselected to the command line'))