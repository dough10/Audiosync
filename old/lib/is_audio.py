supported_formats = [
  '.mp3', 
  '.flac', 
  '.m4a'
]

def is_audio_file(file):
  return any(file.lower().endswith(ext) for ext in supported_formats)