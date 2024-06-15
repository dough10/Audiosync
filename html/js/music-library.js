import {
  Timer,
  Toast,
  fadeIn,
  fadeOut,
  qs,
  qsa,
  sleep,
  createRipple,
  alertUser,
  objectToCSS,
  ce,
  fillButton,
  svgIcon,
  getColorAtPoint,
  getContrastColor,
  areElementsPresent,
  indexOfElement,
  containsNumber
} from './helpers.js';

/**
 * displays the music library in a selectable form
*/
class MusicLibrary extends HTMLElement {
  static get observedAttributes() {
    return ['view'];
  }
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    this.player = qs('audiosync-player');

    this.popupHeight = 122;
    this.popupWidth = 150;

    this._makeSelection = this._makeSelection.bind(this);
    this._displayArtistList = this._displayArtistList.bind(this);
    this._openContexMenu = this._openContexMenu.bind(this)

    const CSS_OBJECT = {
      "@keyframes ripple-animation": {
        to: {
          transform: "scale(2)",
          opacity: 0
        }
      },
      '.head': {
        display:'flex',
        'flex-direction': 'row',
        'justify-content':'space-between',
        'align-items': 'center'
      },
      ".ripple-effect": {
        position: "absolute",
        "border-radius": "50%",
        background: "rgba(var(--pop-rgb), 0.4)",
        animation: "ripple-animation 0.7s linear"
      },
      "div:first-child": {
        "border-top": "none"
      },
      svg: {
        height: '24px',
        width:'24px'
      },
      '.artist-grid': {
        height: '150px',
        width: '0px',
        display: 'inline-flex'
      },
      ".artist-list": {
        position: "relative",
        "border-top": "var(--seperator-line)",
        cursor: "pointer",
        padding: "12px",
        "font-size": "17px",
        "font-weight": "bold",
        overflow: "hidden",
        transition: 'var(--button-bg-animation)'
      },
      ".artist-list:hover": {
        "background-color": "var(--hover-color)"
      },
      '.album-grid': {
        height: '200px',
        'max-width': '150px',
        'max-height': '200px',
        'text-align': 'justify',
        position: "relative",
        display: 'inline-flex',
        'flex-direction': 'column',
        overflow: 'hidden',
        'border-radius': '5px',
        margin: '8px',
        background: 'var(--main-color)',
        "box-shadow": "0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)"
      },
      '.album-grid > img': {
        'border-radius': '5px',
        "box-shadow": "0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)"
      },
      '.album-grid > *': {
        'pointer-events': 'none'
      },
      '.album-grid > div:nth-child(2)': {
        'font-weight': '500',
        'max-width': '148px',
        padding:'8px 4px 0px',
        'font-size': '16px',
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'
      },
      '.album-grid > div:nth-child(3)': {
        'max-width': '148px',
        padding:'4px',
        'font-size': '11px',
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'
      },
      '.album-grid[selected] > img': {
        opacity: 0.9
      },
      '.album-grid > svg': {
        opacity:0,
        position:'absolute',
        transition: 'opacity 150ms ease'
      },
      '.album-grid[favorite] > .fav': {
        bottom:'23px',
        right:'5px',
        opacity: 0.5
      },
      '.album-grid[favorite] > div:nth-child(2)': {
        'max-width': '120px'
      },
      '.album-grid[inlist] > .listed': {
        left: '52px',
        transform: 'translateX(-50%)',
        opacity: 0.6
      },
      '.album-grid[playing] > .playing-svg': {
        left:'77px',
        opacity: 0.6
      },
      '.album-grid[selected] > .selected': {
        left:'50%',
        top:'37%',
        height:'100px',
        width:'100px',
        color: 'green',
        transform: 'translate(-50%, -50%)',
        opacity: 1
      },
      '.album-grid[selected]:hover > .selected': {
        opacity:0.4
      },
      ".album-list": {
        position: "relative",
        "border-top": "var(--seperator-line)",
        cursor: "pointer",
        padding: "8px",
        "font-size": "13px",
        transition: 'var(--button-bg-animation)',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        overflow: 'hidden',
        'min-height': '20px'
      },
      ".album-list:hover": {
        "background-color": "var(--hover-color)"
      },
      '.album-list > *': {
        'pointer-events': 'none'
      },
      '.album-list > svg': {
        height: '12px',
        width: '12px',
        opacity: 0,
        'margin-right': '4px',
        transition: 'all 150ms cubic-bezier(.33,.17,.85,1.1)',
        transform: 'translateX(-24px)'
      },
      '.album-list > div': {
        transform: 'translateX(-24px)',
        overflow: "hidden",
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'
      },
      '.album-list[favorite] > .fav': {
        opacity: 0.6
      },
      '.album-list[inlist] > .listed': {
        height: '20px',
        width: '20px',
        opacity: 0.6
      },
      '.album-list[playing] > .playing-svg': {
        height: '16px',
        width: '16px',
        opacity: 1
      },
      ".album-list[selected]": {
        "background-color": "var(--selected-color)"
      },
      ".album-list[selected]:hover": {
        "background-color": "var(--selected-hover-color)"
      },
      ".blank": {
        height: "550px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center"
      },
      '.a-z': {
        border: "var(--seperator-line)",
        'border-radius': '5px',
        position: 'fixed',
        right: 0,
        top: '50%',
        display: 'flex',
        'flex-direction': 'column',
        "text-transform": "uppercase",
        color: 'var(--text-color)',
        background: 'rgba(var(--main-rgb),0.5)',
        transition: 'opacity 0.45s ease',
        transform: 'translate(-50%, -50%)',
        opacity: '0.1'
      },
      '.a-z:hover': {
        opacity:1
      },
      '.a-z > a': {
        color: 'var(--text-color)',
        'text-decoration': 'none',
        padding: '4px',
        transition: 'color 0.3s ease'
      },
      '.a-z > a:hover': {
        color: 'var(--pop-color)',
        'text-decoration': 'underline',
        cursor: 'pointer'
      },
      '.popup': {
        overflow:'hidden',
        background: 'var(--main-color)',
        color: 'var(--text-color)',
        'border-radius': '5px',
        "box-shadow": "0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12),0 2px 4px -1px rgba(0,0,0,0.4)",
        position: 'fixed',
        width: `${this.popupWidth}px`,
        transform: 'scale3d(0,0,0)',
        transition:'transform 100ms cubic-bezier(.33,.17,.85,1.1)'
      },
      '.popup > .option': {
        padding: '8px',
        cursor: 'pointer',
        'text-transform': 'uppercase',
        "border-bottom": "var(--seperator-line)",
        transition: 'var(--button-bg-animation)',
        display:'flex',
        'flex-direction': 'row',
        'align-items': 'center',
        'justify-content': 'center'
      },
      '.popup > .option > svg': {
        height:'24px',
        width: '24px',
        'margin-right': '8px'
      },
      '.popup > .option > div': {
        width: '100%'
      },
      '.popup > .option:hover': {
        background: 'var(--hover-color)'
      },      
      '@keyframes ripple-animation': {
        to: {
          transform: 'scale(4)',
          opacity: 0
        }
      },
      '.ripple-effect': {
        position: 'absolute',
        'border-radius': '50%',
        background: 'rgba(var(--pop-rgb),0.4)',
        animation: 'ripple-animation 0.7s linear'
      }
    };

    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    this.content = ce('div');
    this.content.classList.add('content');

