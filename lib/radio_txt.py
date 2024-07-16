import json

import os

file_path = os.path.abspath(__file__)
script_folder = os.path.dirname(file_path)


def fetch_json_file(path:str) -> json:
  with open(path, 'r') as j:
    return json.load(j)




def save_txt(location:str, data:list) -> None:
  with open(os.path.join(location, 'radio.txt'), 'w') as txt:
    for station in data:
      try:
        txt.write(f'{station['name']}, {station['url']}\n')
      except KeyError:
        pass




def list_genres() -> list:
  radio_db = os.path.join(script_folder, '..', 'radio.json')
  seen = set()
  all_stations = fetch_json_file(radio_db)
  unique = [
    station['genre'] 
    for station in all_stations 
    if station['online']
    and station['genre']
    and station['genre'] not in seen 
    and not seen.add(station['genre'])
  ]
  return unique




def main(location:str, genres:list) -> None:
  radio_db = os.path.join(script_folder, '..', 'radio.json')
  all_stations = fetch_json_file(radio_db)
  data = [
    station 
    for station in all_stations 
    if station['online'] 
    and station['genre'] is not None
    and any(station['genre'] == genre for genre in genres)
  ]
  save_txt(location, data)



  
if __name__ == "__main__":
  for genre in list_genres():
    print(genre)
  # main(script_folder, ["Downtempo House Techno", "Space Electronica", "Ambient Space", 'Ambient Chill'])