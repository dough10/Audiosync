<a name="AudioPlayer"></a>

## AudioPlayer ⇐ <code>HTMLElement</code>
UI for managing playback of audio files

**Kind**: global class  
**Extends**: <code>HTMLElement</code>  
**Emits**: <code>event:now-playing</code>, <code>event:image-loaded</code>, <code>event:playlist-reset</code>  
**this**: [<code>AudioPlayer</code>](#AudioPlayer)  

* [AudioPlayer](#AudioPlayer) ⇐ <code>HTMLElement</code>
    * [.playAlbum(playObj, [ndx])](#AudioPlayer+playAlbum) ⇒ <code>void</code>
    * [.playNdx(ndx)](#AudioPlayer+playNdx) ⇒ <code>void</code>
    * [.addToPlaylist(albumInfo)](#AudioPlayer+addToPlaylist) ⇒ <code>void</code>
    * [.favorite(data)](#AudioPlayer+favorite) ⇒ <code>void</code>
    * [.minimize()](#AudioPlayer+minimize) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.fullScreen()](#AudioPlayer+fullScreen) ⇒ <code>void</code>

<a name="AudioPlayer+playAlbum"></a>

### audioPlayer.playAlbum(playObj, [ndx]) ⇒ <code>void</code>
play the given album with option to pass an index of desired starting point

**Kind**: instance method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Emits**: <code>event:playlist-reset</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| playObj | <code>Object</code> | album or podcast object |
| playObj.artist | <code>String</code> | artist name |
| playObj.title | <code>String</code> | album / podcast title |
| playObj.tracks | <code>Array</code> | list of tracks / podcast episodes |
| [ndx] | <code>Number</code> | track index to begin playing |

<a name="AudioPlayer+playNdx"></a>

### audioPlayer.playNdx(ndx) ⇒ <code>void</code>
play a specific playlist index number

**Kind**: instance method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Access**: public  

| Param | Type |
| --- | --- |
| ndx | <code>Number</code> | 

<a name="AudioPlayer+addToPlaylist"></a>

### audioPlayer.addToPlaylist(albumInfo) ⇒ <code>void</code>
add an albums tracks to the playlist

**Kind**: instance method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| albumInfo | <code>Object</code> |  |
| albumInfo.artist | <code>String</code> | artist name |
| albumInfo.title | <code>String</code> | album / podcast title |
| albumInfo.tracks | <code>Array</code> | list of tracks / podcast episodes |

<a name="AudioPlayer+favorite"></a>

### audioPlayer.favorite(data) ⇒ <code>void</code>
callback for <music-library> favorite added event

**Kind**: instance method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Access**: public  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

<a name="AudioPlayer+minimize"></a>

### audioPlayer.minimize() ⇒ <code>Promise.&lt;void&gt;</code>
minimize fullscreen Ui and display header buttons

**Kind**: instance method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Access**: public  
<a name="AudioPlayer+fullScreen"></a>

### audioPlayer.fullScreen() ⇒ <code>void</code>
creates & opens fullscreen ui with album art and gradient background

**Kind**: instance method of [<code>AudioPlayer</code>](#AudioPlayer)  
**Access**: public  