    [
      ELEMENT_STYLES, 
      this.content
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * view has changed 
   * 
   */
  async attributeChangedCallback() {
    await sleep(100);
    qs('.card').setAttribute('view', this.getAttribute('view'));
  }

  /**
   * fetch data and fill ui with content
   */
  async go() {
    const VIEW = this.getAttribute('view');

    const ALBUMS_IN_PLAYLIST = qsa('.album[inlist]', this.shadowRoot);

    this._usedChars = [
      '>'
    ];

    const CONTENT_CARD = qs('.card');
    
    // hide content to prevent flash when new content is pushed
    await fadeOut(CONTENT_CARD, 200);
    await sleep(50);
    
    // clear the element
    this.content.innerHTML = '';
    
    // get data
    const MUSIC_LIBRARY_DATA = await pywebview.api.lib_data();
    this.libSize = MUSIC_LIBRARY_DATA.lib_size || '0 b';
    delete MUSIC_LIBRARY_DATA.lib_size;

    // send data to UI
    if (VIEW === 'list') {
      this._albumList(MUSIC_LIBRARY_DATA);
    } else {
      await this._albumGrid(MUSIC_LIBRARY_DATA);
    }

    // get sync.json data
    const SYNC_JSON = await pywebview.api.sync_file();

    // make "selected" albums & artist
    this._compareData(SYNC_JSON);

    // favorites.json
    const FAVORITES = await pywebview.api.load_favorites();

    // mark "favorite" albums
    this._loadFavorites(FAVORITES);

    // if displaying favirites when refreshed only display favirites after
    if (this.hasAttribute('favorites')) {
      this.toggleAttribute('favorites');
      this.favorites();
    }

    ALBUMS_IN_PLAYLIST.forEach(element => {
      const ALBUM_IN_LIST = qs(`[data-artist="${element.dataset.artist}"][data-album="${element.dataset.album}"]`, this.shadowRoot);
      if (ALBUM_IN_LIST) ALBUM_IN_LIST.toggleAttribute('inlist');
    });
      
    // show the new stuff
    fadeIn(CONTENT_CARD, 200);
    
    // update filesize in menu
    const CUSTOM_EVENT = new CustomEvent('lib_size_updated', {
      detail:{lib_size: this.libSize}
    });
    this.dispatchEvent(CUSTOM_EVENT);
  }

  /**
   * update library ui with currently playing album
   * 
   * @param {Object} details {artist, album, src}
   * @returns {void}
   */
  nowPlaying(details) {
    // selecte now playing link in quick links
    const PLAYING_QUICK_LINK = qs('a[title="Playing"]', this.shadowRoot);

    // hide the link
    if (PLAYING_QUICK_LINK) PLAYING_QUICK_LINK.style.display = 'none';

    // blanket unmark all albums as playing
    qsa('.album[playing]', this.shadowRoot).forEach(el => {
      el.removeAttribute('playing');
    });

    // return if nothing is playing
    if (!details) {
      this.playlistCleared();
      return;
    }

    // find the album that is playing
    const ALBUM_PLAYING_NOW = qs(`[data-artist="${details.artist}"][data-album="${details.album}"]`, this.shadowRoot);

    // mark it
    if (ALBUM_PLAYING_NOW && !ALBUM_PLAYING_NOW.hasAttribute('playing')) ALBUM_PLAYING_NOW.toggleAttribute('playing');

    // unhide the quick link now playing link
    if (PLAYING_QUICK_LINK) PLAYING_QUICK_LINK.style.removeProperty('display');

    // check for album info dialog
    const OPENED_ALBUM_DIALOG = qs('#album-info');

    //  return if the dialog isn't present
    if (!OPENED_ALBUM_DIALOG) return;

    // get all tracks if open 
    const TRACKLIST = qsa('.track', OPENED_ALBUM_DIALOG);

    // check each to see if it is the playing track
    TRACKLIST.forEach(track => {
      track.removeAttribute('playing');
      const IS_PLAYING = this._arePathsTheSame(track.dataset.src, details.path);
      if (IS_PLAYING) {
        track.toggleAttribute('playing');
        track.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

  }

  /**
   * filter elements the have the favorite attribute
   */
  favorites() {
    // toggle favorites attribute for <music-library>
    this.toggleAttribute('favorites');

    // get all artist & album elements
    const ARTIST_ELEMENTS = qsa('.artist', this.shadowRoot);
    const ALBUM_ELEMENTS = qsa('.album', this.shadowRoot);

    if (this.hasAttribute('favorites')) {
      // hide all non favorited albums
      ARTIST_ELEMENTS.forEach(async el => {
        if (!el.hasAttribute('favorite')) {
          await fadeOut(el);
          el.style.display = 'none'
        }
      });
      ALBUM_ELEMENTS.forEach(async el => {
        if (!el.hasAttribute('favorite')) {
          await fadeOut(el);
          el.style.display = 'none';
        } 
      });
      qs('.a-z', this.shadowRoot).style.display = 'none';
    } else {
      // unhide all elements
      ARTIST_ELEMENTS.forEach(el => {
        el.style.removeProperty('display');
        fadeIn(el);
      });
      ALBUM_ELEMENTS.forEach(el => {
        el.style.removeProperty('display');
        fadeIn(el);
      });
      qs('.a-z', this.shadowRoot).style.removeProperty('display');
    }
  }

  /**
   * favorites an album with the given artist and album name
   * 
   * @param {String} artist 
   * @param {String} album 
   */
  favoriteAlbum(artist, album) {
    
    // the album to be favorited
    const ALBUM_ELEMENTS = qs(`[data-artist="${artist}"][data-album="${album}"]`, this.shadowRoot);
    
    // toggle the favorite attribute
    ALBUM_ELEMENTS.toggleAttribute('favorite');
    
    // get all album elements with the favirote attribute
    const FAVORITES = this._getFavorites();
    
    // save to  file
    pywebview.api.save_favorites(JSON.stringify(FAVORITES));
    
    // favorited artist element
    const ARTIST_ELEMENT = qs(`.artist[data-artist="${artist}"]`, this.shadowRoot);
    if (ALBUM_ELEMENTS.hasAttribute('favorite') && !ARTIST_ELEMENT.hasAttribute('favorite')) {
      ARTIST_ELEMENT.toggleAttribute('favorite');
    } else if (!ALBUM_ELEMENTS.hasAttribute('favorite')) {
      ARTIST_ELEMENT.removeAttribute('favorite');
    }


    // cleanup when unfavoriting an ablum while displaying favorites
    if (this.hasAttribute('favorites')) {

      // list all albums
      const ALBUM_ELEMENTS = qsa('.album', this.shadowRoot);

      // hide all elements that are not favirotes
      ALBUM_ELEMENTS.forEach(async el => {
        if (!el.hasAttribute('favorite')) {
          await fadeOut(el);
          el.style.display = 'none';
        } else {
          el.style.removeProperty('display');
          fadeIn(el);
        }
      });
    }
  }

  /**
   * update library scan progress bar
   * 
   * @param {Number} ndx - current position
   * @param {Number} length - total 
   */
  async updateBar(ndx, length) {
    const PERCENTAGE = ((ndx + 1) / length) * 100;
    if (this.bar) this.bar.setAttribute('percent', PERCENTAGE);
    if (this.percent) this.percent.textContent = `${PERCENTAGE.toFixed(1)}%`;

    // emit event to update the button with progress
    const CUSTOM_EVENT = new CustomEvent('library-scan', {
      detail:{percent: PERCENTAGE}
    });
    this.dispatchEvent(CUSTOM_EVENT);

    await sleep(1000);

    if (PERCENTAGE === 100) {
      await fadeOut(this.bar);
      await sleep(100);
      await this.go();
    }
  }


  /**
   * player playlist cleared and we need to clean up inlist attributes
   */
  playlistCleared() {
    const ALBUM_ELEMENTS = qsa('.album[inlist]', this.shadowRoot);
    ALBUM_ELEMENTS.forEach(albumElement => {
      albumElement.removeAttribute('inlist');
    });
  }

    /**
   * fill in page with data in a grid of album covers
   * 
   * @param {Object} musicLibrary artists and albums list from lib_data.json *required*
   */
  async _albumGrid(musicLibrary) {
    //  no data 
    if (Object.keys(musicLibrary).length === 0) {
      this._emptyLib();
      return;
    }
    for (const ARTIST in musicLibrary) {
      this._displayArtistGrid(ARTIST);
      for (const ALBUM of musicLibrary[ARTIST]) {
        await this._displayAlbumGrid(ARTIST, ALBUM);
      }
    }
    this._createQucikLinks();
  }

  /**
   * fill in page with data in a list
   * 
   * @param {Object} musicLibrary artists and albums list from lib_data.json *required*
   */
  _albumList(musicLibrary) {
    //  no data 
    if (Object.keys(musicLibrary).length === 0) {
      this._emptyLib();
      return;
    }

    // create a element for each artist & album
    for (const ARTIST in musicLibrary) {
      this._displayArtistList(ARTIST);
      for (const ALBUM of musicLibrary[ARTIST]) {
        this._displayAlbumList(ARTIST, ALBUM);
      }
    }
    this._createQucikLinks();
  }

  /**
   * generates alphibetical quick links on right of page
   * 
   * @returns {void}
   */
  _createQucikLinks() {
    //  create quick links element
    const QUCICK_LINKS_CONTAINER = ce('div');
    this.content.appendChild(QUCICK_LINKS_CONTAINER);
    QUCICK_LINKS_CONTAINER.classList.add('a-z');

    // create an link for each char in the array
    this._usedChars.forEach(char => {
      const LINK = ce('a');
      QUCICK_LINKS_CONTAINER.appendChild(LINK);

      // determine the behavior of the link
      if (Number(char)) {
        LINK.textContent = '#';
        LINK.title = '#';
      } else if (char === '>') {
        LINK.title = 'Playing';
        LINK.textContent = char;
        LINK.style.display = 'none';
      } else {
        LINK.title = char.toLocaleUpperCase();
        LINK.textContent = char;
      }

      // scroll the desired element into view
      LINK.addEventListener('click', e => {
        e.preventDefault();
        let target = '';
        if (Number(char)) {
          target = qs(`#number`, this.shadowRoot);
        } else if (char === '>') {
          target = qs('.album[playing]', this.shadowRoot);
        } else {
          target = qs(`#${char}`, this.shadowRoot);
        }
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /**
   * fired when ther is no lib_data.json file
   */
  _emptyLib() {
    // empty library notification
    alertUser('Click the Scan button to load library');
    
    // UI buttons that will be disabled
    const HEADER_BUTTONS = [
      '#menu-button',
      '#settings'
    ]
    HEADER_BUTTONS.forEach(id => {
      if (qs(id) && !qs(id).hasAttribute('disabled')) qs(id).toggleAttribute('disabled');
    });
      
    const buttonContents = fillButton('scan', 'scan music');

    // scan library button
    const BEGIN_SCAN_BUTTON = ce('audiosync-button');
    BEGIN_SCAN_BUTTON.appendChild(buttonContents);
    
    // wrapper to place content
    const LIBRARY_WRAPPER = ce('div');
    LIBRARY_WRAPPER.classList.add('blank');
    LIBRARY_WRAPPER.appendChild(BEGIN_SCAN_BUTTON);

    BEGIN_SCAN_BUTTON.onClick(async _ => {

      new Toast('Scan can take some time to complete', 10);
      // hide the button
      await fadeOut(BEGIN_SCAN_BUTTON);

      // remove the button once hidden
      LIBRARY_WRAPPER.innerHTML = '';

      // progress bar label
      const LABEL = ce('div');
      LABEL.textContent = 'Building Library';

      //  progress percentage text
      const PERCENT_TEXT = ce('div');
      PERCENT_TEXT.textContent = '0%';

      // create progress bar
      this.bar = ce('audiosync-progress');
      this.bar.style.opacity = 0;
      this.bar.style.width = '90%';
      [
        LABEL,
        PERCENT_TEXT
      ].forEach(el => this.bar.appendChild(el));

      // add the bar to the UI in a hidden state
      LIBRARY_WRAPPER.appendChild(this.bar);
      this.percent = PERCENT_TEXT;
      await sleep(10);

      //  uphide the progress bar
      await fadeIn(this.bar);
      const SCAN_TIMER = new Timer('Initial Scan');

      // do the scan actual in python
      await pywebview.api.create_json();

      // scan finished
      HEADER_BUTTONS.forEach(id => qs(id).removeAttribute('disabled'));
      const s = SCAN_TIMER.endString();
      new Toast(s);
    });
    this.content.appendChild(LIBRARY_WRAPPER);
  }

  /**
   * gets favorites from ui and returns as an JSON object
   * 
   * @returns {Object}
   */
  _getFavorites() {
    // container for favorites
    const FAVORITES_LIST = {}

    // get elements with favorite attribute
    const FAVORITED_ALBUMS = qsa('.album[favorite]', this.shadowRoot);

    // build from the elements and return result
    FAVORITED_ALBUMS.forEach(album => {
      const ARTIST_NAME = album.dataset.artist;
      if (!(ARTIST_NAME in FAVORITES_LIST)) {
        FAVORITES_LIST[ARTIST_NAME] = [];
      } 
      const ALBUM_TITLE = album.dataset.album;
      if (!(ALBUM_TITLE in FAVORITES_LIST[ARTIST_NAME]) && ALBUM_TITLE !== null) {
        FAVORITES_LIST[ARTIST_NAME].push(ALBUM_TITLE);
      }
    });
    return FAVORITES_LIST;
  }

  /**
   * toggle favirote state for the elements passed in the passed in object
   * 
   * @param {Object} favs 
   */
  _loadFavorites(favorites) {
    for (const ARTIST in favorites) {
      const ARTIST_ELEMENT = qs(`.artist[data-artist="${ARTIST}"]`, this.shadowRoot);
      if (ARTIST_ELEMENT) ARTIST_ELEMENT.toggleAttribute('favorite');
      favorites[ARTIST].forEach(album => {
        const ALBUM_ELEMENT = qs(`[data-artist="${ARTIST}"][data-album="${album}"]`, this.shadowRoot);
        if (ALBUM_ELEMENT && !ALBUM_ELEMENT.hasAttribute('diabled')) {
          ALBUM_ELEMENT.toggleAttribute('favorite');
        }
      });
    }
  }

  /**
   * replace \\ for / 
   * 
   * @param {String} string 
   * @returns {String}
   */
  _fixSlashes(string) {
    return string.replace(/\\/g, '/');
  }

  /**
   * fix paths from backend for use in the UI
   * 
   * @param {Array} array 
   * @returns {Array}
   */
  _fixPaths(array) {
    for (let i = 0; i < array.length; i++) {
      const FIXED_PATH = this._fixSlashes(array[i].path);
      array[i].art = `music${FIXED_PATH}/cover.jpg`;
      array[i].path = `music${FIXED_PATH}/${array[i].file}`;
      delete array[i].file;
    }
  }

  /**
   * open popup context menu
   * 
   * @param {Event} ev
   * @param {HTMLElement} albumContainer
   * @param {String} artist
   * @param {Object} album
   */
  async _openContexMenu(ev, albumContainer, artist, album) {
    ev.preventDefault();
    
    this.content.style.pointerEvents = 'none';
    
    // add favorite data to tracks
    // this sets favorite button when fullscreen
    album.favorite = albumContainer.hasAttribute('favorite');
    
    // for changing favorite button when playlist changes (not implimented)
    for (let i = 0; i < album.tracks.length; i++) {
      album.tracks[i].favorite = album.favorite;
    }
    
    // set popup & set position
    const X = ev.pageX;
    const Y = ev.pageY;

    const POPUP_CONTAINER = ce('div');
    if (Y > (window.innerHeight / 2)) {
      POPUP_CONTAINER.style.top = `${Y - this.popupHeight}px`;
    } else {
      POPUP_CONTAINER.style.top = `${Y}px`;
    }
    if (X > (window.innerWidth / 2)) {
      POPUP_CONTAINER.style.left = `${X - this.popupWidth}px`;
    } else {
      POPUP_CONTAINER.style.left = `${X}px`;
    }
    POPUP_CONTAINER.classList.add('popup');

    const DISMISS = _ => {
      qs('body').removeEventListener('click', _ => DISMISS());
      qs('body').removeEventListener('contextmenu', _ => DISMISS());
      this.content.style.removeProperty('pointer-events');
      POPUP_CONTAINER.addEventListener('transitionend', async _ => {
        await sleep(500);
        POPUP_CONTAINER.remove();
      });
      POPUP_CONTAINER.style.removeProperty('transform');      
    };

    // any click to close the popup
    // closes and cleans up the popup element
    qs('body').addEventListener('click', _ => DISMISS());
    setTimeout(_ => qs('body').addEventListener('contextmenu', _ => DISMISS()), 50);

    // popup play button
    const POPUP_PLAY_BUTTON = fillButton('play', 'play');
    POPUP_PLAY_BUTTON.classList.add('option');

    // play the album
    POPUP_PLAY_BUTTON.addEventListener('click', e => {
      createRipple(e);
      this.player.playAlbum(album);
      albumContainer.toggleAttribute('inlist');
    });
    
    const POPUP_PLAYLIST_BUTTON = fillButton('add', 'playlist');
    POPUP_PLAYLIST_BUTTON.classList.add('option');
    POPUP_PLAYLIST_BUTTON.addEventListener('click', e => {
      createRipple(e);
      this.player.addToPlaylist(album);
      new Toast(`${album.title} added to playlist`, 1);
      albumContainer.toggleAttribute('inlist');
    });
    if (!this.player.hasAttribute('playing') || albumContainer.hasAttribute('playing') || albumContainer.hasAttribute('inlist')) {
      POPUP_PLAYLIST_BUTTON.style.display = 'none';
    }

    // popup favorite button (toggles function, text & icon)
    let fav;
    if (albumContainer.hasAttribute('favorite')) {
      fav = fillButton('removeFav', 'unfavorite');
    } else {
      fav = fillButton('addFav', 'favorite');
    }
    fav.classList.add('option');
    fav.addEventListener('click', e => {
      createRipple(e);
      // mark / unmark in library ui
      this.favoriteAlbum(artist, album.title);
      // mark / unmark in audio player
      this.player.favorite({artist: artist, title: album.title, favorite: albumContainer.hasAttribute('favorite')});
    });

    // display album info dialog (eventualy)
    const ALBUM_INFO_BUTTON = fillButton('list', 'info');
    ALBUM_INFO_BUTTON.classList.add('option');
    ALBUM_INFO_BUTTON.addEventListener('click', e => {
      createRipple(e);
      this._openAlbumInfoDialog(artist, album, albumContainer);
    });

    [
      POPUP_PLAY_BUTTON,
      POPUP_PLAYLIST_BUTTON,
      fav,
      ALBUM_INFO_BUTTON
    ].forEach(el => POPUP_CONTAINER.appendChild(el));
    
    this.shadowRoot.appendChild(POPUP_CONTAINER);
    await sleep(20);
    requestAnimationFrame(_ => POPUP_CONTAINER.style.transform = 'scale3d(1,1,1)');
  }

  /**
   * compare 2 file paths
   * 
   * @param {String} path1 
   * @param {String} path2 
   * @returns 
   */
  _arePathsTheSame(path1, path2) {
    // Decode URL-encoded parts of the paths
    const DECODED_PATH1 = decodeURIComponent(path1);
    const DECODED_PATH2 = decodeURIComponent(path2);
    
    // Normalize the paths to ensure consistent formatting
    const NORMALIZED_PATH1 = DECODED_PATH1.replace(/\\/g, '/');
    const NORMALIZED_PATH2 = DECODED_PATH2.replace(/\\/g, '/');

    // Compare the decoded and normalized paths
    return NORMALIZED_PATH1 === NORMALIZED_PATH2;
  }

  /**
   * favorites an album
   * 
   * @param {HTMLElement} favbutton
   * @param {String} artist 
   * @param {Object} album 
   */
  _albumDialogFavoriteButtonClicked(favbutton, artist, album) {
    //  toggle favorite state
    album.favorite = !album.favorite;
    // mark / unmark in the library UI 
    this.favoriteAlbum(artist, album.title);
    // mark / unmark in the audio player
    this.player.favorite({
      artist: artist, 
      title: album.title, 
      favorite: album.favorite
    });
    if (album.favorite) {
      favbutton.style.opacity = 1;
      favbutton.title = 'Unfavorite';
    } else {
      favbutton.style.opacity = 0.5;
      favbutton.title = 'Favorite';
    }
  }

  /**
   * open album info dialog
   * 
   * @param {String} artist
   * @param {Object} album
   * 
   */
  async _openAlbumInfoDialog(artist, album, albumContainer) {
    const DIALOG = ce('audiosync-dialog');
    DIALOG.id = 'album-info';
    DIALOG.toggleAttribute('nopad');
    DIALOG.toggleAttribute('cleanup');

    const FAVORITE_BUTTON = ce('audiosync-small-button');
    FAVORITE_BUTTON.classList.add('fav');
    FAVORITE_BUTTON.appendChild(await svgIcon('favorite'));
    FAVORITE_BUTTON.onClick(_ => this._albumDialogFavoriteButtonClicked(FAVORITE_BUTTON, artist, album));
    if (!album.favorite) {
      FAVORITE_BUTTON.style.opacity = 0.5;
    }

    const ADD_TO_PLAYLIST = ce('audiosync-small-button');
    ADD_TO_PLAYLIST.classList.add('add');
    ADD_TO_PLAYLIST.appendChild(await svgIcon('add'));
    if (!this.player.hasAttribute('playing') || albumContainer.hasAttribute('inlist')) ADD_TO_PLAYLIST.style.display = 'none';
    ADD_TO_PLAYLIST.onClick(async _ => {
      this.player.addToPlaylist(album);
      new Toast(`${album.title} added to playlist`, 1);
      albumContainer.toggleAttribute('inlist');
      await fadeOut(ADD_TO_PLAYLIST);
      ADD_TO_PLAYLIST.style.display = 'none';
    });

    const IMG_WRAPPER = ce('div');
    IMG_WRAPPER.classList.add('img-wrapper');
    
    const IMAGE_PLACEHOLDER = ce('div');
    IMAGE_PLACEHOLDER.classList.add('img-placeholder');
    IMAGE_PLACEHOLDER.textContent  = 'Loading Image..';


    const CANVAS = ce('canvas');
    const ctx = CANVAS.getContext('2d', { willReadFrequently: true });
    CANVAS.width = 450;
    CANVAS.height = 450;

    
    const IMG = ce('img');
    IMG.src = album.tracks[0].art;
    IMG.style.display = 'none';
    IMG.style.opacity = 0;
    IMG.onload = async _ => {
      ctx.drawImage(IMG, 0, 0, CANVAS.width, CANVAS.height);

      const POINT_ONE = getColorAtPoint(CANVAS, 40,40,30);
      const POINT_TWO = getColorAtPoint(CANVAS, (CANVAS.width - 40),40,30);

      ADD_TO_PLAYLIST.setAttribute('color', getContrastColor(POINT_ONE));
      FAVORITE_BUTTON.setAttribute('color', getContrastColor(POINT_TWO));

      IMG.style.removeProperty('display');
      IMAGE_PLACEHOLDER.style.display = 'none';
      await fadeIn(IMG);
    };

    [
      IMAGE_PLACEHOLDER,
      IMG
    ].forEach(el => IMG_WRAPPER.appendChild(el));
    

    const TRACKLIST_CONTAINER = ce('div');
    TRACKLIST_CONTAINER.classList.add('tracklist');

    const PLAYLIST_HEADER = ce('div');
    PLAYLIST_HEADER.classList.add('album-head');

    const ARTISTS_NAME = ce('div');
    ARTISTS_NAME.textContent = artist;

    const ALBUM_TITLE = ce('div');
    ALBUM_TITLE.textContent = album.title;
    [
      ARTISTS_NAME,
      ALBUM_TITLE
    ].forEach(el => PLAYLIST_HEADER.appendChild(el));
    TRACKLIST_CONTAINER.appendChild(PLAYLIST_HEADER);

    album.tracks.forEach((track, ndx) => {

      // shortened path to playing file
      const PATH_CURRENTLY_PLAYING = this.player.player.src.replace(`${window.location.origin}/`, '');

      const TRACK_NUMBER = ce('div');
      TRACK_NUMBER.textContent = track.track;
      
      const TRACK_TITLE = ce('div');
      TRACK_TITLE.textContent = track.title;
      
      const TRACK_CONTAINER = ce('div');
      
      // is the cueently playing track this track
      if (this._arePathsTheSame(PATH_CURRENTLY_PLAYING, track.path)) TRACK_CONTAINER.toggleAttribute('playing');
      TRACK_CONTAINER.dataset.src = track.path;
      TRACK_CONTAINER.classList.add('track');
      TRACK_CONTAINER.addEventListener('click', _ => {
        // check if tracks are in playlist
        const ARE_TRACKS_IN_PLAYLIST = areElementsPresent(album.tracks, this.player.playlist);

        if (ARE_TRACKS_IN_PLAYLIST && this.player.playlist.length === album.tracks.length) {
          // tracks in playlist are this album and only this album it is safe to play ndx directly
          this.player.playNdx(ndx);
        } else if (ARE_TRACKS_IN_PLAYLIST) {
          // tracks are present with tracks from other albums
          const ALBUM_START_POINT = indexOfElement(this.player.playlist, album.tracks[0]);
          this.player.playNdx(ALBUM_START_POINT + ndx);
        } else {
          // not in playlist. will overwrite current playlist and play this album starting on the song clicked
          this.player.playAlbum(album, ndx);
          // set playlist "inline" state
          albumContainer.toggleAttribute('inlist');
        }
      });

      [
        TRACK_NUMBER,
        TRACK_TITLE
      ].forEach(el => TRACK_CONTAINER.appendChild(el));
      TRACKLIST_CONTAINER.appendChild(TRACK_CONTAINER);
    });

    [
      ADD_TO_PLAYLIST,
      FAVORITE_BUTTON,
      IMG_WRAPPER,
      TRACKLIST_CONTAINER
    ].forEach(el => DIALOG.appendChild(el));


    qs('body').appendChild(DIALOG);
    await sleep(20);
    DIALOG.open();
    await sleep(200);
    const PLAYING_TRACK_ELEMENT = qs('audiosync-dialog > .tracklist > .track[playing]');
    if (PLAYING_TRACK_ELEMENT) PLAYING_TRACK_ELEMENT.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * album element
   * 
   * @param {String} artist
   * @param {Object} album
   */
  async _displayAlbumGrid(artist, album) {
    this._fixPaths(album.tracks);
    const IMG = new Image();
    IMG.height = 150;
    IMG.width = 150;
    IMG.setAttribute('loading', 'lazy');
    IMG.setAttribute('decoding', 'async');
    IMG.setAttribute('fetchpriority', 'low');
    IMG.setAttribute('alt', 'cover.jpg');
    IMG.src = album.tracks[0].art.replace('cover.jpg', 'thumb.webp');

    const PLAYING_ICON = await svgIcon('playing');
    PLAYING_ICON.classList.add('playing-svg');
    PLAYING_ICON.title = 'Playing';

    const INLIST_ICON = await svgIcon('list');
    INLIST_ICON.classList.add('listed');
    INLIST_ICON.title = 'In Playlist';

    const FAVORITE_ICON = await svgIcon('favorite');
    FAVORITE_ICON.classList.add('fav');
    FAVORITE_ICON.title = 'Favorite';

    const SELECTED_ICON = await svgIcon('check');
    SELECTED_ICON.classList.add('selected');
    SELECTED_ICON.title = 'Selected';

    const ARTIST_NAME = ce('div');
    ARTIST_NAME.textContent = artist;

    const ALBUM_TITLE = ce('div');
    ALBUM_TITLE.textContent = album.title;

    const ALBUM_CONTAINER = ce('div');await 
    [
      IMG,
      ARTIST_NAME,
      ALBUM_TITLE,
      PLAYING_ICON,
      INLIST_ICON,
      FAVORITE_ICON,
      SELECTED_ICON
    ].forEach(el => ALBUM_CONTAINER.appendChild(el));
    ALBUM_CONTAINER.dataset.artist = artist;
    ALBUM_CONTAINER.dataset.album = album.title;
    ALBUM_CONTAINER.classList.add('album');
    ALBUM_CONTAINER.classList.add('album-grid');
    ALBUM_CONTAINER.addEventListener('click', this._makeSelection);
    ALBUM_CONTAINER.addEventListener('contextmenu', ev => this._openContexMenu(ev, ALBUM_CONTAINER, artist, album));
    this.content.appendChild(ALBUM_CONTAINER);
  }

  /**
   * album element
   * 
   * @param {String} artist
   * @param {Object} album
   */
  _displayAlbumList(artist, album) {
    this._fixPaths(album.tracks);
    let albumContainer = ce('div');
    albumContainer.dataset.artist = artist;
    albumContainer.dataset.album = album.title;
    albumContainer.classList.add('album');
    albumContainer.classList.add('album-list');
    albumContainer.addEventListener('click', this._makeSelection);
    albumContainer.addEventListener('contextmenu', ev => this._openContexMenu(ev, albumContainer, artist, album));
    svgIcon('playing').then(svg => {
      svg.classList.add('playing-svg');
      svg.title = 'Playing';
      albumContainer.appendChild(svg);
    });
    svgIcon('list').then(svg => {
      svg.classList.add('listed');
      svg.title = 'In Playlist';
      albumContainer.appendChild(svg);
    });
    svgIcon('favorite').then(svg => {
      svg.classList.add('fav');
      svg.title = 'Favorite';
      albumContainer.appendChild(svg);
      const text = ce('div');
      text.textContent = album['title']
      albumContainer.appendChild(text);
    });
    this.content.appendChild(albumContainer);
  }

  /**
   * artist grid element
   * 
   * @param {String} artist
   */
  _displayArtistGrid(artist) {
    const ARTIST_MARKER = ce('div');
    ARTIST_MARKER.dataset.artist = artist;
    ARTIST_MARKER.classList.add('artist');
    ARTIST_MARKER.classList.add('artist-grid');
    this.content.appendChild(ARTIST_MARKER);
    this._quickLinkMarkElement(artist, ARTIST_MARKER);
  }

  /**
   * artist list element
   * 
   * @param {String} artist
   */
  _displayArtistList(artist) {
    let artistContainer = ce('div');
    artistContainer.dataset.artist = artist;
    artistContainer.classList.add('artist');
    artistContainer.classList.add('artist-list');
    artistContainer.textContent = artist;
    artistContainer.addEventListener('click', this._makeSelection);
    artistContainer.addEventListener('contextmenu', ev => ev.preventDefault());
    this.content.appendChild(artistContainer);
    this._quickLinkMarkElement(artist, artistContainer);
  }

  /**
   * create quick links UI
   * 
   * @param {String} artistName 
   * @param {HTMLElement} artistContainer 
   * 
   * @returns {HTMLElement}
   */
  _quickLinkMarkElement(artistName, artistContainer) {
    const firstChar = artistName[0].toLowerCase();
    // first char isn't included in the list of chars
    if (!this._usedChars.includes(firstChar)) {
      // add first number encountered to array and drop all others
      if (Number(firstChar) && !containsNumber(this._usedChars)) {
        this._usedChars.push(firstChar);
        artistContainer.id = 'number';
        return;
      } else if (Number(firstChar)) {
        return
      }
      
      // add the char
      this._usedChars.push(firstChar);

      // add id the first time a char is used to start a word
      artistContainer.id = firstChar;
    }
  }

  /**
   * compares sync.json data to lib_data.json data selects all elements listed in sync.json
   * 
   * @param {Object} data
   */
  _compareData(data) {
    if (Object.keys(data).length === 0) {
      const STRING = 'No sync file... Running sync now will sync all music';
      console.log(STRING);
      alertUser(STRING);
      return;
    }
    for (const artist in data) {
      const MATCHING_ARTIST_ELEMENTS = qsa(`[data-artist="${artist}"].artist`, this.shadowRoot);
      MATCHING_ARTIST_ELEMENTS.forEach(el => el.toggleAttribute('selected'));
      for (const album of data[artist]) {
        const MATCHING_ALBUM_ELEMENTS = qsa(`[data-artist="${artist}"][data-album="${album}"]`, this.shadowRoot);
        MATCHING_ALBUM_ELEMENTS.forEach(el => el.toggleAttribute('selected'));
      }
    }
  }

  

  /**
   * creates a new object from selected elements to be saved as sync.json
   */
  _buildObject() {
    const artistAlbums = {};
    // Select all elements with the data-artist attribute
    const artistElements = qsa('.album[selected]', this.shadowRoot);
    // Iterate over each artist element
    artistElements.forEach(artistElement => {
      const artistName = artistElement.dataset.artist;
      // If the artist name is not in the object, initialize an empty array for their albums
      if (!(artistName in artistAlbums)) {
        artistAlbums[artistName] = [];
      }
      const albumName = artistElement.dataset.album;
      if (!(albumName in artistAlbums[artistName]) && albumName != null) {
        artistAlbums[artistName].push(albumName);
      }
    });
    return artistAlbums;
  }

  /**
   * element has been clicked on
   * 
   * @param {Event} e
   */
  _makeSelection(e) {
    const target = e.target;
    if (target.classList.contains('artist') && this.hasAttribute('favorites')) return;
    createRipple(e);
    target.toggleAttribute('selected');
    if (target.classList.contains('artist')) {
      const matchingArtist = qsa(`[data-artist="${target.dataset.artist}"]`, this.shadowRoot);
      matchingArtist.forEach(el => {
        if (target === el) return;
        if (target.hasAttribute('selected')) {
          el.toggleAttribute('selected');
        } else {
          el.removeAttribute('selected');
        } 
      });
    }
    if (target.classList.contains('album')) {
      const matchingArtist = qsa(`[data-artist="${target.dataset.artist}"].artist`, this.shadowRoot);
      matchingArtist.forEach(el => {
        if (target.hasAttribute('selected')) {
          el.toggleAttribute('selected');
        } else {
          el.removeAttribute('selected');
        } 
      });
    }
    pywebview.api.save(JSON.stringify(this._buildObject(), null, 2));
  }
}
customElements.define('music-library', MusicLibrary);
