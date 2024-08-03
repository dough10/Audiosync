# audiosync V:1.0.0
A python application with a HTML GUI created for writing an sd card or USB drive of audio files for playback in a Digital audio player or car entertainment system.

- play audio files
- writes files to desired destination (audio files, cover images, playlist files)
- option to convert flac or m4a file to mp3 to ensure playback on devices with limited file type support
- option to create playlist (.cue for mp3 .m3u8 for flac) for each album transfered also generates a playlist listing any files with a modified date newer then a month old (new_files.m3u8)
- podcast support: downloading, subscribing and listening
- any file that Audiosync wasn't able to import to library will be listed in the "output/need_attention.txt" file with file path and a reason it was rejected
- logs file transfers to "output/log.txt" 

things I would like to add
- custom playlists

Things to note 

- Audiosync is opioniated about how files should be organized when copying. folder structur is root/album artist/album title/files this is not changable
- folder structure comes from file metadata. artist folder is the "album artist" value. the album folder is the "album title" value
if you want multi disc albums in 1 folder just set their disc number in metadata and all the same album name. if you want seperate albums entrys / folders per disc name albums "album title (disc 1)"
- Audiosync currently only supports mp3, m4a and flac (those are the only file types I have)
- Audiosync currently only sorts music libraby by artist alphabeticlly then album alphabeticlly then tracks by disc then track numbers
- Audiosync creates a "thumb.webp" in the music source directory for each album used to the album grid view
I could have just used the the "cover.jpg" and maybe been fine but i thought the cost of 1kb per album worth the faster load
- Audiosync uses art named "cover.jgp" it will rename folder.jpg, front.jpg and Cover.jpg to "cover.jpg"
- Audiosync will limits art size to 1000x1000 and will resize any cover.jpg larger then that size.

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
