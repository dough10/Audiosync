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
  svgIcon
} from './helpers.js';

/**
 * displays the music library in a selectable form
*/
class MusicLibrary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    this.popupHeight = 122;
    this.popupWidth = 150;

    this._makeSelection = this._makeSelection.bind(this);
    this._displayArtist = this._displayArtist.bind(this);
    this._openContexMenu = this._openContexMenu.bind(this)

    const cssObj = {
      "@keyframes ripple-animation": {
        to: {
          transform: "scale(2)",
          opacity: 0
        }
      },
      ".ripple-effect": {
        position: "absolute",
        "border-radius": "50%",
        background: "rgba(125, 125, 125, 0.4)",
        animation: "ripple-animation 0.7s linear"
      },
      "div:first-child": {
        "border-top": "none"
      },
      svg: {
        height: '24px',
        width:'24px'
      },
      ".artist": {
        position: "relative",
        "border-top": "1px solid #3333333d",
        cursor: "pointer",
        padding: "12px",
        "font-size": "17px",
        "font-weight": "bold",
        overflow: "hidden",
        transition: 'var(--button-bg-animation)'
      },
      ".artist:hover": {
        "background-color": "var(--hover-color)"
      },
      ".album": {
        position: "relative",
        "border-top": "1px solid #3333333d",
        cursor: "pointer",
        padding: "8px",
        "font-size": "13px",
        transition: 'var(--button-bg-animation)',
        display: 'flex',
        'justify-content': 'center',
        'align-items': 'center',
        overflow: 'hidden'
      },
      ".album:hover": {
        "background-color": "var(--hover-color)"
      },
      '.album > *': {
        'pointer-events': 'none'
      },
      '.album > svg': {
        height: '12px',
        width: '12px',
        opacity: 0,
        transition: 'all 150ms cubic-bezier(.33,.17,.85,1.1)',
        transform: 'translateX(-26px)'
      },
      '.album > div': {
        transform: 'translateX(-12px)',
        overflow: "hidden",
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'
      },
      '.album[favorite] > svg': {
        opacity: 0.6
      },
      '.album[playing]': {
        color: 'var(--pop-color)'
      },      
      '.album[playing][selected]': {
        color: '#ffffff'
      },
      ".album[selected]": {
        "background-color": "rgba(100, 100, 100, 0.582)"
      },
      ".album[selected]:hover": {
        "background-color": "#00000044"
      },
      ".blank": {
        height: "550px",
        display: "flex",
        "align-items": "center",
        "justify-content": "center"
      },
      '.a-z': {
        border: "1px solid rgba(51,51,51,0.2)",
        'border-radius': '5px',
        position: 'fixed',
        right: 0,
        top: '50%',
        display: 'flex',
        'flex-direction': 'column',
        "text-transform": "uppercase",
        color: '#333333',
        background: 'rgba(255,255,255,0.5)',
        transition: 'opacity 0.45s ease',
        transform: 'translate(-50%, -50%)',
        opacity: '0.1'
      },
      '.a-z:hover': {
        opacity:1
      },
      '.a-z > a': {
        color: '#333333',
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
        background: '#ffffff',
        color: '#333333',
        'border-radius': '5px',
        "box-shadow": "0 4px 5px 0 rgba(0,0,0,0.14),0 1px 10px 0 rgba(0,0,0,0.12),0 2px 4px -1px rgba(0,0,0,0.4)",
        position: 'fixed',
        height: `${this.popupHeight}px`,
        width: `${this.popupWidth}px`,
        transform: 'scale3d(0,0,0)',
        transition:'transform 100ms cubic-bezier(.33,.17,.85,1.1)'
      },
      '.popup > .option': {
        padding: '8px',
        cursor: 'pointer',
        'text-transform': 'uppercase',
        "border-bottom": "1px solid #3333333d",
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
      }
    };

    const style = ce('style');
    style.textContent = objectToCSS(cssObj);

    this.content = ce('div');
    [
      style, 
      this.content
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * fetch data
   */
  async go() {
    this._usedChars = [
      '>'
    ];
    await fadeOut(this.content);
    this.content.innerHTML = '';
    const library = await pywebview.api.lib_data();
    this.libSize = library.lib_size || '0 b';
    delete library.lib_size;
    this._displayData(library);
    const syncData = await pywebview.api.sync_file();
    this._compareData(syncData);
    const favs = await pywebview.api.load_favorites();
    this._loadFavorites(favs);
    fadeIn(this.content);
    const ev = new CustomEvent('lib_size_updated', {
      detail:{lib_size: this.libSize}
    });
    this.dispatchEvent(ev);
  }

  /**
   * update library ui with currently playing album
   * 
   * @param {Object} details 
   * @returns {void}
   */
  nowPlaying(details) {
    const link = qs('a[title="Playing"]', this.shadowRoot)
    link.style.display = 'none';
    qsa('.album', this.shadowRoot).forEach(el => {
      el.removeAttribute('playing');
    });
    if (!details) return;
    const newPlaying = qs(`[data-artist="${details.artist}"][data-album="${details.album}"]`, this.shadowRoot);
    newPlaying.toggleAttribute('playing');
    link.style.removeProperty('display');
  }

  /**
   * filter elements the have the favorite attribute
   */
  favorites() {
    this.toggleAttribute('favorites');


    const artists = qsa('.artist', this.shadowRoot);
    const albums = qsa('.album', this.shadowRoot);

    if (this.hasAttribute('favorites')) {
      artists.forEach(async el => {
        await fadeOut(el);
        el.style.display = 'none'
      });
      albums.forEach(async el => {
        if (!el.hasAttribute('favorite')) {
          await fadeOut(el);
          el.style.display = 'none';
        } 
      });
      qs('.a-z', this.shadowRoot).style.display = 'none';
    } else {
      artists.forEach(el => {
        el.style.removeProperty('display');
        fadeIn(el);
      });
      albums.forEach(el => {
        el.style.removeProperty('display');
        fadeIn(el);
      });
      qs('.a-z', this.shadowRoot).style.removeProperty('display');
    }
  }

  _loadFavorites(favs) {
    for (const artist in favs) {
      favs[artist].forEach(album => {
        const el = qs(`[data-artist="${artist}"][data-album="${album}"]`, this.shadowRoot);
        if (!el) return;
        el.toggleAttribute('favorite');
      });
    }
  }

  /**
   * fill in page with data
   * 
   * @param {Object} data artists and albums list from lib_data.json *required*
   */
  _displayData(data) {
    if (Object.keys(data).length === 0) {
      this._emptyLib();
      return;
    }
    for (const artist in data) {
      this._displayArtist(artist);
      for (let i = 0; i < data[artist].length; i++) {
        this._displayAlbum(artist, data[artist][i]);
      }
    }

    // no need to display in not enough chars used
    if (this._usedChars.length < 10) return;
    const alphabet = ce('div');
    alphabet.classList.add('a-z');
    this.content.appendChild(alphabet);
    this._usedChars.forEach(char => {
      const link = ce('a');
      if (Number(char)) {
        link.textContent = '#';
        link.title = '#';
      } else if (char === '>') {
        link.title = 'Playing';
        link.textContent = char;
        link.style.display = 'none';
      } else {
        link.title = char.toLocaleUpperCase();
        link.textContent = char;
      }
      alphabet.appendChild(link);
      link.addEventListener('click', e => {
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
    const buttons = [
      '#menu-button',
      '#settings',
      'audiosync-tabs'
    ]
    buttons.forEach(id => qs(id).setAttribute('disabled', 1));
      
    const buttonContents = fillButton('scan', 'scan music');

    // scan library button
    const button = ce('audiosync-button');
    button.appendChild(buttonContents);
    
    // wrapper to place content
    const wrapper = ce('div');
    wrapper.classList.add('blank');
    wrapper.appendChild(button);

    button.onClick(async _ => {

      new Toast('Scan can take some time to complete', 10);
      // hide the button
      await fadeOut(button);

      // remove the button once hidden
      wrapper.innerHTML = '';

      // progress bar label
      const label = ce('div');
      label.textContent = 'Building Library';

      //  progress percentage text
      const percent = ce('div');
      percent.textContent = '0%';

      // create progress bar
      this.bar = ce('audiosync-progress');
      this.bar.style.opacity = 0;
      this.bar.style.width = '90%';
      [
        label,
        percent
      ].forEach(el => this.bar.appendChild(el));

      // add the bar to the UI in a hidden state
      wrapper.appendChild(this.bar);
      this.percent = percent;
      await sleep(10);

      //  uphide the progress bar
      await fadeIn(this.bar);
      const t = new Timer('Initial Scan');

      // do the scan actual in python
      await pywebview.api.create_json();

      // scan finished
      buttons.forEach(id => qs(id).removeAttribute('disabled'));
      const s = t.endString();
      new Toast(s);
    });
    this.content.appendChild(wrapper);
  }

  /**
   * update library scan progress bar
   * 
   * @param {Number} ndx - current position
   * @param {Number} length - total 
   */
  async updateBar(ndx, length) {
    const percent = ((ndx + 1) / length) * 100;
    if (this.bar) this.bar.setAttribute('percent', percent);
    if (this.percent) this.percent.textContent = `${percent.toFixed(1)}%`;

    const ev = new CustomEvent('library-scan', {
      detail:{percent: percent}
    });
    this.dispatchEvent(ev);

    if (!this.bar) await sleep(1000);

    if (percent === 100) {
      await fadeOut(this.bar);
      await sleep(100);
      await this.go();
    }
  }

  /**
   * gets favorites from ui and returns as an JSON object
   * 
   * @returns {Object}
   */
  _getFavorites() {
    const favList = {}
    const favorites = qsa('.album[favorite]', this.shadowRoot);
    favorites.forEach(favorite => {
      const artistName = favorite.dataset.artist;
      if (!(artistName in favList)) {
        favList[artistName] = [];
      } 
      const albumName = favorite.dataset.album;
      if (!(albumName in favList[artistName]) && albumName != null) {
        favList[artistName].push(albumName);
      }
    });
    return favList;
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
      const path = this._fixSlashes(array[i].path);
      array[i].art = `music${path}/cover.jpg`;
      array[i].path = `music${path}/${array[i].file}`;
      delete array[i].file;
    }
  }

  playerSetFavorite(data) {
    this.favoriteAlbum(data.artist,data.title);
  }

  favoriteAlbum(artist, album) {
    const albumContainer = qs(`[data-artist="${artist}"][data-album="${album}"]`, this.shadowRoot);
    albumContainer.toggleAttribute('favorite');
    const favs = this._getFavorites();
    pywebview.api.save_favorites(JSON.stringify(favs, null, 2));
    
    // cleanup when unfavoriting an ablum while displaying favorites
    if (this.hasAttribute('favorites')) {
      // list all albums
      const albums = qsa('.album', this.shadowRoot);
      // hide all elements that are not favirotes
      albums.forEach(async el => {
        if (!el.hasAttribute('favorite')) {
          await fadeOut(el);
          el.style.display = 'none';
        } 
      });
    }
  }

  /**
   * open popup context menu
   * 
   * @param {HTMLElement} albumContainer
   */
  async _openContexMenu(ev, albumContainer, artist, album) {
    ev.preventDefault();
    const x = ev.pageX;
    const y = ev.pageY;
  
    this.content.style.pointerEvents = 'none';

    // add favorite data to tracks
    // this sets favorite button when fullscreen
    album.favorite = albumContainer.hasAttribute('favorite');

    // for changing favorite button when playlist changes (not implimented)
    for (let i = 0; i < album.tracks.length; i++) {
      album.tracks[i].favorite = album.favorite;
    }

    // create popup & set position
    const wrapper = ce('div');
    if (y > 500) {
      wrapper.style.top = `${y - this.popupHeight}px`;
    } else {
      wrapper.style.top = `${y}px`;
    }
    if (x > 300) {
      wrapper.style.left = `${x - this.popupWidth}px`;
    } else {
      wrapper.style.left = `${x}px`;
    }
    wrapper.classList.add('popup');

    // any click to close the popup
    // closes and cleans up the popup element
    qs('body').addEventListener('click', _ => {
      this.content.style.removeProperty('pointer-events');
      wrapper.addEventListener('transitionend', async _ => {
        await sleep(500);
        wrapper.remove();
      });
      wrapper.style.removeProperty('transform');
    });

    // popup play button
    const play = fillButton('play', 'play');
    play.classList.add('option');

    // fire an event to play the album
    play.addEventListener('click', _ => {
      // fire event saying play album
      const ev = new CustomEvent('album-played', {
        detail:{album: album}
      });
      this.dispatchEvent(ev);
    });
    
    // popup favorite button (toggles)
    let fav;
    if (albumContainer.hasAttribute('favorite')) {
      fav = fillButton('removeFav', 'unfavorite');
    } else {
      fav = fillButton('addFav', 'favorite');
    }
    fav.classList.add('option');
    fav.addEventListener('click', _ => {
      this.favoriteAlbum(artist, album.title);
      const ev = new CustomEvent('fav-album', {
        detail:{artist: artist, title: album.title, favorite: albumContainer.hasAttribute('favorite')}
      });
      this.dispatchEvent(ev);
    });

    // display album info dialog (eventualy)
    const info = fillButton('list', 'info');
    info.classList.add('option');
    info.addEventListener('click', _ => {

      console.log(album);
    });

    [
      play,
      fav,
      info
    ].forEach(el => wrapper.appendChild(el));
    
    this.shadowRoot.appendChild(wrapper);
    await sleep(20);
    requestAnimationFrame(_ => wrapper.style.transform = 'scale3d(1,1,1)');
  }

  /**
   * album element
   * 
   * @param {String} artist
   * @param {String} album
   */
  _displayAlbum(artist, album) {
    this._fixPaths(album.tracks);
    let albumContainer = ce('div');
    albumContainer.dataset.artist = artist;
    albumContainer.dataset.album = album['title'];
    albumContainer.classList.add('album');
    albumContainer.addEventListener('click', this._makeSelection);
    albumContainer.addEventListener('contextmenu', ev => {
      this._openContexMenu(ev, albumContainer, artist, album);
    });
    svgIcon('favorite').then(svg => {
      albumContainer.appendChild(svg);
      const text = ce('div');
      text.textContent = album['title']
      albumContainer.appendChild(text);
    });
    this.content.appendChild(albumContainer);
  }

  /**
   * artist element
   * 
   * @param {String} artist
   */
  _displayArtist(artist) {
    const firstChar = artist[0].toLowerCase();
    let artistContainer = ce('div');
    artistContainer.dataset.artist = artist;
    artistContainer.classList.add('artist');
    artistContainer.textContent = artist;
    artistContainer.addEventListener('click', this._makeSelection);
    artistContainer.addEventListener('contextmenu', ev => ev.preventDefault());
    this.content.appendChild(artistContainer);

    // first char isn't included in the list of chars
    if (!this._usedChars.includes(firstChar)) {
      // ignore all numbers
      if (Number(firstChar)) return;
      
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
      const s = 'No sync file... Running sync now will sync all music';
      console.log(s);
      alertUser(s);
      return;
    }
    for (const artist in data) {
      const m = qsa(`[data-artist="${artist}"].artist`, this.shadowRoot);
      m.forEach(el => el.toggleAttribute('selected'));
      for (let i=0; i < data[artist].length; i++) {
        const s = qsa(`[data-album="${data[artist][i]}"]`, this.shadowRoot);
        s.forEach(el => el.toggleAttribute('selected'));
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
    createRipple(e);
    const target = e.target;
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
    const ev = new CustomEvent('album-selected', {
      detail:{sync_data: this._buildObject()}
    });
    this.dispatchEvent(ev);
  }
}
customElements.define('music-library', MusicLibrary);
