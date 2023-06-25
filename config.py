import socket
folder = '/Volumes/Main/Music/Podcasts'
logLocation = '/Users/dough10/Downloads'
download = 'newest' # options = 'all', ,'newest', a Number < total podcast episode count i.e. 10
hostname = socket.gethostname().replace(".local", "").replace("-", " ")