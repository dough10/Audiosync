# audiosync V:1.0.0
A python application with HTML GUI for writing a SD Card for use in a Digital Audio Player.

- writes files to sdcard (audio files, cover iamges, playlists)
- play audio files
- creates playlist (.cue, .m3u8) for each album transfered
- generate a playlist of files with a modified date newer then a month old
- podcast downloading, deleting, subscribing
- generates radio.txt from MrNaturalAZ's file posted to head-fi forum
- working on getting .lrc file generation for song lyrics 

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
- mocha: ^10.4.0
