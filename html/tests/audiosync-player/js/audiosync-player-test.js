import {qs, ce} from '../../../js/helpers.js';

const playlist = {
  "title": "A Saucerful of Secrets",
  "folder": "/Other/Pink Floyd/A Saucerful of Secrets",
  "tracks": [
    "2-01 Let There Be More Light.mp3",
    "2-02 Remember A Day.mp3",
    "2-03 Set The Controls For The Heart.mp3",
    "2-04 Corporal Clegg.mp3",
    "2-06 See Saw.mp3",
    "2-07 Jugband Blues.mp3",
    "2-05 A Saucerful Of Secrets.mp3"
  ]
}

const player = ce('audiosync-player');
qs('body').appendChild(player);
player.addPlaylist(playlist);