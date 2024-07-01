import { ce, dropFirstFolder, getFileExtension, appendElements, qs, qsa, fadeOut, fadeIn, elementWidth, elementHeight, svgIcon, convertToHex, getIcon, findGoldieLocksColor, rgbToHex, getContrastColor, sleep, debounce, mmss, calcPercentage, toggleAttribute } from '../helpers.js'

// fix favorite button

/**
 * UI for managing playback of audio files
 * @class
 * @extends HTMLElement
 * 
 * @this AudioPlayer
 * 
 * @fires now-playing 
 * @fires image-loaded
 * @fires playlist-reset
 * 
 */
class AudioPlayer extends HTMLElement {
  static get observedAttributes() {
    return ['alt-css', 'playing', 'full-screen'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /**
   * element connect
   * @function
   * @private
   *
   * @returns {Void}
   * 
   * @example
   * document.querySelector('body').appendChild(podcastLibrary);
   */
  connectedCallback() {
    const altCss = this.getAttribute('alt-css');
    const elementStyles = ce('link');
    elementStyles.setAttribute("rel", "stylesheet");
    elementStyles.setAttribute("href", altCss || "./js/audiosync-player/audiosync-player.css");

    this.musicLibrary = qs('music-library');

    this.playlist = [];

    // count up or count down time
    this.elapsedTime = true;

    this.playIcon = getIcon('play');
    this.pauseIcon = getIcon('pause');

    this.player = new Audio();

    this.favorite = this.favorite.bind(this);

    this.player.onloadedmetadata = this._onMetaData.bind(this);
    this.player.onplay = this._onPlay.bind(this);
    this.player.onplaying = this._onPlaying.bind(this);
    this.player.onstalled = this._onStalled.bind(this);
    this.player.onwaiting = this._onWaiting.bind(this);
    this.player.ondurationchange = this._ondurationChange.bind(this);
    this.player.ontimeupdate = this._onTime.bind(this);
    this.player.onpause = this._onPause.bind(this);
    this.player.onended = this._onEnd.bind(this);
    this.player.oncanplaythrough = this._canPlayThrough.bind(this);
    this.player.onloadeddata = this._onLoadedData.bind(this);
    this._pauseTimeout = this._pauseTimeout.bind(this);

    this.player.addEventListener('progress', _ => this._buffer());

    appendElements(this.shadowRoot, [
      elementStyles,
      this.player
    ]);
  }

  /**
   * attribute has changed 
   * @private
   * 
   * @param {String} name
   * @param {*} _
   * @param {String} newVal
   */
  attributeChangedCallback(name, _, newVal) {
    if (['playing', 'full-screen'].includes(name)) {
      const miniUI = qs('.background', this.shadowRoot);
      if (miniUI) miniUI.toggleAttribute(name);
    } else if (name === 'alt-css') {
      const linkEl = qs('link', this.shadowRoot);
      if (linkEl) linkEl.href = newVal;
    }
  }

  /**
   * play the given album with option to pass an index of desired starting point
   * @function
   * @public
   * 
   * @fires playlist-reset
   * 
   * @param {Object} playObj album or podcast object
   * @param {String} playObj.artist artist name
   * @param {String} playObj.title album / podcast title
   * @param {Array} playObj.tracks list of tracks / podcast episodes
   * @param {Number} [ndx] track index to begin playing
   * 
   * @returns {void}
   */
  playAlbum(playObj, ndx) {
    this.dispatchEvent(new CustomEvent('playlist-reset', undefined));
    this.playing = ndx || 0;
    this.playlist = playObj.tracks.slice();
    if (!this.playlist.length) return;
    this._setSrc();
  }

  /**
   * play a specific playlist index number
   * @function
   * @public
   * 
   * @param {Number} ndx 
   * 
   * @returns {void}
   */
  playNdx(ndx) {
    this.playing = ndx;
    this._setSrc();
  }

  /**
   * add an albums tracks to the playlist
   * 
   * @param {Object} albumInfo 
   * @param {String} albumInfo.artist artist name
   * @param {String} albumInfo.title album / podcast title
   * @param {Array} albumInfo.tracks list of tracks / podcast episodes
   * 
   * @returns {void}
   */
  addToPlaylist(albumInfo) {
    const tracksToAdd = albumInfo.tracks.slice();
    tracksToAdd.forEach(track => this.playlist.push(track));
  }

  /**
   * callback for <music-library> favorite added event
   * 
   * @param {Object} data 
   * @returns {void}
   */
  favorite(data) {
    // if favorited album is the currently playing ablum
    if (this.artist === data.artist && this.album === data.title) {
      // toggle state
      this.isFavorite = data.favorite;

      // update UI
      this._fullScreenFavoriteDisplay();
    }
  }

  /**
   * sets src attribute, 
   * @private
   * 
   * @returns {Void}
   */
  async _setSrc() {
    this._updatePlaylistUI();
    const nowPlaying = this.playlist[this.playing];

    this._updatePlaying(nowPlaying);

    if (!nowPlaying) return;

    this.artist = nowPlaying.artist;
    this.album = nowPlaying.album;
    this.art = nowPlaying.art;
    this.isFavorite = this.musicLibrary.albumIsFavorite(this.artist, this.album);

    const ext = getFileExtension(nowPlaying.path);
    const path = dropFirstFolder(nowPlaying.path.replace(ext, 'lrc-raw'));

    if (await pywebview.api.lrcraw_exists(path)) {
      // maybe a feature to time stamp lrc files
    }

    this._cacheImage(this.art);

    const fullScreenArt = qs('#fsart', qs('#fbg > .img-wrapper', this.shadowRoot));
    if (fullScreenArt) fullScreenArt.src = this.art;

    const currentlyPlayingText = qs('#info', this.shadowRoot);
    if (currentlyPlayingText) currentlyPlayingText.textContent = `${nowPlaying.artist} - ${nowPlaying.title}`;

    this.player.src = nowPlaying.path;
    this.player.load();
    this.player.play();
    // await pywebview.api.scrobble_start(nowPlaying);
  }

  /**
   * updates the playlist ui with now playing indicator
   * @function
   * @private
   * 
   * @returns {void}
   */
  async _updatePlaylistUI() {
    const popUp = qs('.popup', this.shadowRoot);
    if (!popUp) return;
    const trackElements = qsa('.track', popUp);
    trackElements.forEach(track => track.removeAttribute('playing'));
    await sleep(100);
    trackElements[this.playing].toggleAttribute('playing');
    trackElements[this.playing].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * minimize fullscreen Ui and display header buttons
   * @public
   * 
   * @returns {void}
   */
  minimize() {
    const fullScreenBackground = qs('#fbg', this.shadowRoot);
    if (!fullScreenBackground) return;

    const popUp = qs('.popup', this.shadowRoot);
    if (popUp) {
      qs('img', this.shadowRoot).style.removeProperty('filter');
      popUp.addEventListener('transitionend', _ => popUp.remove());
      popUp.removeAttribute('open');
    }


    qs('#fbg', this.shadowRoot).addEventListener('transitionend', _ => {
      let headerButtons;
      if (qs('audiosync-pages').getAttribute('selected') === '0') {
        headerButtons = qsa('.music');
      } else {
        headerButtons = qsa('.podcast');
      }
      headerButtons.forEach(el => {
        el.style.removeProperty('display');
        fadeIn(el);
      });
    });

    this.removeAttribute('full-screen');
  }

  /**
   * creates & opens fullscreen ui with album art and gradient background
   * @function
   * @public
   * 
   * @returns {void}
   */
  async fullScreen() {
    if (qs('#fbg', this.shadowRoot)) return

    // art
    const img = ce('img');
    img.id = 'fsart';
    img.src = this.art;

    const imgWrapper = ce('div');
    imgWrapper.classList.add('img-wrapper');
    imgWrapper.appendChild(img);

    // background 
    const fullScreenBackground = ce('div');
    fullScreenBackground.id = 'fbg';

    // playlist fab
    const playlistButton = ce('audiosync-fab');
    playlistButton.id = 'playlist';
    playlistButton.appendChild(svgIcon('list'));
    playlistButton.onClick(ev => this._playlistPopup(ev));
    playlistButton.title = 'Playlist';
    this.fab = playlistButton;

    const favoriteToggleButton = ce('audiosync-small-button');
    favoriteToggleButton.id = 'favorite';
    this._fullScreenFavoriteDisplay(favoriteToggleButton);
    favoriteToggleButton.appendChild(svgIcon('favorite'));
    favoriteToggleButton.onClick(_ => {
      this.isFavorite = !this.isFavorite;
      this._fullScreenFavoriteDisplay();
      // pass favorite to library
      this.musicLibrary.favoriteAlbum(this.artist, this.album);
    });

    appendElements(fullScreenBackground, [
      favoriteToggleButton,
      imgWrapper,
      playlistButton
    ]);

    this.shadowRoot.appendChild(fullScreenBackground);

    fullScreenBackground.addEventListener('transitionend', e => {
      if (e.target.id === 'fbg' && !this.hasAttribute('full-screen')) {
        e.target.remove();
      }
    });

    await sleep(100);

    let postionFab = _ => {
      let offset = 190;

      if (window.innerHeight > 750 && window.innerWidth > 620) offset += 50;

      if (window.innerHeight > 850 && window.innerWidth > 720) offset += 50;

      let centerX = elementWidth(fullScreenBackground) / 2;
      let centerY = elementHeight(fullScreenBackground) / 2;
      let newPositionX = centerX + offset;
      let newPositionY = centerY + offset;

      playlistButton.style.left = newPositionX + 'px';
      playlistButton.style.top = newPositionY + 'px';

      this.style.setProperty('--fab-home', `${(window.innerHeight / 2) - 190}px`);
    };

    postionFab();
    window.addEventListener('resize', _ => postionFab());

    qsa('.music, .podcast').forEach(async el => {
      await fadeOut(el);
      el.style.display = 'none';
    });


    qs('scroll-element').offScreen();
    toggleAttribute(this, 'full-screen');
  }

  /**
   * creates the UI mini player
   * @function
   * @private
   * 
   * @returns {HTMLElement}
   */
  _miniUI() {
    // play progress bar
    const progressBar = ce('div');
    progressBar.classList.add('progress');

    // buffered amount bar
    const bufferBar = ce('div');
    bufferBar.classList.add('buffered');

    // click location for scrobbeling through a track **broken on windows**
    const clickStrip = ce('div');
    clickStrip.classList.add('click-strip');
    clickStrip.addEventListener('click', e => {
      // time left
      const duration = this.player.duration;
      // window data
      const rect = clickStrip.getBoundingClientRect();;
      // click x
      const relativeX = e.clientX - rect.left;
      // time in seconds to set player.currentTime
      const newPosition = (relativeX / rect.width) * duration;
      // set time
      this.player.currentTime = newPosition;
    });

    // fullscreen toggle
    const fullScreenToggleButton = ce('audiosync-small-button');
    fullScreenToggleButton.id = 'expand';
    fullScreenToggleButton.appendChild(svgIcon('expand'));
    fullScreenToggleButton.onClick(_ => {
      if (this.hasAttribute('full-screen')) {
        this.minimize();
        return;
      }
      this.fullScreen();
    });

    // previous track button 
    const prevoiusTrackButton = ce('audiosync-small-button');
    prevoiusTrackButton.id = 'back';
    prevoiusTrackButton.style.display = 'none';
    prevoiusTrackButton.appendChild(svgIcon('previous'));
    prevoiusTrackButton.onClick(_ => {
      // block back if beginning of playlist
      if (this.playing <= 0) return;
      // incriment this.playing index
      this.playing--;
      // update src attribute
      this._setSrc();
    });


    const playPauseIcon = svgIcon('pause');
    qs('path', playPauseIcon).id = 'playIcon';

    // play button
    const playPauseButton = ce('audiosync-small-button');
    playPauseButton.id = 'play';
    playPauseButton.appendChild(playPauseIcon);
    playPauseButton.onClick(_ => {
      // toggle playback
      if (this.player.paused) {
        this.player.play();
      } else {
        this.player.pause();
      }
    });

    // next track button
    const nextTrackButton = ce('audiosync-small-button');
    nextTrackButton.id = 'next';
    nextTrackButton.appendChild(svgIcon('next'));
    nextTrackButton.onClick(_ => {
      // block next if end of playlist
      if (this.playing >= this.playlist.length) return;
      // incriment this.playing index
      this.playing++;
      // change src attribute
      this._setSrc();
    });

    // elapsed time
    const durationText = ce('div');
    durationText.id = 'duration';
    durationText.addEventListener('click', _ => this.elapsedTime = !this.elapsedTime);

    // artist / title
    const currentlyPlayingText = ce('div');
    currentlyPlayingText.id = 'info';
    currentlyPlayingText.textContent = `${this.playlist[this.playing].artist} - ${this.playlist[this.playing].title}`;

    // mini player UI background
    const miniPlayerBackground = ce('div');
    miniPlayerBackground.classList.add('background');
    appendElements(miniPlayerBackground, [
      clickStrip,
      bufferBar,
      progressBar,
      fullScreenToggleButton,
      currentlyPlayingText,
      durationText,
      prevoiusTrackButton,
      playPauseButton,
      nextTrackButton
    ]);
    return miniPlayerBackground;
  }

  /**
   * creates a popup option dialog with track information
   * @function
   * @private
   * 
   * @returns {void}
   */
  async _playlistPopup() {
    if (qs('.popup', this.shadowRoot)) return;

    const popUp = ce('div');
    popUp.classList.add('popup');
    for (let i = 0; i < this.playlist.length; i++) {
      const trackWrapper = ce('div');
      trackWrapper.classList.add('track');
      if (this.playing === i) {
        trackWrapper.toggleAttribute('playing');
      }

      const trackNumber = ce('div');
      trackNumber.textContent = this.playlist[i].track;

      const trackTitle = ce('div');
      trackTitle.textContent = this.playlist[i].title;

      appendElements(trackWrapper, [
        trackNumber,
        trackTitle
      ]);

      trackWrapper.addEventListener('click', () => {
        if (i === this.playing) return;
        this.playing = i;
        this._setSrc();
      });

      popUp.appendChild(trackWrapper);
    }

    const fullScreenBackground = qs('#fbg', this.shadowRoot);
    fullScreenBackground.appendChild(popUp);
    await sleep(100);

    const tEnd = _ => {
      popUp.removeEventListener('transitionend', tEnd);
      qs('img', this.shadowRoot).style.filter = 'blur(10px)';
    };
    popUp.addEventListener('transitionend', tEnd);
    toggleAttribute(popUp, 'open');

    const ELEMENT_CLICKED = async _ => {
      popUp.addEventListener('transitionend', _ => popUp.remove());
      popUp.removeAttribute('open');
      qs('img', this.shadowRoot).style.removeProperty('filter');
    };

    fullScreenBackground.addEventListener('click', ELEMENT_CLICKED);
    await sleep(50);

    const playingEl = qs('div[playing]', popUp);
    playingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /**
   * toggles display of favorite button in fullscreen
   * @function
   * @private
   * 
   * @returns {void}
   */
  _fullScreenFavoriteDisplay(favEl) {
    let fullscreenFavoriteToggleButton = qs('#favorite', this.shadowRoot);
    if (!fullscreenFavoriteToggleButton && !favEl) return;

    if (favEl) fullscreenFavoriteToggleButton = favEl;

    if (this.isFavorite === null || this.isFavorite === undefined) {
      fullscreenFavoriteToggleButton.style.opacity = 0;
      fullscreenFavoriteToggleButton.style.display = 'none';
    } else if (this.isFavorite) {
      fullscreenFavoriteToggleButton.title = 'Unfavorite';
      fullscreenFavoriteToggleButton.style.opacity = 1;
      fullscreenFavoriteToggleButton.style.display = 'block';
    } else {
      fullscreenFavoriteToggleButton.title = 'Favorite';
      fullscreenFavoriteToggleButton.style.opacity = 0.2;
      fullscreenFavoriteToggleButton.style.display = 'block';
    }
  }

  /**
   * emits an event updating ui with currently playing information
   * @function
   * @private
   * 
   * @fires now-playing
   * 
   * @param {Object} nowPlaying 
   * @param {String} nowPlaying.artist artist name
   * @param {String} nowPlaying.title album / podcast title
   * @param {Array} nowPlaying.tracks list of tracks / podcast episodes
   * 
   * @returns {void}
   */
  _updatePlaying(nowPlaying) {
    this.dispatchEvent(new CustomEvent('now-playing', {
      detail: { playing: nowPlaying }
    }));
  }


  /**
   * loads an image and gets a palette from the image
   * @function
   * @private
   * 
   * @fires image-loaded
   * 
   * @param {String} url
   * 
   * @returns {void} 
   */
  _cacheImage(url) {
    // cache image & color;
    const img = ce('img');
    img.src = url;
    img.onload = _ => {
      const palette = new ColorThief().getPalette(img, 20);

      // pop color 
      const popNdx = findGoldieLocksColor(palette) || 0;
      const popRgb = palette[popNdx];
      const popRgbString = popRgb.toString();
      const popHex = rgbToHex(...popRgb);
      
      // gradient top color
      const topNdx = findGoldieLocksColor(palette, popNdx) || 1;
      const topRgb = palette[topNdx];
      const gradientHex = rgbToHex(...topRgb);

      // color palette
      this.palette = {
        fab: `rgb(${popRgbString})`, // fab / accent color
        fabContrast: getContrastColor(popHex),
        variable: popRgbString, // for css variable avaliable @ --pop-color
        top: `rgb(${topRgb.toString()})`, // player art gradient top color
        gradientContrast: getContrastColor(gradientHex) // contrasting color to color used on buttons at top of gradient
      };

      this.style.setProperty('--gradient-top', this.palette.top);
      this.style.setProperty('--gradient-contrast', this.palette.gradientContrast);

      this.dispatchEvent(new CustomEvent('image-loaded', {
        detail: { palette: this.palette }
      }));

      img.remove();
    };
  }

  /**
   * move buffered progress bar
   * @function
   * @private
   * 
   * @returns {void}
   */
  _buffer() {
    if (!this.player.src) return;

    const bufferBar = qs('.buffered', this.shadowRoot);
    if (!bufferBar) return;

    if (this.player.buffered.length > 0) {
      const bufferedEnd = this.player.buffered.end(this.player.buffered.length - 1);
      bufferBar.style.transform = `translateX(-${100 - calcPercentage(bufferedEnd, this.player.duration)}%)`;
    } else {
      bufferBar.style.transform = `translateX(-100%)`;
    }
  }

  /**
   * pause timeout callback
   * @function
   * @private
   * 
   * @returns {void}
   */
  _pauseTimeout() {
    this.minimize();
    this.removeAttribute('playing');
    this.playlist = [];
    this.playing = 0;
    this.player.src = '';
    this._setSrc();
  }

  /**
   * audio metadata loaded
   * @function
   * @private
   * 
   * @returns {Void}
   */
  async _onMetaData() {
    if (qs('.background', this.shadowRoot)) return;
    this.shadowRoot.appendChild(this._miniUI());
    await sleep(100);
    toggleAttribute(this, 'playing');
  }

  /**
   * @function
   * @private
   * 
   * @returns {Void}
   */
  _onLoadedData() { }

  /**
   * @function
   * @private
   * 
   * @returns {Void}
   */
  _canPlayThrough() { }

  /**
   * playback has began
   * @function
   * @private
   * 
   * @returns {Void}
   */
  _onPlay() {
    if (this._pauseTimer) {
      clearTimeout(this._pauseTimer);
      this._pauseTimer = 0;
    }
  }

  /**
   * audio is playing
   * @function
   * @private
   * 
   * @returns {Void}
   */
  _onPlaying() {
    const icon = qs('#playIcon', qs('#play', this.shadowRoot));
    if (icon) icon.setAttribute('d', this.pauseIcon.d);
  }

  /**
   * audio is paused
   * @function
   * @private
   * 
   * @returns {Void}
   */
  _onPause() {
    const icon = qs('#playIcon', qs('#play', this.shadowRoot));
    if (icon) icon.setAttribute('d', this.playIcon.d);
    this._pauseTimer = setTimeout(this._pauseTimeout, 30000);
  }

  /**
   * playback has ended
   * @function
   * @private
   * 
   * @returns {Void}
   */
  _onEnd() {
    if (!this.playlist[this.playing + 1]) {
      this._pauseTimeout();
      return;
    }
    this.playing++;
    this._setSrc();
    // pywebview.api.scrobble_end(this.playlist[this.playing - 1]);
  }

  /**
   * @private
   * 
   * @returns {Void}
   */
  _onStalled() { }

  /**
   * @private
   * 
   * @returns {Void}
   */
  _onWaiting() { }

  /**
   * @private
   * 
   * @returns {Void}
   */
  _ondurationChange() { }

  /**
   * audio.currentTime has changed
   * @function
   * @private
   * 
   * @returns {Void}
   */
  _onTime() {
    const prevoiusTrackButton = qs('#back', this.shadowRoot);
    if (prevoiusTrackButton) {
      if (!this.playlist[this.playing - 1]) {
        prevoiusTrackButton.style.display = 'none';
      } else {
        prevoiusTrackButton.style.removeProperty('display');
      }
    }

    const nextTrackButton = qs('#next', this.shadowRoot);
    if (nextTrackButton) {
      if (!this.playlist[this.playing + 1]) {
        nextTrackButton.style.display = 'none';
      } else {
        nextTrackButton.style.removeProperty('display');
      }
    }

    const durationText = qs('#duration', this.shadowRoot);
    const playProgress = qs('.progress', this.shadowRoot);

    if (playProgress) requestAnimationFrame(_ => {
      playProgress.style.transform = `translateX(-${100 - calcPercentage(this.player.currentTime, this.player.duration)}%)`;
    });

    if (!this.elapsedTime) {
      if (durationText) durationText.textContent = mmss(this.player.duration - this.player.currentTime);
    } else {
      if (durationText) durationText.textContent = mmss(this.player.currentTime);
    }

    debounce(_ => this._updatePlaying(this.playlist[this.playing]));
  }
}
customElements.define('audiosync-player', AudioPlayer);