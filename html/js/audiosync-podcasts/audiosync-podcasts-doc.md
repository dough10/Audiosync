<a name="AudioSyncPodcasts"></a>

## AudioSyncPodcasts ⇐ <code>HTMLElement</code>
displays podcast show info

**Kind**: global class  
**Extends**: <code>HTMLElement</code>  

* [AudioSyncPodcasts](#AudioSyncPodcasts) ⇐ <code>HTMLElement</code>
    * [new AudioSyncPodcasts()](#new_AudioSyncPodcasts_new)
    * [.container](#AudioSyncPodcasts+container) : <code>HTMLElement</code>
    * [.connectedCallback()](#AudioSyncPodcasts+connectedCallback) ⇒ <code>Void</code>
    * [.resetPlaylist()](#AudioSyncPodcasts+resetPlaylist) ⇒ <code>Void</code>
    * [.openAddPodcastDialog()](#AudioSyncPodcasts+openAddPodcastDialog) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [.subResponse(message)](#AudioSyncPodcasts+subResponse) ⇒ <code>Void</code>
    * [.listPodcasts()](#AudioSyncPodcasts+listPodcasts) ⇒ <code>Promise.&lt;(Array\|Objects)&gt;</code>
    * [.nowPlaying(details)](#AudioSyncPodcasts+nowPlaying) ⇒ <code>void</code>
    * [.update(name, bytes, totalBytes, startTime, filname)](#AudioSyncPodcasts+update) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._addPodcastUI()](#AudioSyncPodcasts+_addPodcastUI) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [._close(e)](#AudioSyncPodcasts+_close) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._expand(e)](#AudioSyncPodcasts+_expand) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._createUnsubDialog(PODCAST_TITLE_ELEMENT, url)](#AudioSyncPodcasts+_createUnsubDialog) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._updateEpisodeList(xmlURL, scrollEl)](#AudioSyncPodcasts+_updateEpisodeList) ⇒ <code>Void</code>
    * [._addEpisodeToPlaylist(wrapper, play_object)](#AudioSyncPodcasts+_addEpisodeToPlaylist) ⇒ <code>void</code>
    * [._downloadEpisode(title, episode, FILE_STATS, xmlURL, EPISODE_LIST, ep_wrapper, parent, unsub_button)](#AudioSyncPodcasts+_downloadEpisode) ⇒ <code>Promise.&lt;void&gt;</code>
    * [._deleteEpisode(ep_wrapper, FILE_STATS, xmlURL, scrollEl)](#AudioSyncPodcasts+_deleteEpisode) ⇒ <code>Void</code>
    * [._playEpisode(ep_wrapper, FILE_STATS, play_Object, episode)](#AudioSyncPodcasts+_playEpisode) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [._createEpisodeElement(episode, EPISODE_LIST)](#AudioSyncPodcasts+_createEpisodeElement) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [._lazyLoadOnScroll(title, episodes, scrollEl, xmlURL)](#AudioSyncPodcasts+_lazyLoadOnScroll) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [._fetchAndParseXML(url)](#AudioSyncPodcasts+_fetchAndParseXML) ⇒ <code>Promise.&lt;Void&gt;</code>

<a name="new_AudioSyncPodcasts_new"></a>

### new AudioSyncPodcasts()
create the podcast ui instance

**Example**  
```js
const podcastLibrary = document.createElement('audiosync-podcasts');
```
<a name="AudioSyncPodcasts+container"></a>

### audioSyncPodcasts.container : <code>HTMLElement</code>
container for content

**Kind**: instance property of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Example**  
```js
this.container.appendChild(elements);
```
<a name="AudioSyncPodcasts+connectedCallback"></a>

### audioSyncPodcasts.connectedCallback() ⇒ <code>Void</code>
element connect

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Example**  
```js
document.querySelector('body').appendChild(podcastLibrary);
```
<a name="AudioSyncPodcasts+resetPlaylist"></a>

### audioSyncPodcasts.resetPlaylist() ⇒ <code>Void</code>
audioplayer has reset playlist. (unmarks elements marked with 'inlist') 
Used in <audiosync-player>.playAlbum()

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Example**  
```js
podcastLibrary.resetPlaylist();
```
<a name="AudioSyncPodcasts+openAddPodcastDialog"></a>

### audioSyncPodcasts.openAddPodcastDialog() ⇒ <code>Promise.&lt;Void&gt;</code>
creates and opens a dislog with options to add a url
Used in <audiosync-podcasts>

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Example**  
```js
button.onClick(_ => audiosyncPodcasts.openAddPodcastDialog());
```
<a name="AudioSyncPodcasts+subResponse"></a>

### audioSyncPodcasts.subResponse(message) ⇒ <code>Void</code>
responds to subscription input. 
refreshes podcast ui data and closes add url dialog

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

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
**Example**  
```js
podcastLibrary.listPodcasts();
```
<a name="AudioSyncPodcasts+nowPlaying"></a>

### audioSyncPodcasts.nowPlaying(details) ⇒ <code>void</code>
syncs ui with currently playing audio

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| details | <code>Object</code> | 

**Example**  
```js
pocastLibrary.nowPlaying({
  "art" : "Other\\Beastie Boys\\Hello Nasty_ Remastered (Disc 2)\\cover.jpg"
  "path": "Other\\Beastie Boys\\Hello Nasty_ Remastered (Disc 2)\\09 Stink Bug.mp3",
  "album": "Hello Nasty Remastered (Disc 2)",
  "artist": "The Beastie Boys",
  "title": "Stink Bug",
  "track": 9,
  "disc": 2
});
```
<a name="AudioSyncPodcasts+update"></a>

### audioSyncPodcasts.update(name, bytes, totalBytes, startTime, filname) ⇒ <code>Promise.&lt;void&gt;</code>
update UI with podcast download and update progress

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

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
<a name="AudioSyncPodcasts+_addPodcastUI"></a>

### audioSyncPodcasts.\_addPodcastUI() ⇒ <code>Promise.&lt;Void&gt;</code>
creates the UI for adding podcasts to subscriptions

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  
**Example**  
```js
button.onClick(_ => this._addPodcastUI());
```
<a name="AudioSyncPodcasts+_close"></a>

### audioSyncPodcasts.\_close(e) ⇒ <code>Promise.&lt;void&gt;</code>
closes podcast wrapper hiding it's content

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 

**Example**  
```js
button.onClick(e => this._close(e));
```
<a name="AudioSyncPodcasts+_expand"></a>

### audioSyncPodcasts.\_expand(e) ⇒ <code>Promise.&lt;void&gt;</code>
Expands podcast wrapper revealing additional elements

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 

**Example**  
```js
button.onClick(e => this._expand(e));
```
<a name="AudioSyncPodcasts+_createUnsubDialog"></a>

### audioSyncPodcasts.\_createUnsubDialog(PODCAST_TITLE_ELEMENT, url) ⇒ <code>Promise.&lt;void&gt;</code>
opens a dialog with option to unsub from podcast

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| PODCAST_TITLE_ELEMENT | <code>HTMLElement</code> | 
| url | <code>String</code> | 

**Example**  
```js
button.onClick(_ => this._createUnsubDialog(<div podcast title>, 'https://example.com/rssfeed.xml'));
```
<a name="AudioSyncPodcasts+_updateEpisodeList"></a>

### audioSyncPodcasts.\_updateEpisodeList(xmlURL, scrollEl) ⇒ <code>Void</code>
clears and repopulates episode list

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| xmlURL | <code>String</code> | 
| scrollEl | <code>HTMLElement</code> | 

**Example**  
```js
this._updateEpisodeList('https://example.com/rssfeed.xml', <ui podcast list>);
```
<a name="AudioSyncPodcasts+_addEpisodeToPlaylist"></a>

### audioSyncPodcasts.\_addEpisodeToPlaylist(wrapper, play_object) ⇒ <code>void</code>
Adds an eipsode to current playlist

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| wrapper | <code>HTMLElement</code> | 
| play_object | <code>Object</code> \| <code>String</code> | 

**Example**  
```js
button.onClick(_ => this._addEpisodeToPlaylist(<podcast episode>, {}));
```
<a name="AudioSyncPodcasts+_downloadEpisode"></a>

### audioSyncPodcasts.\_downloadEpisode(title, episode, FILE_STATS, xmlURL, EPISODE_LIST, ep_wrapper, parent, unsub_button) ⇒ <code>Promise.&lt;void&gt;</code>
starts download of a podcast episode

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| title | <code>String</code> | 
| episode | <code>Object</code> | 
| FILE_STATS | <code>Object</code> \| <code>String</code> | 
| xmlURL | <code>String</code> | 
| EPISODE_LIST | <code>HTMLElement</code> | 
| ep_wrapper | <code>HTMLElement</code> | 
| parent | <code>HTMLElement</code> | 
| unsub_button | <code>HTMLElement</code> | 

**Example**  
```js
button.onClick(_ => this._downloadEpisode(
  'cool podcast',
  {path, art, title, artist},
  {exists, },
  'https://example.com/rssfeed.xml',
  <ul scroll container>,
  <li podcast episode>,
  <parent>,
  <button>
));
```
<a name="AudioSyncPodcasts+_deleteEpisode"></a>

### audioSyncPodcasts.\_deleteEpisode(ep_wrapper, FILE_STATS, xmlURL, scrollEl) ⇒ <code>Void</code>
ask backend to delete a podcast episode

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| ep_wrapper | <code>HTMLElement</code> | 
| FILE_STATS | <code>Object</code> | 
| xmlURL | <code>String</code> | 
| scrollEl | <code>HTMLElement</code> | 

<a name="AudioSyncPodcasts+_playEpisode"></a>

### audioSyncPodcasts.\_playEpisode(ep_wrapper, FILE_STATS, play_Object, episode) ⇒ <code>Promise.&lt;Void&gt;</code>
trigger episode playback

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| ep_wrapper | <code>HTMLElement</code> | 
| FILE_STATS | <code>Object</code> | 
| play_Object | <code>Object</code> | 
| episode | <code>Object</code> | 

<a name="AudioSyncPodcasts+_createEpisodeElement"></a>

### audioSyncPodcasts.\_createEpisodeElement(episode, EPISODE_LIST) ⇒ <code>Promise.&lt;Void&gt;</code>
appends a li element with podcast episode details to podcast-episodes

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| episode | <code>Object</code> | 
| EPISODE_LIST | <code>HTMLElement</code> | 

<a name="AudioSyncPodcasts+_lazyLoadOnScroll"></a>

### audioSyncPodcasts.\_lazyLoadOnScroll(title, episodes, scrollEl, xmlURL) ⇒ <code>Promise.&lt;Void&gt;</code>
progressavly loads episodes on scroll

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type |
| --- | --- |
| title | <code>String</code> | 
| episodes | <code>Array</code> | 
| scrollEl | <code>HTMLElement</code> | 
| xmlURL | <code>String</code> | 

<a name="AudioSyncPodcasts+_fetchAndParseXML"></a>

### audioSyncPodcasts.\_fetchAndParseXML(url) ⇒ <code>Promise.&lt;Void&gt;</code>
get the name of a podcast and put it in a html element

**Kind**: instance method of [<code>AudioSyncPodcasts</code>](#AudioSyncPodcasts)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | podcast url |

