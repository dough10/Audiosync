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
  indexOfElement
} from './helpers.js';

/**
 * displays the music library in a selectable form
*/
class MusicLibrary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    this.player = qs('audiosync-player');

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
      '.content': {
        padding: '8px'
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
        "border-top": "var(--seperator-line)",
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
        'margin-right': '4px',
        transition: 'all 150ms cubic-bezier(.33,.17,.85,1.1)',
        transform: 'translateX(-24px)'
      },
      '.album > div': {
        transform: 'translateX(-24px)',
        overflow: "hidden",
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'
      },
      '.album[favorite] > .fav': {
        opacity: 0.6
      },
      '.album[inlist] > .listed': {
        height: '20px',
        width: '20px',
        opacity: 0.6
      },
      '.album[playing] > .playing-svg': {
        height: '16px',
        width: '16px',
        opacity: 1
      },
      ".album[selected]": {
        "background-color": "var(--selected-color)"
      },
      ".album[selected]:hover": {
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
      }
    };

    const style = ce('style');
    style.textContent = objectToCSS(cssObj);

    this.content = ce('div');
    this.content.classList.add('content');

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
    this._header();
    const library = await pywebview.api.lib_data();
    this.libSize = library.lib_size || '0 b';
    delete library.lib_size;
    this._displayData(library);
    const syncData = await pywebview.api.sync_file();
    this._compareData(syncData);
    const favs = await pywebview.api.load_favorites();
    this._loadFavorites(favs);
    if (this.hasAttribute('favorites')) {
      this.toggleAttribute('favorites');
      this.favorites();
    }
    fadeIn(this.content);
    const ev = new CustomEvent('lib_size_updated', {
      detail:{lib_size: this.libSize}
    });
    this.dispatchEvent(ev);
  }

  /**
   * update library ui with currently playing album
   * 
   * @param {Object} details {artist, album, src}
   * @returns {void}
   */
  nowPlaying(details) {
    // selecte now playing link in quick links
    const link = qs('a[title="Playing"]', this.shadowRoot);

    // hide the link
    link.style.display = 'none';

    // blanket unmark all albums as playing
    qsa('.album', this.shadowRoot).forEach(el => {
      el.removeAttribute('playing');
    });

    // return if nothing is playing
    if (!details) {
      this.playlistCleared();
      return;
    }

    // find the album that is playing
    const newPlaying = qs(`[data-artist="${details.artist}"][data-album="${details.album}"]`, this.shadowRoot);
    
    // mark it as playing
    newPlaying.toggleAttribute('playing');

    // unhide the quick link now playing link
    link.style.removeProperty('display');

    // get the album info dialog
    const albumDialog = qs('#album-info');

    //  return if the dialog isn't present
    if (!albumDialog) return;

    // get all tracks in the open 
    const tracks = qsa('.track', albumDialog);

    // check each track to see if it is playing
    tracks.forEach(track => {
      track.removeAttribute('playing');
      const isPlaying = this._arePathsTheSame(track.dataset.src, details.path);
      if (isPlaying) {
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
    const artists = qsa('.artist', this.shadowRoot);
    const albums = qsa('.album', this.shadowRoot);

    if (this.hasAttribute('favorites')) {
      // hide all non favorited albums
      artists.forEach(async el => {
        if (!el.hasAttribute('favorite')) {
          await fadeOut(el);
          el.style.display = 'none'
        }
      });
      albums.forEach(async el => {
        if (!el.hasAttribute('favorite')) {
          await fadeOut(el);
          el.style.display = 'none';
        } 
      });
      qs('.a-z', this.shadowRoot).style.display = 'none';
    } else {
      // unhide all elements
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

  /**
   * favorites an album with the given artist and album name
   * 
   * @param {String} artist 
   * @param {String} album 
   */
  favoriteAlbum(artist, album) {
    
    // the album to be favorited
    const albumContainer = qs(`[data-artist="${artist}"][data-album="${album}"]`, this.shadowRoot);
    
    // toggle the favorite attribute
    albumContainer.toggleAttribute('favorite');
    
    // get all album elements with the favirote attribute
    const favs = this._getFavorites();
    
    // save to  file
    pywebview.api.save_favorites(JSON.stringify(favs, null, 2));
    
    // favorited artist element
    const artistContainer = qs(`.artist[data-artist="${artist}"]`, this.shadowRoot);
    if (albumContainer.hasAttribute('favorite') && !artistContainer.hasAttribute('favorite')) {
      artistContainer.toggleAttribute('favorite');
    } else if (!albumContainer.hasAttribute('favorite')) {
      artistContainer.removeAttribute('favorite');
    }


    // cleanup when unfavoriting an ablum while displaying favorites
    if (this.hasAttribute('favorites')) {

      // list all albums
      const albums = qsa('.album', this.shadowRoot);

      // hide all elements that are not favirotes
      albums.forEach(async el => {
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
    const percent = ((ndx + 1) / length) * 100;
    if (this.bar) this.bar.setAttribute('percent', percent);
    if (this.percent) this.percent.textContent = `${percent.toFixed(1)}%`;

    // emit event to update the button with progress
    const ev = new CustomEvent('library-scan', {
      detail:{percent: percent}
    });
    this.dispatchEvent(ev);

    await sleep(1000);

    if (percent === 100) {
      await fadeOut(this.bar);
      await sleep(100);
      await this.go();
    }
  }


  /**
   * player playlist cleared and we need to clean up inlist attributes
   */
  playlistCleared() {
    const albums = qsa('.album', this.shadowRoot);
    albums.forEach(albumElement => {
      albumElement.removeAttribute('inlist');
    });
  }

  /**
   * creates a header element with buttons and callbacks
   */
  async _header() {

    const scan = ce('audiosync-small-button');
    scan.id = 'scan';
    scan.title = 'Scan Library';
    scan.appendChild(await svgIcon('scan'));
    scan.onClick(_ => {
      scan.toggleAttribute('disabled');
      pywebview.api.create_json();
      new Toast('Library scan started');
    });

    const fav = ce('audiosync-small-button');
    fav.title = 'Favorites';
    fav.appendChild(await svgIcon('favorite'));
    fav.onClick(_ => this.favorites());

    const bar = ce('div');
    bar.classList.add('head');
    [
      scan,fav
    ].forEach(el => bar.appendChild(el));
    this.content.appendChild(bar);
  }

  /**
   * fill in page with data
   * 
   * @param {Object} data artists and albums list from lib_data.json *required*
   */
  _displayData(data) {
    //  no data 
    if (Object.keys(data).length === 0) {
      this._emptyLib();
      return;
    }

    // create a element for each artist & album
    for (const artist in data) {
      this._displayArtist(artist);
      for (let i = 0; i < data[artist].length; i++) {
        this._displayAlbum(artist, data[artist][i]);
      }
    }

    // no need to display in not enough chars used
    if (this._usedChars.length < 10) return;

    //  create quick links element
    const alphabet = ce('div');
    this.content.appendChild(alphabet);
    alphabet.classList.add('a-z');

    // create an link for each char in the array
    this._usedChars.forEach(char => {
      const link = ce('a');
      alphabet.appendChild(link);

      // determine the behavior of the link
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

      // scroll the desired element into view
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
   * gets favorites from ui and returns as an JSON object
   * 
   * @returns {Object}
   */
  _getFavorites() {
    // container for favorites
    const favList = {}

    // get elements with favorite attribute
    const favorites = qsa('.album[favorite]', this.shadowRoot);

    // build from the elements and return result
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
   * toggle favirote state for the elements passed in the passed in object
   * 
   * @param {Object} favs 
   */
  _loadFavorites(favs) {
    for (const artist in favs) {
      const ael = qs(`.artist[data-artist="${artist}"]`, this.shadowRoot);
      if (ael) ael.toggleAttribute('favorite');
      favs[artist].forEach(album => {
        const el = qs(`[data-artist="${artist}"][data-album="${album}"]`, this.shadowRoot);
        if (!el) return;
        el.toggleAttribute('favorite');
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
      const path = this._fixSlashes(array[i].path);
      array[i].art = `music${path}/cover.jpg`;
      array[i].path = `music${path}/${array[i].file}`;
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
    const x = ev.pageX;
    const y = ev.pageY;

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

    // play the album
    play.addEventListener('click', _ => {
      this.player.playAlbum(album);
      albumContainer.toggleAttribute('inlist');
    });
    
    const playlistAdd = fillButton('add', 'playlist');
    playlistAdd.classList.add('option');
    playlistAdd.addEventListener('click', _ => {
      this.player.addToPlaylist(album);
      new Toast(`${album.title} added to playlist`, 1);
      albumContainer.toggleAttribute('inlist');
    });
    if (!this.player.hasAttribute('playing') || albumContainer.hasAttribute('playing') || albumContainer.hasAttribute('inlist')) {
      playlistAdd.style.display = 'none';
    }

    // popup favorite button (toggles function, text & icon)
    let fav;
    if (albumContainer.hasAttribute('favorite')) {
      fav = fillButton('removeFav', 'unfavorite');
    } else {
      fav = fillButton('addFav', 'favorite');
    }
    fav.classList.add('option');
    fav.addEventListener('click', _ => {
      // mark / unmark in library ui
      this.favoriteAlbum(artist, album.title);
      // mark / unmark in audio player
      this.player.favorite({artist: artist, title: album.title, favorite: albumContainer.hasAttribute('favorite')});
    });

    // display album info dialog (eventualy)
    const info = fillButton('list', 'info');
    info.classList.add('option');
    info.addEventListener('click', _ => this._albumInfoDialog(artist, album, albumContainer));

    [
      play,
      playlistAdd,
      fav,
      info
    ].forEach(el => wrapper.appendChild(el));
    
    this.shadowRoot.appendChild(wrapper);
    await sleep(20);
    requestAnimationFrame(_ => wrapper.style.transform = 'scale3d(1,1,1)');
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
    const decodedPath1 = decodeURIComponent(path1);
    const decodedPath2 = decodeURIComponent(path2);
    
    // Normalize the paths to ensure consistent formatting
    const normalizedPath1 = decodedPath1.replace(/\\/g, '/');
    const normalizedPath2 = decodedPath2.replace(/\\/g, '/');

    // Compare the decoded and normalized paths
    return normalizedPath1 === normalizedPath2;
  }

  /**
   * open album info dialog
   * 
   * @param {String} artist
   * @param {Object} album
   * 
   */
  async _albumInfoDialog(artist, album, albumContainer) {
    const dialog = ce('audiosync-dialog');
    dialog.id = 'album-info';
    dialog.toggleAttribute('nopad');
    dialog.blocker.addEventListener('click', async _ => {
      dialog.close();
      await sleep(500);
      dialog.remove();
    });

    const favbutton = ce('audiosync-small-button');
    favbutton.classList.add('fav');
    favbutton.appendChild(await svgIcon('favorite'));
    if (!album.favorite) {
      favbutton.style.opacity = 0.5;
    }
    favbutton.onClick(_ => {
      //  toggle favorite state
      album.favorite = !album.favorite;
      // mark / unmark in the library UI 
      this.favoriteAlbum(artist, album.title);
      // mark / unmark in the audio player
      this.player.favorite({artist: artist, title: album.title, favorite: album.favorite});
      if (album.favorite) {
        favbutton.style.opacity = 1;
        favbutton.title = 'Unfavorite';
      } else {
        favbutton.style.opacity = 0.5;
        favbutton.title = 'Favorite';
      }
    });

    const addtoplaylist = ce('audiosync-small-button');
    addtoplaylist.classList.add('add');
    addtoplaylist.appendChild(await svgIcon('add'));
    if (!this.player.hasAttribute('playing') || albumContainer.hasAttribute('inlist')) addtoplaylist.style.display = 'none';
    addtoplaylist.onClick(async _ => {
      this.player.addToPlaylist(album);
      new Toast(`${album.title} added to playlist`, 1);
      albumContainer.toggleAttribute('inlist');
      await fadeOut(addtoplaylist);
      addtoplaylist.style.display = 'none';
    });

    const imgwrapper = ce('div');
    imgwrapper.classList.add('img-wrapper');
    
    const placeholder = ce('div');
    placeholder.classList.add('img-placeholder');
    placeholder.textContent  = 'Loading Image..';


    const canvas = ce('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = 450;
    canvas.height = 450;

    
    const img = ce('img');
    img.src = album.tracks[0].art;
    img.style.display = 'none';
    img.style.opacity = 0;
    img.onload = async _ => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pointone = getColorAtPoint(canvas, 40,40,30);
      const pointtwo = getColorAtPoint(canvas, (canvas.width - 40),40,30);

      addtoplaylist.setAttribute('color', getContrastColor(pointone));
      favbutton.setAttribute('color', getContrastColor(pointtwo));

      img.style.removeProperty('display');
      placeholder.style.display = 'none';
      await fadeIn(img);
    };

    [
      placeholder,
      img
    ].forEach(el => imgwrapper.appendChild(el));
    

    const tracklist = ce('div');
    tracklist.classList.add('tracklist');
    album.tracks.forEach((track, ndx) => {

      // shortened path to playing file
      const playing = this.player.player.src.replace('http://localhost:8000/', '');

      const tnum = ce('div');
      tnum.textContent = track.track;
      
      const title = ce('div');
      title.textContent = track.title;
      
      const container = ce('div');
      
      // is the cueently playing track this track
      if (this._arePathsTheSame(playing, track.path)) container.toggleAttribute('playing');
      container.dataset.src = track.path;
      container.classList.add('track');
      container.addEventListener('click', _ => {
        // check if tracks are in playlist
        const tracksInPlaylist = areElementsPresent(album.tracks, this.player.playlist);

        if (tracksInPlaylist && this.player.playlist.length === album.tracks.length) {
          // tracks in playlist are this album and only this album it is safe to play ndx directly
          this.player.playNdx(ndx);
        } else if (tracksInPlaylist) {
          // tracks are present with tracks from other albums
          const albumStartsAt = indexOfElement(this.player.playlist, album.tracks[0]);
          this.player.playNdx(albumStartsAt + ndx);
        } else {
          // not in playlist. will overwrite current playlist and play this album starting on the song clicked
          this.player.playAlbum(album, ndx);
          // set playlist "inline" state
          albumContainer.toggleAttribute('inlist');
        }
      });

      [
        tnum,
        title
      ].forEach(el => container.appendChild(el));
      tracklist.appendChild(container);
    });

    [
      addtoplaylist,
      favbutton,
      imgwrapper,
      tracklist
    ].forEach(el => dialog.appendChild(el));


    qs('body').appendChild(dialog);
    await sleep(20);
    dialog.open();
    await sleep(200);
    const p = qs('audiosync-dialog > .tracklist > .track[playing]');
    if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    albumContainer.dataset.album = album.title;
    albumContainer.classList.add('album');
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
