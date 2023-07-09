import os
import sys
import logging
from art import *
from Podcast import Podcast, listCronjobs, validate_url

# Configure the logger
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def subscribe_to_podcast(url):
  if url.strip() in listCronjobs():
    logger.info(f'Already subscribed to {url}')
    sys.exit()
  try:
    Podcast(url).subscribe()
  except Exception as e:
    logger.error(f'Error subscribing to podcast: {str(e)}')
    sys.exit()

def get_xml_feed_url():
  try:
    url = sys.argv[1]
  except IndexError:
    url = input('Enter the XML feed URL: ')
  return url.strip()

def main():
  try:
    os.system('clear')
    tprint("Podcast.py", font="italic")
    url = get_xml_feed_url()
    if not validate_url(url):
      logger.error('Invalid XML feed URL')
      sys.exit()
    subscribe_to_podcast(url)
  except KeyboardInterrupt:
    sys.exit()

if __name__ == "__main__":
  main()
