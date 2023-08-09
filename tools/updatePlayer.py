import os
import sys
from get_volumes import volumes
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.append(parent_dir)
from Podcast import updatePlayer

updatePlayer(volumes('Do you want to write podcasts to'))