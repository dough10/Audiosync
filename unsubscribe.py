import os
url = input('URL of the podcast to unsubscribe = ')
os.system(f'crontab -l | grep -v "{url}" | crontab -')