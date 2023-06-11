import string

def formatFilename(s):
  valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
  filename = ''.join(c for c in s if c in valid_chars)
  filename = filename.replace(' ','.')  # no spaces in filename
  filename = filename.replace('..','.') # after removing spaces can have instances where .. is in a filename
  return filename