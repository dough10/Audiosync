# audiosync V:1.0.0
A python application with a HTML GUI created for writing an sd card or USB drive of audio files for playback in a Digital audio player or car entertainment system.

- writes files to desired destination (audio files, cover images, playlist files)
- play audio files
- option to convert flac or m4a file to mp3 to ensure playback on devices with limited file type support
- option to create playlist (.cue for mp3 .m3u8 for flac) for each album transfered also generates a playlist listing any files with a modified date newer then a month old (new_files.m3u8)
- podcast support: downloading, subscribing and listening
- option to generate a radio.txt file for the "custom radio" feature on hiby players
- WIP option .lrc file generation for song lyrics 

## JSDocs Documentation

- [make-docs-doc.md](make-docs-doc.md)
  - [html/js/audiosync-player/audiosync-player-doc.md](html/js/audiosync-player/audiosync-player-doc.md)
  - [html/js/audiosync-podcasts/audiosync-podcasts-doc.md](html/js/audiosync-podcasts/audiosync-podcasts-doc.md)
  - [html/js/audiosync-dialog/audiosync-dialog-doc.md](html/js/audiosync-dialog/audiosync-dialog-doc.md)
  - [html/js/helpers-doc.md](html/js/helpers-doc.md)


## NPM Dependencies

No NPM Dependencies

## NPM Dev Dependencies

- @babel/core: ^7.24.7
- @babel/preset-env: ^7.24.7
- @babel/register: ^7.24.6
- @esm-bundle/chai: ^4.3.4-fix.0
- @open-wc/testing: ^2.5.33
- @web/test-runner: ^0.18.2
- @web/test-runner-chrome: ^0.16.0
- @web/test-runner-mocha: ^0.9.0
- @web/test-runner-playwright: ^0.11.0
- jsdoc-to-markdown: ^8.0.1
- jshint: ^2.13.6
- mocha: ^10.4.0
