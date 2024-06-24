import {qs, svgIcon, ce, elementWidth, elementHeight, animateElement, getContrastColor, objectToCSS, sleep, qsa, createRipple, convertToHex, parseCSS, fadeOut, fadeIn, calcPercentage} from './helpers.js';
import {getIcon} from './getIcon/getIcon.js';

class AudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});

    // currently playing playlist
    this.playlist = [];

    // count up or count down
    this.elapsedTime = true;

    // CSS object (will be converted to CSS string by objectToCSS())
    const CSS_OBJECT = {
      '.background': {
        position: 'fixed',
        display: 'flex',
        'flex-direction': 'row',
        'justify-content': 'center',
        'align-items': "center",
        bottom: 0,
        left: 0,
        right: 0,
        height: '72px',
        background: 'var(--main-color)',
        transform: 'translateY(100%)',
        color: 'var(--text-color)',
        'z-index': 1,
        overflow: 'hidden',
        'border-top': 'var(--seperator-line)'
      },
      '#fbg': {
        position: 'fixed',
        display: 'flex',
        'flex-direction': 'row',
        'justify-content': 'center',
        'align-items': "center",
        bottom: '72px',
        left: 0,
        right: 0,
        top: 'var(--header-height)',
        transform: 'translateY(100%)',
        'background-color': 'rgba(var(--main-rgb),0.9)',
        color: 'var(--text-color)'
      },
      '#fbg > .img-wrapper': {
        'box-shadow': '0 2px 2px 0 rgba(0,0,0,0.14),0 1px 5px 0 rgba(0,0,0,0.12),0 3px 1px -2px rgba(0,0,0,0.2)',        
        border: "5px solid rgba(51,51,51,0.2)",
        background: 'rgba(51,51,51,0.2)',
        overflow: 'hidden',
        'border-radius': '24px',
        transition: 'var(--button-bg-animation)',
        height: '450px',
        width: '450px'
      },
      '#fbg > .img-wrapper > img': {
        height: "100%",
        width: '100%'
      },
      '.buffered': {
        height: '5px',
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
        'background-color': 'rgba(51,51,51,0.2)',
        transform: 'translateX(-100%)'
      },
      '.progress': {
        height: '5px',
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
        'background-color': 'var(--pop-color)',
        transform: 'translateX(-100%)',
        'transition-property': 'color',
        'transition-duration': '300ms',
        'transition-timing-function': 'ease'
      },
      '.click-strip': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '8px',
        'z-index': 1,
        cursor: 'pointer'
      },
      ".popup::-webkit-scrollbar": {
        width: 0
      },
      '.popup': {
        height:`451px`,
        width: `450px`,
        background: 'rgba(var(--main-rgb),0.5)',
        color: 'var(--text-color)',
        'transform-origin': 'bottom right',
        transform: 'scale3d(0,0,0)',
        position: 'fixed',
        'overflow-y': 'auto',
        'border-radius': '18px'
      },
      '.popup > .track': {
        cursor: "pointer",
        display: 'flex',
        'flex-direction': 'row',
        "text-transform": "uppercase",
        "border-bottom": "var(--seperator-line)",
        'will-change': 'background',
        transition: 'var(--button-bg-animation)'
      },
      '.popup > .track > div:first-child': {
        'margin-left': '8px',
        padding: '8px',
        'margin-right': '16px'
      },
      '.popup > .track > div:nth-child(2)': {
        padding: '8px',
        width: "100%",
        overflow: 'hidden',
        transform: 'translateX(-15px)',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'
      },
      '.popup > .track:hover': {
        background: 'var(--hover-color)'
      },
      '.popup > div[playing]': {
        background: 'rgba(100, 100, 100, 0.582)',
        cursor:'auto'
      },
      svg: {
        height: '24px',
        width: '24px'
      },
      '#play': {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      },
      '#play > svg': {
        height:'40px',
        width: '40px'
      },
      '#next': {
        position: 'fixed',
        top: '50%',
        right: '50%',
        transform: 'translate(-50%, -50%) translateX(85px)'
      },
      '#back': {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) translateX(-50px)'
      },
      "#duration": {
        position: 'fixed',
        bottom: '5px',
        right: '10px',
        'font-size': '11px',
        cursor:'pointer'
      },
      '#duration > *': {
        'pointer-events': 'none'
      },
      '#info': {
        "text-transform": "uppercase",
        position: 'fixed',
        bottom:'5px',
        left: '10px',
        overflow: 'hidden',
        'font-size': '11px',
        'max-height': '14px',
        'max-width': '300px',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis'      
      },
      '#expand': {
        position: 'fixed',
        left: '20px',
        bottom: '20px'
      },
      '#favorite': {
        position:'fixed',
        top: '20px',
        right: '20px',
        transition: 'color 500ms ease'
      },
      '#playlist': {
        transition: 'transform 300ms cubic-bezier(.33,.17,.85,1.1)',
        position: 'absolute',
        'z-index': 1,
        transform: `translateY(${(window.innerHeight / 2) - 190}px)`
      },
      '@media screen and (min-height: 750px) and (min-width: 620px)': {
        '#fbg > .img-wrapper': {
          height: '550px',
          width: '550px'
        },
        '.popup': {
          height: '550px',
          width: '550px'
        }
      },
      '@media screen and (min-height: 850px) and (min-width: 720px)': {
        '#fbg > .img-wrapper': {
          height: '650px',
          width: '650px'
        },
        '.popup': {
          height: '650px',
          width: '650px'
        }
      },
      '@media screen and (min-width: 1200px)': {
        '.background': {
          left: "300px"
        },
        '#fbg': {
          left: "300px"
        },
        '#info': {
          'max-width': '450px'
        }
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

    this.library = qs('music-library');
    this.lastUpdate = 0;

    // pause timer
    // hide ui if paused for period of time
    this._pauseTimer = 0;

    // cache svg icon data strings
    this.playIcon = getIcon('play');
    this.pauseIcon = getIcon('pause');

    // bind this
    this._showMini = this._showMini.bind(this);
    this._pauseTimeOut = this._pauseTimeOut.bind(this);
    this._checkBuffered = this._checkBuffered.bind(this);
    this.addToPlaylist = this.addToPlaylist.bind(this);

    // push styles to <style> element
    const ELEMENT_STYLES = ce('style');
    ELEMENT_STYLES.textContent = objectToCSS(CSS_OBJECT);

    // Audio player (why we are here after all)
    this.player = new Audio();

    // bind all the callbacks
    this.player.onloadedmetadata = this._onMetaData.bind(this);
    this.player.onplay = this._onPlay.bind(this);
    this.player.onplaying = this._onPlaying.bind(this);
    this.player.onstalled = this._onStalled.bind(this);
    this.player.onwaiting = this._onWaiting.bind(this);
    this.player.ondurationchange = this._onDurationChange.bind(this);
    this.player.ontimeupdate = this._onTime.bind(this);
    this.player.onpause = this._onPause.bind(this);
    this.player.onended = this._onEnd.bind(this);
    this.player.oncanplaythrough = this._canPlayThrough.bind(this);
    this.player.onloadeddata = this._onLoadedData.bind(this);

    // always check buffered ammount
    setInterval(this._checkBuffered, 100);

    // change position of action button when window resized
    window.addEventListener('resize', _ => {
      const CSS = parseCSS(qs('style', this.shadowRoot).textContent);
      CSS['#playlist'].transform = `translateY(${(window.innerHeight / 2) - 190}px)`;
      qs('style', this.shadowRoot).textContent = objectToCSS(CSS);
    });

    // populate shadow DOM
    [
      ELEMENT_STYLES,
      this.player
    ].forEach(el => this.shadowRoot.appendChild(el));
  }

  /**
   * toggles display of favorite button in fullscreen
   * 
   * @returns {void}
   */
  _fullScreenFavoriteDisplay(favEl) {
    
    let FULLSCREEN_FAVORITE_TOGGLE_BUTTON = qs('#favorite', this.shadowRoot);
    if (!FULLSCREEN_FAVORITE_TOGGLE_BUTTON && !favEl) return;
    
    if (favEl) FULLSCREEN_FAVORITE_TOGGLE_BUTTON = favEl;

    if (this.isFavorite === null || this.isFavorite === undefined) {
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.style.opacity = 0;
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.style.display = 'none';
    } else if (this.isFavorite) {
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.title = 'Unfavorite';
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.style.opacity = 1;
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.style.display = 'block';
    } else {  
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.title = 'Favorite';
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.style.opacity = 0.2;
      FULLSCREEN_FAVORITE_TOGGLE_BUTTON.style.display = 'block';
    }
  }

  /**
   * callback for <music-library> favorite added event
   * 
   * @param {Object} data 
   * @returns {void}
   */
  favorite(data) {
    // if favorited album is the currently playing ablum
    if (this.artist === data.artist && this.albumTitle === data.title) {
      // toggle state
      this.isFavorite = data.favorite;

      // update UI
      this._fullScreenFavoriteDisplay();
    }
  }

  /**
   * animate action button visable on screen
   */
  onScreen() {
    return new Promise(resolve => {
      let tend = _ => {
        this.fab.removeEventListener('transitionend', tend);
        resolve();
      }
      this.fab.addEventListener('transitionend', tend);
      requestAnimationFrame(_ => this.fab.style.transform = 'translateY(0)');
    });
  }
  
  /**
   * animate action button off screen
   */
  offScreen() {
    return new Promise(resolve => {
      let tend = _ => {
        this.fab.removeEventListener('transitionend', tend);
        resolve();
      }
      this.fab.addEventListener('transitionend', tend);
      requestAnimationFrame(_ => this.fab.style.removeProperty('transform'));
    });
  }

  /**
   * minimize the album art overlay
   * 
   * @returns {void}
   */
  async minimize() {
    const FULLSCREEN_BACKGROUND = qs('#fbg', this.shadowRoot);
    if (!FULLSCREEN_BACKGROUND) return;
    const PLAYLIST_POPUP = qs('.popup', this.shadowRoot);
    let headerButtons;
    if (qs('audiosync-pages').getAttribute('selected') === '0') {
      headerButtons = qsa('.music');
    } else {
      headerButtons = qsa('.podcast');
    }
    if (PLAYLIST_POPUP) {
      qs('img', this.shadowRoot).style.removeProperty('filter');
      await animateElement(PLAYLIST_POPUP, 'scale3d(0,0,0)', 100);
      PLAYLIST_POPUP.remove();
    }
    await this.offScreen();
    animateElement(qs('#expand', this.shadowRoot), 'rotate(0deg)', 300);
    headerButtons.forEach(el => {
      el.style.removeProperty('display');
      fadeIn(el);
    });
    await animateElement(FULLSCREEN_BACKGROUND, 'translateY(100%)', 300);
    await sleep(100);
    FULLSCREEN_BACKGROUND.remove();
    this.removeAttribute('fullscreen');
  }

  /**
   * opens the album art overlay
   * 
   * @returns {void}
   */
  async fullScreen() {
    if (qs('#fbg', this.shadowRoot)) return;

    // art
    const IMG = ce('img');
    IMG.id = 'fsart';
    IMG.src = this.art;

    const IMAGE_WRAPPER = ce('div');
    IMAGE_WRAPPER.classList.add('img-wrapper');
    IMAGE_WRAPPER.appendChild(IMG);
    
    // background 
    const FULLSCREEN_BACKGROUND = ce('div');
    FULLSCREEN_BACKGROUND.id = 'fbg';
    FULLSCREEN_BACKGROUND.style.background = `linear-gradient(to bottom, ${this.palette.top}, ${this.palette.bottom})`;

    // playlist fab
    const PLAYLIST_BUTTON = ce('audiosync-fab');
    PLAYLIST_BUTTON.id = 'playlist';
    PLAYLIST_BUTTON.appendChild(svgIcon('list'));
    PLAYLIST_BUTTON.onClick(ev => this._playlistPopup(ev));
    PLAYLIST_BUTTON.setAttribute('color', this.palette.fab);
    PLAYLIST_BUTTON.title = 'Playlist';
    this.fab = PLAYLIST_BUTTON;  

    const FAVORITE_TOGGLE_BUTTON = ce('audiosync-small-button');
    FAVORITE_TOGGLE_BUTTON.id = 'favorite';
    this._fullScreenFavoriteDisplay(FAVORITE_TOGGLE_BUTTON);
    FAVORITE_TOGGLE_BUTTON.appendChild(svgIcon('favorite'));
    FAVORITE_TOGGLE_BUTTON.setAttribute('color', this.palette.contrast);
    FAVORITE_TOGGLE_BUTTON.onClick(_ => {
      this.isFavorite = !this.isFavorite;
      this._fullScreenFavoriteDisplay();
      // pass favorite to library
      this.library.favoriteAlbum(this.artist, this.albumTitle);
    });
    
    // push to dom
    [
      FAVORITE_TOGGLE_BUTTON,
      IMAGE_WRAPPER,
      PLAYLIST_BUTTON
    ].forEach(el => FULLSCREEN_BACKGROUND.appendChild(el));
    this.shadowRoot.appendChild(FULLSCREEN_BACKGROUND);
    
    await sleep(100);

    let postionFab = _ => {
      let offset = 190;

      if (window.innerHeight > 750 && window.innerWidth > 620) offset += 50;

      if (window.innerHeight > 850 && window.innerWidth > 720) offset += 50;

      let centerX = elementWidth(FULLSCREEN_BACKGROUND) / 2;
      let centerY = elementHeight(FULLSCREEN_BACKGROUND) / 2;
      let newPositionX = centerX + offset;
      let newPositionY = centerY + offset;
  
      PLAYLIST_BUTTON.style.left = newPositionX + 'px';
      PLAYLIST_BUTTON.style.top = newPositionY + 'px';
    };

    postionFab();
    window.addEventListener('resize', _ => postionFab());

    qsa('.music, .podcast').forEach(async el => {
      await fadeOut(el);
      el.style.display = 'none';
    });

    // animate 
    qs('scroll-element').offScreen();
    animateElement(qs('#expand', this.shadowRoot), 'rotate(180deg)', 300);
    await animateElement(FULLSCREEN_BACKGROUND, 'translateY(0%)', 300);
    this.toggleAttribute('fullscreen');
    this.onScreen();
  }

  /**
   * play a specific playlist index number
   * 
   * @param {Number} ndx 
   */
  playNdx(ndx) {
    this.playing = ndx;
    this._changeSrc();
  }

  /**
   * add an albums tracks to playlist and play it from beginning
   * 
   * @param {Object} albumInfo 
   * @param {Number} ndx *optional*
   */
  playAlbum(albumInfo, ndx) {
    // reset / set index
    this.playing = ndx || 0;
    if (!ndx) this.library.playlistCleared();
    // set playlist * clone array to prevent album info issue on <music-library>
    qs('audiosync-podcasts').resetPlaylist();
    qs('music-library').resetPlaylist();
    this.playlist = albumInfo.tracks.slice();
    if (!this.playlist.length) return;
    this._changeSrc();
  }

  /**
   * add an albums tracks to the playlist
   * 
   * @param {Object} albumInfo 
   */
  addToPlaylist(albumInfo) {
    // clone array to prevent album info issue on <music-library>
    const TRACKS_TO_ADD = albumInfo.tracks.slice();
    TRACKS_TO_ADD.forEach(track => this.playlist.push(track));
  }

  /**
   * move buffered progress car
   * 
   * @returns {void}
   */
  _checkBuffered() {
    // do nothing if no file is loaded
    if (!this.player.src) return;

    // bar may not exist no mini player created until needed
    const BUFFER_BAR = qs('.buffered', this.shadowRoot);
    if (!BUFFER_BAR) return;

    // buffered data
    if (this.player.buffered.length > 0) {
      let buffered = 0;
      for (let i = 0; i < this.player.buffered.length; i++) {
        buffered = Math.max(buffered, this.player.buffered.end(i));
      }
      const BUFFERED_PRECENTAGE = calcPercentage(buffered, this.player.duration);
      BUFFER_BAR.style.transform = `translateX(-${100 - BUFFERED_PRECENTAGE}%)`;
    } else {
      BUFFER_BAR.style.transform = `translateX(-100%)`;
    }
  }

  /**
   * animates mini player ui onto screen
   * 
   * @returns {Promise}
   */
  async _showMini() {
    if (qs('.background', this.shadowRoot)) return;
    const MINI_PLAYER_UI = await this._miniUI();
    this.shadowRoot.appendChild(MINI_PLAYER_UI);
    await sleep(20);
    this.toggleAttribute('playing');
    animateElement(MINI_PLAYER_UI, 'translateY(0)', 150);
  }

  /**
   * generates the mini player ui
   * 
   * @returns {HTMLElement}
   */
  async _miniUI() {
    // play progress bar
    const PROGRESS_BAR = ce('div');
    PROGRESS_BAR.classList.add('progress');
 
    // buffered amount bar
    const BUFFER_BAR = ce('div');
    BUFFER_BAR.classList.add('buffered');

    // click location for scrobbeling through a track **broken on windows**
    const CLICK_STRIP = ce('div');
    CLICK_STRIP.classList.add('click-strip');
    CLICK_STRIP.addEventListener('click', e => {
      // time left
      const DURATION = this.player.duration;
      // window data
      const RECT = CLICK_STRIP.getBoundingClientRect();
      // click x
      const RELATIVEX = e.clientX - RECT.left;
      // time in seconds to set player.currentTime
      const NEW_POSITION = (RELATIVEX / RECT.width) * DURATION;
      // set time
      this.player.currentTime = NEW_POSITION;
    });

    // fullscreen toggle
    const FULLSCREEN_TOGGLE_BUTTON = ce('audiosync-small-button');
    FULLSCREEN_TOGGLE_BUTTON.id = 'expand';
    FULLSCREEN_TOGGLE_BUTTON.appendChild(svgIcon('expand'));
    FULLSCREEN_TOGGLE_BUTTON.onClick(_ => {
      if (this.hasAttribute('fullscreen')) {
        this.minimize();
        return;
      }
      this.fullScreen();
    });

    // previous track button 
    const PREVIOUS_TRACK_BUTTON = ce('audiosync-small-button');
    PREVIOUS_TRACK_BUTTON.id = 'back';
    PREVIOUS_TRACK_BUTTON.style.display = 'none';
    PREVIOUS_TRACK_BUTTON.appendChild(svgIcon('previous'));
    PREVIOUS_TRACK_BUTTON.onClick(_ => {
      // block back if beginning of playlist
      if (this.playing <= 0) return;
      // incriment this.playing index
      this.playing--;
      // update src attribute
      this._changeSrc();
    });
    

    const PLAY_PAUSE_ICON = svgIcon('pause');
    qs('path', PLAY_PAUSE_ICON).id = 'playIcon';

    // play button
    const PLAY_PAUSE_BUTTON = ce('audiosync-small-button');
    PLAY_PAUSE_BUTTON.id = 'play';
    PLAY_PAUSE_BUTTON.appendChild(PLAY_PAUSE_ICON);
    PLAY_PAUSE_BUTTON.onClick(_ => {
      // toggle playback
      if (this.player.paused) {
        this.player.play();
      } else {
        this.player.pause();
      }
    });

    // next track button
    const NEXT_TRACK_BUTTON = ce('audiosync-small-button');
    NEXT_TRACK_BUTTON.id = 'next';
    NEXT_TRACK_BUTTON.appendChild(svgIcon('next'));
    NEXT_TRACK_BUTTON.onClick(_ => {
      // block next if end of playlist
      if (this.playing >= this.playlist.length) return;
      // incriment this.playing index
      this.playing++;
      // change src attribute
      this._changeSrc();
    });

    // elapsed time
    const DURATION_TEXT = ce('div');
    DURATION_TEXT.id = 'duration';
    DURATION_TEXT.addEventListener('click', _ => this.elapsedTime = !this.elapsedTime);

    // artist / title
    const CURRENTLY_PLAYING_TEXT = ce('div');
    CURRENTLY_PLAYING_TEXT.id = 'info';
    CURRENTLY_PLAYING_TEXT.textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;

    // mini player UI background
    const MINI_PLAYER_UI_BACKGROUND = ce('div');
    MINI_PLAYER_UI_BACKGROUND.classList.add('background');
    [
      CLICK_STRIP,
      BUFFER_BAR,
      PROGRESS_BAR,
      FULLSCREEN_TOGGLE_BUTTON,
      CURRENTLY_PLAYING_TEXT,
      DURATION_TEXT,
      PREVIOUS_TRACK_BUTTON,
      PLAY_PAUSE_BUTTON,
      NEXT_TRACK_BUTTON
    ].forEach(el => MINI_PLAYER_UI_BACKGROUND.appendChild(el));
    return MINI_PLAYER_UI_BACKGROUND;
  }

  /**
   * update playlist ui, cache art, change <audio> src attribute and call play()
   */
  _changeSrc() {
    // update playlist UI 
    this._updatePlaylistUI();

    const NOW_PLAYING = this.playlist[this.playing];

    if (!NOW_PLAYING) return;

    this.artist = NOW_PLAYING.artist;
    this.albumTitle = NOW_PLAYING.album;
    this.art = NOW_PLAYING.art;

    const album_element = qs(`[data-artist="${this.artist}"][data-album="${this.albumTitle}"]`, qs('music-library').shadowRoot);
    
    if (album_element) {
      this.isFavorite = album_element.hasAttribute('favorite');
    } else {
      this.isFavorite = null;
    }

    // cache art also sets opacity of favorite button to indicate favorite status
    this._cacheImage(this.art);

    const PLAYING_ART = qs('#fsart', qs('#fbg > .img-wrapper', this.shadowRoot));
    if (PLAYING_ART) PLAYING_ART.src = this.art;

    const INFO = qs('#info', this.shadowRoot);
    if (INFO) INFO.textContent = `${NOW_PLAYING.artist} - ${NOW_PLAYING.title}`;
    
    // set src
    this.player.src = NOW_PLAYING.path;
    // load and play the file
    this.player.load();
    this.player.play();
    this.library.nowPlaying(NOW_PLAYING);
    qs('audiosync-podcasts').nowPlaying(NOW_PLAYING);
  }

  /**
   * creates a popup option dialog with track information
   * 
   * @returns {void}
   */
  async _playlistPopup() {
    if (qs('.popup', this.shadowRoot)) return;

    // create playlist popup
    const POPUP = ce('div');
    POPUP.classList.add('popup');
    for (let i = 0; i < this.playlist.length; i++) {
      const TRACK_WRAPPER = ce('div');
      TRACK_WRAPPER.classList.add('track');
      if (this.playing === i) {
        TRACK_WRAPPER.toggleAttribute('playing');
      }
      // track number
      const TRACK_NUMBER = ce('div');
      TRACK_NUMBER.textContent = this.playlist[i].track;
      // track title
      const TRACK_TITLE = ce('div');
      TRACK_TITLE.textContent = this.playlist[i].title;
      [
        TRACK_NUMBER,
        TRACK_TITLE
      ].forEach(el => TRACK_WRAPPER.appendChild(el));

      // clicked on a track in playlist
      TRACK_WRAPPER.addEventListener('click', eve => {
        if (i === this.playing) return;
        createRipple(eve)
        this.playing = i;
        this._changeSrc();
      }); 
      POPUP.appendChild(TRACK_WRAPPER);
    }

    // push to DOM
    const FULLSCREEN_BACKGROUND = qs('#fbg', this.shadowRoot);
    FULLSCREEN_BACKGROUND.appendChild(POPUP);
    await sleep(100);

    // animate into view
    await animateElement(POPUP, 'scale3d(1,1,1)', 150);
    qs('img', this.shadowRoot).style.filter = 'blur(10px)';

    // close and remove popup
    const ELEMENT_CLICKED = async _ => {
      qs('img', this.shadowRoot).style.removeProperty('filter');
      await animateElement(POPUP, 'scale3d(0,0,0)', 150);
      await sleep(500);
      POPUP.remove();
    };
    // popup.addEventListener('mouseleave', clicked);
    FULLSCREEN_BACKGROUND.addEventListener('click', ELEMENT_CLICKED);
    await sleep(50);

    // ensure currently playing is in view
    const PLAYING = qs('div[playing]', POPUP);
    PLAYING.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * updates the playlist ui with now playing indicator
   * 
   * @returns {void}
   */
  async _updatePlaylistUI() {
    const POPUP = qs('.popup', this.shadowRoot);
    if (!POPUP) return;
    const DIVS = qsa('.track', POPUP);
    DIVS.forEach(div => div.removeAttribute('playing'));
    await sleep(100);
    DIVS[this.playing].toggleAttribute('playing');
    DIVS[this.playing].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * detect if color is grey 
   * 
   * @param {Number} r 
   * @param {Number} g 
   * @param {Number} b 
   * 
   * @returns {Boolean}
   */
  _isGrey(r, g, b) {
    const THRESHOLD = 15;
    return Math.abs(r - g) < THRESHOLD && Math.abs(r - b) < THRESHOLD && Math.abs(g - b) < THRESHOLD;
  }

  /**
   * brightness value 1 white 0 black
   * 
   * @param {Number} r 
   * @param {Number} g 
   * @param {Number} b
   *  
   * @returns {Number}
   */
  _getLuminence(r,g,b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  }

  /**
   * loads an image and gets a palette from the image
   * 
   * @param {String} url 
   */
  _cacheImage(url) {
    // cache image & color;
    const IMG = ce('img');
    IMG.src = url;
    IMG.onload = _ => {
      const THIEF = new ColorThief();
      const STOLEN_PALETTE = THIEF.getPalette(IMG, 15);

      // safe range where should look decent in either dark or light mode
      let brightnessLimit = 0.7; 
      let darknessLimit = 0.3;
      
      // default color index values
      let popNdx = 0;
      let topNdx = 1;

      // find a color for top of gradient
      for (let i = 1; i < STOLEN_PALETTE.length; i++) {
        let r = STOLEN_PALETTE[i][0];
        let g = STOLEN_PALETTE[i][1];
        let b = STOLEN_PALETTE[i][2];
        const LUMINENCE = this._getLuminence(r,g,b);
        const IS_GREY = this._isGrey(r,g,b);
        if (!IS_GREY && LUMINENCE < brightnessLimit && LUMINENCE > darknessLimit) {
          topNdx = i;
          break;
        }
      }
      
      // loop through colors for goldie locks color to use for --pop-color
      for (let i = 0; i < STOLEN_PALETTE.length; i++) {
        let r = STOLEN_PALETTE[i][0];
        let g = STOLEN_PALETTE[i][1];
        let b = STOLEN_PALETTE[i][2];
        if (i !== topNdx) {
          const LUMINENCE = this._getLuminence(r,g,b);
          const IS_GREY = this._isGrey(r,g,b);
          if (!IS_GREY && LUMINENCE < brightnessLimit && LUMINENCE > darknessLimit) {
            popNdx = i;
            break;
          }
        }
      }

      // console.log(popNdx, topNdx);

      // --pop-color rgb string
      const POP_RGB_STRING = `${STOLEN_PALETTE[popNdx][0]},${STOLEN_PALETTE[popNdx][1]},${STOLEN_PALETTE[popNdx][2]}`;
      const TOP_RGB_STRING = `${STOLEN_PALETTE[topNdx][0]},${STOLEN_PALETTE[topNdx][1]},${STOLEN_PALETTE[topNdx][2]}`;
      
      // gradient top color in hex value 
      const HEX = convertToHex(`rgb(${TOP_RGB_STRING})`);

      // color palette
      this.palette = {
        fab: `rgb(${POP_RGB_STRING})`, // fab / accent color
        variable: `${POP_RGB_STRING}`, // for css variable avaliable @ --pop-color
        top: `rgb(${TOP_RGB_STRING})`, // player art gradient top color
        bottom: `var(--background-color)`, // player bg gradient bottom color
        contrast: getContrastColor(HEX) // contrasting color to color used on buttons at top of gradient
      };

      // fullscreen player element
      const FULLSCREEN = qs('#fbg', this.shadowRoot);

      // update colors if fullscreen
      if (FULLSCREEN) {

        // set colors for gradient
        FULLSCREEN.style.background = `linear-gradient(to bottom, ${this.palette.top}, ${this.palette.bottom})`;
        
        // set action button color
        qs('audiosync-fab', FULLSCREEN).setAttribute('color', this.palette.fab);
        
        this._fullScreenFavoriteDisplay();
      }

      // fire event to update app ui element with new color
      const EV = new CustomEvent('image-loaded', {
        detail:{palette: this.palette}
      });
      this.dispatchEvent(EV);

      // destroy img element.  URL cached additional <img> elements with this url should load instant
      IMG.remove();
      // maybe im wrong /shrug it seems to work
    };
  }

  /**
   * The browser estimates it can play the media up to its end without stopping for content buffering.
   * 
   * @param {Event} ev 
   */
  _canPlayThrough(ev) {
    // console.log(ev);
  }

  /**
   * The duration attribute has been updated.
   * 
   * @param {Event} ev 
   * @returns {Promise}
   */
  _onDurationChange(ev) {
    const BAR = qs('.progress', this.shadowRoot);
    if (!BAR) return;
    BAR.style.transform = `translateX(-100%)`;
  }

  /**
   * The time indicated by the currentTime attribute has been updated.
   * 
   * @param {Event} ev 
   * @returns {Promise}
   */
  _onTime(ev) {
    // hide / show previous button 
    const BACK = qs('#back', this.shadowRoot);
    if (BACK) {
      if (!this.playlist[this.playing - 1]) {
        BACK.style.display = 'none';
      } else {
        BACK.style.removeProperty('display');
      }
    }

    // hide / show next button
    const NEXT = qs('#next', this.shadowRoot);
    if (NEXT) {
      if (!this.playlist[this.playing + 1]) {
        NEXT.style.display = 'none';
      } else {
        NEXT.style.removeProperty('display');
      }
    }

    const PLAYER = ev.target;
    const CT = PLAYER.currentTime;
    const DURATION = PLAYER.duration - CT;
    const MINS = Math.floor(CT / 60);
    const SECS = Math.floor(CT % 60).toString().padStart(2, '0');
    const PROGRESS = calcPercentage(CT, PLAYER.duration);
    const PROGRESS_BAR = qs('.progress', this.shadowRoot);
    const DURATION_TEXT = qs('#duration', this.shadowRoot);
    // if (duration < 100) this._cacheNext();
    if (PROGRESS_BAR) PROGRESS_BAR.style.transform = `translateX(-${100 - PROGRESS}%)`;
    if (!this.elapsedTime) {
      const DMINS = Math.floor(DURATION / 60);
      const DSECS = Math.floor(DURATION % 60).toString().padStart(2, '0');
      if (DURATION_TEXT) DURATION_TEXT.textContent = `${DMINS}:${DSECS}`;
    } else {
      if (DURATION_TEXT) DURATION_TEXT.textContent = `${MINS}:${SECS}`;
    }

    const NOW = new Date().getTime();
    if ((NOW - this.lastUpdate) < 1000) return;
    this.library.nowPlaying(this.playlist[this.playing]);
    qs('audiosync-podcasts').nowPlaying(this.playlist[this.playing]);
    this.lastUpdate = NOW;
  }

  /**
   * The metadata has been loaded.
   * 
   * @param {Event} ev 
   */
  async _onMetaData() {
    await this._showMini();
  }

  /**
   * The first frame of the media has finished loading.
   * 
   * @param {Event} ev 
   */
  _onLoadedData(ev) {

  }

  /**
   * Playback has stopped because the end of the media was reached.
   * 
   * @param {Event} ev 
   */
  _onEnd(ev) {
    // check if end if playlist
    if (!this.playlist[this.playing + 1]) {
      this._pauseTimeOut();
      return;
    }
    // incriment this.playing index
    this.playing++;
    this._changeSrc();
  }

  /**
   * Playback has begun.
   * 
   * @returns {Promise}
   */
  async _onPlay() {
    if (this._pauseTimer) {
      clearTimeout(this._pauseTimer);
      this._pauseTimer = 0;
    }
  }

  /**
   * close player UI
   */
  async _pauseTimeOut() {
    this.library.nowPlaying();
    qs('audiosync-podcasts').nowPlaying();
    await this.minimize();
    const MINI_PLAYER_UI = qs('.background', this.shadowRoot);
    await animateElement(MINI_PLAYER_UI, 'translateY(100%)', 150);
    MINI_PLAYER_UI.remove();
    this.removeAttribute('playing');
    this.player.src = '';
    this.playlist = [];
    this.playing = 0;
  }

  /**
   * Playback has been paused.
   * 
   * @returns {Promise}
   */
  async _onPause() {
    const ICON = qs('#playIcon', qs('#play', this.shadowRoot));
    // wants to change menu icon when first loading a playlist
    if (ICON.getAttribute('d') === "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z") return;
    ICON.setAttribute('d', this.playIcon.d);
    this._pauseTimer = setTimeout(this._pauseTimeOut, 30000)
  }

  /**
   * Playback is ready to start after having been paused or delayed due to lack of data.
   * 
   * @param {Event} ev 
   */
  _onPlaying(ev) {
    const ICON = qs('#playIcon', qs('#play', this.shadowRoot));
    // wants to change menu icon when first loading a playlist
    if (ICON.getAttribute('d') === "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z") return;
    ICON.setAttribute('d', this.pauseIcon.d);
  }

  /**
   * The user agent is trying to fetch media data, but data is unexpectedly not forthcoming.
   * 
   * @param {Event} ev 
   */
  _onStalled(ev) {
    // error notification toast and close player window
    // console.log(ev);
  }

  /**
   * Playback has stopped because of a temporary lack of data
   * 
   * @param {*} ev 
   */
  _onWaiting(ev) {
    // some kind of loading animation
    // console.log(ev);
  }
}
customElements.define('audiosync-player', AudioPlayer);