import json
import os

def remove_string_from_list(input_list:list, string_to_remove:str):
  """
  find and remove string from list of strings
  
  Parameters:
  input_list (list): list containing strings
  string_to_remove (str): string needing to be removed
  
  Returns:
  list: list without input string
  """
  return [x for x in input_list if x != string_to_remove]





class Config:
  
  def __init__(self) -> None:
    """
    Create a config object reads data from config.json
    
    Parameters:
    None
    
    Returns:
    None
    """
    file_path = os.path.abspath(__file__)
    script_folder = os.path.dirname(file_path)
    self.config_path_ = os.path.join(script_folder, '..', 'config.json')
    self.reload()


  def get(self) -> dict:
    """
    Returns data from config.json
    
    Parameters:
    None
    
    Returns:
    dict: config.json data
    """
    return self.reload()



  
  def get_key(self, key:str) -> any:
    """
    returns value of a given key
    
    Parameters:
    key (str): key of data requested
    
    Returns:
    Any: value
    """
    self.reload()
    if key in self.config_:
      return self.config_[key]
    else:
      return None
 

    

    
  def update(self, frontend_config:dict) -> dict:
    """
    update config with data from HTML
    
    Parameters:
    frontend_config (dict): object from HTML
    
    Returns:
    dict: updated config data
    
    """
    for key, value in frontend_config.items():
      self.config_[key] = value
    return self.save_()
  




  def reload(self) -> dict:
    """
    reload config data
    
    Parameters:
    None
    
    Returns:
    dict: config.json data
    """
    try:
      with open(self.config_path_, 'r') as j:
        self.config_ = json.load(j)
      return self.config_
    except FileNotFoundError:
      print(f"Error: The file at {self.config_path_} was not found.")
      exit()
    except json.JSONDecodeError:
      print(f"Error: The file at {self.config_path_} is not a valid JSON file.")
      exit()
    except Exception as e:
      print(f"An unexpected error occurred: {e}")
      exit()





  def save_(self) -> dict:
    """
    save changes for config.json file
    
    Parameters:
    None
    
    Returns:
    dict: updated data
    """
    with open(self.config_path_, 'w') as file:
      file.write(json.dumps(self.config_, indent=2))
    return self.reload()




  def subscribe(self, url:str) -> dict:
    """
    add podcast url from subscriptions
    
    Parameters: 
    url (str): podcast url
    
    Returns:
    dict: updated data
    """
    self.config_['subscriptions'].append(url)
    return self.save_()




  def unsubscribe(self, url:str) -> dict:
    """
    remove podcast url from subscriptions
    
    Parameters: 
    url (str): podcast url
    
    Returns:
    dict: updated data
    """
    if (url in self.config_['subscriptions']):
      self.config_['subscriptions'] = remove_string_from_list(self.config_['subscriptions'], url)
    return self.save_()