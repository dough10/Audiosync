import os
import sys
import pygame
# import time
# import datetime
from Podcast import question

working_dir = 'z:\\Music\\Unsorted\\Other\\Boombox\\Downriverelectric\\'


def play_audio(file_path):
  pygame.init()
  pygame.mixer.init()
  pygame.mixer.music.load(file_path)
  pygame.mixer.music.play()


def get_current_play_time():
  return milliseconds_to_hh_mm_ss(pygame.mixer.music.get_pos())


def milliseconds_to_hh_mm_ss(milliseconds):
  # Convert milliseconds to seconds
  total_seconds = milliseconds // 1000
  # Calculate hours, minutes, and seconds
  minutes = total_seconds // 60
  seconds = total_seconds % 60
  # Format the time as [hh:mm:ss]
  formatted_time = '[{:02d}:{:02d}:00]'.format(minutes, seconds)
  return formatted_time


def blank_file(lrc_path):
  os.remove(lrc_path)
  with open(lrc_path.replace('lrc-raw', 'lrc'), 'w') as output:
    output.write(f'Created by {os.path.basename(__file__)}\nhttps://github.com/dough10\n')


def go(audio_path, lrc_path):
  new = []
  try:
    lyrics = open(lrc_path).read().split('\n')
  except Exception as e:
    blank_file(lrc_path)
    sys.exit()

  for line in lyrics:
    print(line)
  a = audio_path.split('\\')
  if not question(f'is this the correct lyrics for {a[len(a) - 1]}? '):
    blank_file(lrc_path)
    return

  try:
    play_audio(f'{audio_path}.mp3')
  except:
    play_audio(f'{audio_path}.flac')

  ndx = 0
  while True:
    try:
      print(f'\n{lyrics[ndx]}\n')
    except:
      print('end of .lrc file')
      break
    user_input = input("Press enter timestamp 's' to skip line, 'r' to retry the line, or 'q' to quit: ")
    if user_input == '':
      current_time = get_current_play_time()
      new.append(f'{current_time}{lyrics[ndx]}')
      print(f"Current play time: {current_time}")
      ndx += 1
    elif user_input == 's':
      ndx += 1
    elif user_input == 'r':
      if len(new) > 1:
        new.pop()
        ndx -= 1
    elif user_input == 'q':
      sys.exit()
    else:
      pass

  # the end
  pygame.quit()

  if question('Save lyrics? '):
    with open(lrc_path.replace('lrc-raw', 'lrc'), 'w') as output:      
      output.write(f'Created by {os.path.basename(__file__)}\nhttps://github.com/dough10\n')
      for line in new:
        output.write(f'{line}\n')
    os.remove(lrc_path)


def file_select(folder):
  for root, dirs, files in os.walk(folder):
    for file in files:
      if file.lower().endswith('.lrc-raw'):
        path = os.path.join(root, file)
        if question(f'{path}? '):
          return path
      
  return False

if __name__ == "__main__":
  file = file_select(working_dir)
  if not file:
    print('No raw lrc files to fix')
    sys.exit()
  go(os.path.splitext(file)[0], file)