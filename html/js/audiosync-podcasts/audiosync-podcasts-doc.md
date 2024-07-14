<a name="AudioSyncPodcasts"></a>

## AudioSyncPodcasts ⇐ <code>HTMLElement</code>
Ui for managing podcast shows and episodes

**Kind**: global class  
**Extends**: <code>HTMLElement</code>  
**this**: [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

* [AudioSyncPodcasts](#AudioSyncPodcasts) ⇐ <code>HTMLElement</code>
    * [new AudioSyncPodcasts()](#new_AudioSyncPodcasts_new)
    * [.resetPlaylist()](#AudioSyncPodcasts+resetPlaylist) ⇒ <code>Void</code>
    * [.openAddPodcastDialog()](#AudioSyncPodcasts+openAddPodcastDialog) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [.subResponse(message)](#AudioSyncPodcasts+subResponse) ⇒ <code>Void</code>
    * [.listPodcasts()](#AudioSyncPodcasts+listPodcasts) ⇒ <code>Promise.&lt;(Array\|Objects)&gt;</code>
    * [.nowPlaying(details)](#AudioSyncPodcasts+nowPlaying) ⇒ <code>void</code>
    * [.update(name, bytes, totalBytes, startTime, filname)](#AudioSyncPodcasts+update) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_AudioSyncPodcasts_new"></a>

### new AudioSyncPodcasts()
create the podcast ui instance

**Example**  
```js
const podcastLibrary = document.createElement('audiosync-podcasts');
```
<a name="AudioSyncPodcasts+resetPlaylist"></a>

### audioSyncPodcasts.resetPlaylist() ⇒ <code>Void</code>
audioplayer has reset playlist. (unmarks elements marked with 'inlist') Used in audiosync-player.playAlbum()

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Access**: public  
**Example**  
```js
podcastLibrary.resetPlaylist();
```
<a name="AudioSyncPodcasts+openAddPodcastDialog"></a>

### audioSyncPodcasts.openAddPodcastDialog() ⇒ <code>Promise.&lt;Void&gt;</code>
creates and opens a dislog with options to add a urlUsed in <audiosync-podcasts>

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Access**: public  
**Example**  
```js
button.onClick(_ => poscastLibrary.openAddPodcastDialog());
```
<a name="AudioSyncPodcasts+subResponse"></a>

### audioSyncPodcasts.subResponse(message) ⇒ <code>Void</code>
responds to subscription input. refreshes podcast ui data and closes add url dialog

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Access**: public  

| Param | Type |
| --- | --- |
| message | <code>String</code> | 

**Example**  
```js
podcastLibrary.subResponse('Podcast Added');
```
<a name="AudioSyncPodcasts+listPodcasts"></a>

### audioSyncPodcasts.listPodcasts() ⇒ <code>Promise.&lt;(Array\|Objects)&gt;</code>
get list of podcasts and fills UI with data

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Access**: public  
**Example**  
```js
podcastLibrary.listPodcasts();
```
<a name="AudioSyncPodcasts+nowPlaying"></a>

### audioSyncPodcasts.nowPlaying(details) ⇒ <code>void</code>
syncs ui with currently playing audio

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Access**: public  

| Param | Type |
| --- | --- |
| details | <code>Object</code> | 
| details.art | <code>String</code> | 
| details.path | <code>String</code> | 
| details.album | <code>String</code> | 
| details.artist | <code>String</code> | 
| details.title | <code>String</code> | 
| details.track | <code>Number</code> | 
| details.disc | <code>Number</code> | 

**Example**  
```js
pocastLibrary.nowPlaying({  "art" : "Other\\Beastie Boys\\Hello Nasty_ Remastered (Disc 2)\\cover.jpg"  "path": "Other\\Beastie Boys\\Hello Nasty_ Remastered (Disc 2)\\09 Stink Bug.mp3",  "album": "Hello Nasty Remastered (Disc 2)",  "artist": "The Beastie Boys",  "title": "Stink Bug",  "track": 9,  "disc": 2});
```
<a name="AudioSyncPodcasts+update"></a>

### audioSyncPodcasts.update(name, bytes, totalBytes, startTime, filname) ⇒ <code>Promise.&lt;void&gt;</code>
update UI with podcast download and update progress

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Access**: public  

| Param | Type |
| --- | --- |
| name | <code>String</code> | 
| bytes | <code>Number</code> | 
| totalBytes | <code>Number</code> | 
| startTime | <code>Number</code> | 
| filname | <code>String</code> | 

**Example**  
```js
podcastLibrary.update('https://example.com/rssfeed.xml', 1000, 345890, 1719235139547, 'cool.podcast.mp3');
```
